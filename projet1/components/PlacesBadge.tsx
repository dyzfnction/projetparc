// Badge coloré qui indique les places restantes d'une activité.
//   orange : places disponibles   violet : presque complet   rouge : complet
// Utilisé sur les cartes d'activité, la page détail et le tableau d'administration.

import clsx from "clsx";
import { pluriel } from "@/lib/format";

// Propriétés du composant
interface PlacesBadgeProps {
  restantes: number; // places encore libres
  total: number; // capacité totale de l'activité
}

export default function PlacesBadge({ restantes, total }: PlacesBadgeProps) {
  // Plus aucune place
  const complet = restantes <= 0;
  // "Presque complet" : 2 places ou moins, ou moins de 20 % de la capacité
  const presqueComplet = !complet && restantes <= Math.max(2, Math.ceil(total * 0.2));

  return (
    <span
      // Une seule des trois couleurs s'applique, selon la situation
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        complet && "bg-red-100 text-red-700",
        presqueComplet && "bg-accent-100 text-accent-600",
        !complet && !presqueComplet && "bg-primary-50 text-primary-700"
      )}
    >
      {/* Petit point de la même couleur que le texte (bg-current) */}
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {/* Texte : "Complet" ou "3 places restantes" */}
      {complet ? "Complet" : `${pluriel(restantes, "place")} restante${restantes > 1 ? "s" : ""}`}
    </span>
  );
}
