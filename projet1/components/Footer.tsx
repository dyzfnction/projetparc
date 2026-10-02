// Pied de page, affiché en bas de toutes les pages (placé dans app/layout.tsx).
//
// Disposition (3 colonnes sur ordinateur, empilées sur mobile) :
//   [Nom du parc + description]   [Horaires]   [Liens selon le profil]
//   ------------------------------------------------------------------
//                      © année · mention "site non officiel"

import Link from "next/link";
import { getCurrentUser } from "@/utils/sessions";

/**
 * Composant serveur : les liens de la 3e colonne dépendent de l'utilisateur connecté.
 */
export default async function Footer() {
  // Utilisateur connecté, ou null pour un visiteur
  const user = await getCurrentUser();

  return (
    // mt-20 : grand espace au-dessus ; fond noir chaud et texte gris clair
    <footer className="mt-20 bg-ink text-stone-300">
      {/* Grille : 1 colonne sur mobile, 3 colonnes à partir des tablettes (sm:grid-cols-3) */}
      <div className="container-page grid gap-8 py-10 sm:grid-cols-3">
        {/* Colonne 1 : présentation */}
        <div>
          <p className="font-display text-lg font-bold text-white">Bois de Vincennes</p>
          <p className="mt-2 text-sm text-stone-400">
            Activités nature et sensations à Paris 12e, pour toute la famille.
          </p>
        </div>

        {/* Colonne 2 : horaires */}
        <div className="text-sm">
          <p className="font-semibold text-white">Horaires</p>
          <p className="mt-2 text-stone-400">Tous les jours de 9h à 19h</p>
        </div>

        {/* Colonne 3 : liens, différents selon le profil */}
        <nav className="flex flex-col gap-1 text-sm">
          <p className="font-semibold text-white">Liens</p>
          <Link href="/activites" className="mt-1 hover:text-primary-500">Toutes les activités</Link>

          {/* Visiteur */}
          {!user && (
            <>
              <Link href="/login" className="hover:text-primary-500">Connexion</Link>
              <Link href="/register" className="hover:text-primary-500">Créer un compte</Link>
            </>
          )}

          {/* Utilisateur */}
          {user?.role === "user" && (
            <>
              <Link href="/mon-compte/reservations" className="hover:text-primary-500">Mes réservations</Link>
              <Link href="/mon-compte" className="hover:text-primary-500">Mon compte</Link>
            </>
          )}

          {/* Administrateur */}
          {user?.role === "admin" && (
            <>
              <Link href="/admin" className="hover:text-primary-500">Tableau de bord</Link>
              <Link href="/admin/activites" className="hover:text-primary-500">Gérer les activités</Link>
            </>
          )}
        </nav>
      </div>

      {/* Ligne du bas, séparée par une fine bordure */}
      <p className="border-t border-white/10 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Bois de Vincennes · Projet étudiant Next.js, site non officiel
      </p>
    </footer>
  );
}
