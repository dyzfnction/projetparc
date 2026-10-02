// Polices du site, chargées avec next/font.
// next/font télécharge les polices au moment du build et les sert depuis notre site :
// aucun appel à Google Fonts quand un visiteur charge la page (plus rapide).

import { Inter, Outfit } from "next/font/google";

// Police du texte courant (paragraphes, boutons, formulaires)
export const inter = Inter({
  subsets: ["latin"], // caractères latins uniquement (inclut les accents français)
  variable: "--font-inter", // crée la variable CSS --font-inter, utilisée dans globals.css
});

// Police des titres (h1, h2, h3, logo)
export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"], // graisses utilisées : moyen, semi-gras, gras
  variable: "--font-outfit", // crée la variable CSS --font-outfit
});
