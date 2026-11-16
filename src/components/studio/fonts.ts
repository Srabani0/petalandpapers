import {
  Playfair_Display,
  Inter,
  Poppins,
  Montserrat,
  Dancing_Script,
  Great_Vibes,
  Pacifico,
  Caveat,
  Lobster,
  Bebas_Neue,
} from "next/font/google";
import type { FontKey } from "@/lib/studio/doc";

// next/font requires each loader call to be a top-level const.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "700"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"] });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });
const dancing = Dancing_Script({ subsets: ["latin"], weight: ["400", "700"] });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });
const lobster = Lobster({ subsets: ["latin"], weight: "400" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400" });

type LoadedFont = { className: string; style: { fontFamily: string } };

const def = (label: string, font: LoadedFont) => ({
  label,
  family: font.style.fontFamily,
  className: font.className,
});

/** Fonts offered in the editor. `family` is the exact CSS family Konva draws with. */
export const STUDIO_FONTS: Record<FontKey, { label: string; family: string; className: string }> = {
  playfair: def("Playfair Display", playfair),
  inter: def("Inter", inter),
  poppins: def("Poppins", poppins),
  montserrat: def("Montserrat", montserrat),
  dancing: def("Dancing Script", dancing),
  greatVibes: def("Great Vibes", greatVibes),
  pacifico: def("Pacifico", pacifico),
  caveat: def("Caveat", caveat),
  lobster: def("Lobster", lobster),
  bebas: def("Bebas Neue", bebas),
};

/**
 * Canvas text doesn't trigger web-font downloads by itself — ask the browser to
 * load every studio font (regular + bold) up front, then let the caller redraw.
 */
export async function loadStudioFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  const loads = Object.values(STUDIO_FONTS).flatMap((f) => [
    document.fonts.load(`400 32px ${f.family}`),
    document.fonts.load(`700 32px ${f.family}`),
  ]);
  await Promise.allSettled(loads);
}
