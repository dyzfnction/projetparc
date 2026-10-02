// Carte d'une activité, utilisée dans les grilles de l'accueil et de la page Activités.
//
// Disposition :
//   ┌───────────────────────────────┐
//   │ [Type]                [Date]  │  bandeau coloré avec l'emoji du type
//   │             🛶                │
//   ├───────────────────────────────┤
//   │ Nom de l'activité             │
//   │ Description (2 lignes max)    │
//   │ 🕒 Heure · durée   [Places]   │
//   └───────────────────────────────┘
// Toute la carte est un lien vers la page détail de l'activité.

import Link from "next/link";
import type { ActiviteDetail } from "@/lib/types";
import { formatDateCourte, formatDuree, formatHeure, typeVisuel } from "@/lib/format";
import PlacesBadge from "./PlacesBadge";

export default function ActiviteCard({ activite }: { activite: ActiviteDetail }) {
  // Emoji et couleur de fond selon le type (Aventure, Nautique...)
  const visuel = typeVisuel(activite.type_nom);

  return (
    <Link
      href={`/activites/${activite.id}`}
      // group : permet de changer le style des enfants au survol de la carte (group-hover)
      // hover:-translate-y-0.5 : la carte remonte légèrement au survol
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Bandeau coloré selon le type d'activité */}
      <div className={`relative flex h-32 items-center justify-center text-5xl ${visuel.fond}`}>
        <span aria-hidden>{visuel.emoji}</span>

        {/* Nom du type, en haut à gauche (absolute : positionné par rapport au bandeau) */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">
          {activite.type_nom}
        </span>

        {/* Date en pastille, en haut à droite */}
        <span className="absolute right-3 top-3 rounded-xl bg-white px-2.5 py-1 text-center text-xs font-bold leading-tight text-primary-700 shadow-sm">
          {formatDateCourte(activite.datetime_debut)}
        </span>
      </div>

      {/* Contenu texte. flex-1 : toutes les cartes d'une ligne ont la même hauteur */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-semibold leading-snug group-hover:text-primary-700">{activite.nom}</h3>

        {/* line-clamp-2 : coupe la description après 2 lignes avec "..." */}
        <p className="line-clamp-2 text-sm text-muted">{activite.description}</p>

        {/* Bas de carte : mt-auto le pousse tout en bas */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-sm text-muted">
          <span>
            🕒 {formatHeure(activite.datetime_debut)} · {formatDuree(activite.duree)}
          </span>
          <PlacesBadge restantes={activite.places_restantes} total={activite.places_disponibles} />
        </div>
      </div>
    </Link>
  );
}
