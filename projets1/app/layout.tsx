// Layout racine ("root layout") : le gabarit commun à TOUTES les pages du site.
//
// Disposition de chaque page :
//
//   ┌──────────────────────────────────────────────────────────┐
//   │ <Header />  logo + menu + compte    (components/Header)  │  identique partout,
//   ├──────────────────────────────────────────────────────────┤  adapté au profil
//   │                                                          │  (visiteur / user / admin)
//   │ <main>{children}</main>                                  │
//   │   contenu de la page visitée (fichier page.tsx du        │  change à chaque page
//   │   dossier correspondant à l'URL)                         │
//   │                                                          │
//   ├──────────────────────────────────────────────────────────┤
//   │ <Footer />  infos + liens           (components/Footer)  │  identique partout
//   └──────────────────────────────────────────────────────────┘
//
// Ce que {children} affiche selon l'URL :
//   /                              -> app/page.tsx                          accueil
//   /activites                     -> app/activites/page.tsx                liste + recherche
//   /activites/3                   -> app/activites/[id]/page.tsx           détail + réservation
//   /login, /register              -> app/login, app/register               connexion, inscription
//   /mon-compte                    -> app/mon-compte/page.tsx               profil      } dans le layout
//   /mon-compte/reservations       -> app/mon-compte/reservations/page.tsx  réservations} app/mon-compte/layout.tsx
//   /admin                         -> app/admin/page.tsx                    statistiques       } dans le layout
//   /admin/activites               -> app/admin/activites/page.tsx          tableau des activités} app/admin/layout.tsx
//   /admin/activites/nouvelle      -> création d'une activité
//   /admin/activites/3/modifier    -> modification d'une activité
//   /acces-refuse                  -> page affichée aux non-admins sur /admin
//   toute autre URL                -> app/not-found.tsx                     page 404
//
// Les sous-layouts (mon-compte, admin) s'insèrent à la place de {children} et ajoutent
// leur propre titre et sous-menu autour de leurs pages.

import type { Metadata } from "next";
import "./globals.css"; // styles globaux (Tailwind + thème), chargés une seule fois pour tout le site

import { inter, outfit } from "@/fonts/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Metadata par défaut (balises <title> et <meta name="description">).
// Chaque page définit son propre titre, inséré dans le modèle : "Mes réservations | Bois de Vincennes"
export const metadata: Metadata = {
  title: {
    template: "%s | Bois de Vincennes", // %s est remplacé par le titre de la page
    default: "Bois de Vincennes - Réservez vos activités nature", // titre si la page n'en définit pas
  },
  description: "Accrobranche, canoë, yoga, escalade... Découvrez et réservez les activités du Bois de Vincennes.",
};

/**
 * Gabarit HTML commun : <html>, <body>, en-tête, contenu de la page, pied de page.
 * "children" contient la page en cours d'affichage.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr" // langue de la page (lecteurs d'écran, traduction automatique, SEO)
      className={`${inter.variable} ${outfit.variable} h-full antialiased`} // variables des polices + lissage du texte
      suppressHydrationWarning // ignore les attributs ajoutés par certaines extensions du navigateur
    >
      {/* flex-col + min-h-full : le pied de page reste en bas même si la page est courte */}
      <body className="flex min-h-full flex-col font-sans">
        {/* En haut : en-tête (logo, menu, compte) */}
        <Header />

        {/* Au milieu : contenu de la page. flex-1 = prend toute la hauteur disponible */}
        <main className="flex-1">{children}</main>

        {/* En bas : pied de page */}
        <Footer />
      </body>
    </html>
  );
}
