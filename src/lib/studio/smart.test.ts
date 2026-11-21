import { describe, expect, it } from "vitest";
import { SvgPath, curvedTextPath, localToUtcMs, moonPhase, moonPhaseName, skyAt, tracePhotoMask } from "@/lib/studio/smart";
import { PHOTO_MASKS } from "@/lib/studio/doc";

describe("astronomy", () => {
  it("converts local time to UTC", () => {
    expect(new Date(localToUtcMs("2024-01-01T05:30", 330)).toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });

  it("puts Polaris due north at the observer's latitude", () => {
    // Polaris (J2000): RA 37.95°, Dec +89.26°. Seen from Delhi (28.6° N) it sits ~28.6° up, due north.
    const { points } = skyAt([37.95, 89.26, 2], [], "2024-06-01T22:00", 330, 28.6139, 77.209);
    expect(points).toHaveLength(1);
    const expectedR = Math.tan(((90 - 28.6) / 2) * (Math.PI / 180));
    expect(Math.hypot(points[0].x, points[0].y)).toBeCloseTo(expectedR, 1);
    expect(points[0].y).toBeLessThan(0); // north is up
    expect(Math.abs(points[0].x)).toBeLessThan(0.05);
  });

  it("hides stars below the horizon", () => {
    // The south celestial pole is never visible from Delhi.
    expect(skyAt([0, -89, 1], [], "2024-06-01T22:00", 330, 28.6, 77.2).points).toHaveLength(0);
  });

  it("knows full and new moons", () => {
    // Full moon 25 Jan 2024 17:54 UTC; new moon 11 Jan 2024 11:57 UTC.
    expect(moonPhase("2024-01-25T23:24", 330).phase).toBeCloseTo(0.5, 1);
    expect(moonPhase("2024-01-25T23:24", 330).illumination).toBeGreaterThan(0.98);
    expect(moonPhase("2024-01-11T17:27", 330).illumination).toBeLessThan(0.02);
    expect(moonPhaseName(0.5)).toBe("Full moon");
  });
});

describe("shapes", () => {
  it("traces every photo mask as a closed path", () => {
    for (const mask of PHOTO_MASKS) {
      const p = new SvgPath();
      tracePhotoMask(p, mask, 0, 0, 100, 120, 10);
      expect(p.d.startsWith("M")).toBe(true);
      expect(p.d.endsWith("Z")).toBe(true);
    }
  });

  it("curves text into an arc that fits its box", () => {
    const straight = curvedTextPath(400, 40, 0);
    expect(straight.d).toBe("M0 40L400 40");
    const arch = curvedTextPath(400, 40, 60);
    expect(arch.d).toMatch(/^M[\d.]+ [\d.]+A/);
    expect(arch.height).toBeGreaterThan(40);
    const smile = curvedTextPath(400, 40, -60);
    expect(smile.d).toContain(" 0 0 0 "); // sweeps the other way
  });
});
