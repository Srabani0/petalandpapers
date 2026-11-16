"use client";

import { useCallback, useMemo, useReducer } from "react";
import type { DesignDoc, DesignNode } from "@/lib/studio/doc";

const HISTORY_LIMIT = 80;
const COALESCE_MS = 700;

type Updater = (doc: DesignDoc) => DesignDoc;

interface State {
  doc: DesignDoc;
  past: DesignDoc[];
  future: DesignDoc[];
  selectedId: string | null;
  /** Bumps on every change to the doc — used for dirty tracking and preview refresh. */
  revision: number;
  lastKey: string | null;
  lastAt: number;
}

type Action =
  | { type: "commit"; update: Updater; key?: string; select?: string | null }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "select"; id: string | null };

function keepSelection(doc: DesignDoc, id: string | null) {
  return id && doc.nodes.some((n) => n.id === id) ? id : null;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "commit": {
      // Updaters run against the *current* doc, so async work (uploads) can
      // never overwrite edits the user made while it was in flight.
      const next = action.update(state.doc);
      if (next === state.doc) {
        return action.select !== undefined ? { ...state, selectedId: keepSelection(next, action.select) } : state;
      }
      const now = Date.now();
      // Slider drags / typing fire many updates for one logical edit: fold
      // them into a single undo step while the same control keeps changing.
      const coalesce = action.key != null && action.key === state.lastKey && now - state.lastAt < COALESCE_MS;
      return {
        ...state,
        doc: next,
        past: coalesce ? state.past : [...state.past, state.doc].slice(-HISTORY_LIMIT),
        future: [],
        selectedId: keepSelection(next, action.select !== undefined ? action.select : state.selectedId),
        revision: state.revision + 1,
        lastKey: action.key ?? null,
        lastAt: now,
      };
    }
    case "undo": {
      const prev = state.past.at(-1);
      if (!prev) return state;
      return {
        ...state,
        doc: prev,
        past: state.past.slice(0, -1),
        future: [state.doc, ...state.future],
        selectedId: keepSelection(prev, state.selectedId),
        revision: state.revision + 1,
        lastKey: null,
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) return state;
      return {
        ...state,
        doc: next,
        past: [...state.past, state.doc],
        future: state.future.slice(1),
        selectedId: keepSelection(next, state.selectedId),
        revision: state.revision + 1,
        lastKey: null,
      };
    }
    case "select":
      return state.selectedId === action.id ? state : { ...state, selectedId: action.id, lastKey: null };
  }
}

export function useDesignState(initialDoc: DesignDoc) {
  const [state, dispatch] = useReducer(reducer, {
    doc: initialDoc,
    past: [],
    future: [],
    selectedId: null,
    revision: 0,
    lastKey: null,
    lastAt: 0,
  });

  const commit = useCallback(
    (update: Updater, opts: { key?: string; select?: string | null } = {}) =>
      dispatch({ type: "commit", update, key: opts.key, select: opts.select }),
    [],
  );
  const select = useCallback((id: string | null) => dispatch({ type: "select", id }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  const updateNode = useCallback(
    (id: string, patch: Partial<DesignNode>, key?: string) =>
      commit(
        (d) => ({ ...d, nodes: d.nodes.map((n) => (n.id === id ? ({ ...n, ...patch } as DesignNode) : n)) }),
        { key: key ? `${id}:${key}` : undefined },
      ),
    [commit],
  );

  const addNode = useCallback(
    (node: DesignNode) => commit((d) => ({ ...d, nodes: [...d.nodes, node] }), { select: node.id }),
    [commit],
  );

  const removeNode = useCallback(
    (id: string) => commit((d) => ({ ...d, nodes: d.nodes.filter((n) => n.id !== id) })),
    [commit],
  );

  /** Moves a node in the stacking order: +1 forward, -1 backward, "top" / "bottom". */
  const reorder = useCallback(
    (id: string, to: 1 | -1 | "top" | "bottom") =>
      commit((d) => {
        const nodes = [...d.nodes];
        const index = nodes.findIndex((n) => n.id === id);
        if (index === -1) return d;
        const [node] = nodes.splice(index, 1);
        const target =
          to === "top" ? nodes.length : to === "bottom" ? 0 : Math.max(0, Math.min(nodes.length, index + to));
        if (target === index) return d;
        nodes.splice(target, 0, node);
        return { ...d, nodes };
      }),
    [commit],
  );

  const selected = useMemo(
    () => state.doc.nodes.find((n) => n.id === state.selectedId) ?? null,
    [state.doc.nodes, state.selectedId],
  );

  return {
    doc: state.doc,
    selected,
    selectedId: state.selectedId,
    revision: state.revision,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    commit,
    select,
    undo,
    redo,
    updateNode,
    addNode,
    removeNode,
    reorder,
  };
}

export type DesignState = ReturnType<typeof useDesignState>;
