// En-tête du site, affiché en haut de toutes les pages (placé dans app/layout.tsx).
//
// Disposition :  [Logo]      [Menu selon le profil]      [Compte + Déconnexion]  ou  [Connexion] [Inscription]
//
// Menu affiché :
//   - visiteur       : Activités
//   - utilisateur    : Activités, Mes réservations
//   - administrateur : Tableau de bord, Gérer les activités, Voir le site

import Link from "next/link";
import clsx from "clsx"; // permet d'assembler des classes CSS selon des conditions
import { getCurrentUser } from "@/utils/sessions";
import NavLink from "./NavLink";
import LogoutButton from "./LogoutButton";

/**
 * Composant serveur (async) : il lit directement l'utilisateur connecté depuis le cookie.
 */
export default async function Header() {
  // Utilisateur connecté, ou null pour un visiteur
  const user = await getCurrentUser();

  return (
    // sticky top-0 : l'en-tête reste collé en haut quand on fait défiler la page
    // bg-cream/90 + backdrop-blur : fond légèrement transparent avec effet de flou
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      {/* flex + justify-between : logo à gauche, menu au centre, compte à droite.
          flex-wrap : sur petit écran, les blocs passent à la ligne au lieu de déborder */}
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        {/* Logo : ramène à l'accueil */}
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary-700">
          {/* Pastille ronde avec un triangle (aria-hidden : ignorée par les lecteurs d'écran) */}
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-primary-600 text-lg text-white">
            ▲
          </span>
          Bois de Vincennes
        </Link>

        {/* Menu différent selon le profil : visiteur, utilisateur ou administrateur */}
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {user?.role === "admin" ? (
            // Menu administrateur
            <>
              <NavLink href="/admin" exact>Tableau de bord</NavLink>
              <NavLink href="/admin/activites">Gérer les activités</NavLink>
              <NavLink href="/activites">Voir le site</NavLink>
            </>
          ) : (
            // Menu visiteur et utilisateur ("Mes réservations" seulement si connecté)
            <>
              <NavLink href="/activites">Activités</NavLink>
              {user && <NavLink href="/mon-compte/reservations">Mes réservations</NavLink>}
            </>
          )}
        </nav>

        {/* Partie droite : compte connecté, ou boutons de connexion / inscription */}
        <div className="flex items-center gap-2">
          {user ? (
            // Connecté : lien vers le compte + bouton de déconnexion
            <>
              <Link
                href="/mon-compte"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium hover:bg-primary-50"
              >
                {/* Pastille avec l'initiale du prénom : foncée pour l'admin, claire pour un utilisateur */}
                <span
                  className={clsx(
                    "grid size-8 place-items-center rounded-full font-semibold",
                    user.role === "admin" ? "bg-accent-900 text-white" : "bg-accent-100 text-accent-600"
                  )}
                >
                  {user.prenom.charAt(0).toUpperCase()}
                </span>
                {/* Prénom + rôle en dessous */}
                <span className="flex flex-col leading-tight">
                  {user.prenom}
                  <span className="text-xs font-normal text-muted">
                    {user.role === "admin" ? "Administrateur" : "Mon compte"}
                  </span>
                </span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            // Visiteur : connexion et inscription
            <>
              <Link href="/login" className="btn btn-secondary">
                Connexion
              </Link>
              <Link href="/register" className="btn btn-primary">
                Inscription
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
