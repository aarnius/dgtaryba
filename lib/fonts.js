// Šriftai atsiunčiami build'o metu ir rodomi iš mūsų serverio, todėl
// lankytojų naršyklės nesikreipia į Google (BDAR: IP adresas nekeliauja trečiai šaliai)
import { Abril_Fatface, Bricolage_Grotesque, Figtree, JetBrains_Mono, Playfair_Display, Rubik, Shrikhand } from "next/font/google";


export const abril = Abril_Fatface({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-abril", display: "swap" });
export const bricolage = Bricolage_Grotesque({ weight: ["700", "800"], subsets: ["latin", "latin-ext"], variable: "--font-bricolage", display: "swap" });
export const figtree = Figtree({ weight: ["400", "500", "600", "700", "800"], subsets: ["latin", "latin-ext"], variable: "--font-figtree", display: "swap" });
export const mono = JetBrains_Mono({ weight: ["500", "700"], subsets: ["latin", "latin-ext"], variable: "--font-mono", display: "swap" });
export const playfair = Playfair_Display({ weight: ["700", "800"], style: ["normal", "italic"], subsets: ["latin", "latin-ext"], variable: "--font-playfair", display: "swap" });
export const rubik = Rubik({ weight: "800", subsets: ["latin", "latin-ext"], variable: "--font-rubik", display: "swap" });
export const shrikhand = Shrikhand({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-shrikhand", display: "swap" });

export const fontVars = [abril, bricolage, figtree, mono, playfair, rubik, shrikhand].map((f) => f.variable).join(" ");
