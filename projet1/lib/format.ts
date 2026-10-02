// Fonctions d'affichage : dates, heures, durées, pluriels et visuels des types d'activité.
//
// Les dates sont stockées sans fuseau horaire ("2026-10-15T14:00").
// On les lit en UTC et on les affiche en UTC : le résultat est ainsi exactement le même
// côté serveur et côté navigateur (sinon React signale une erreur d'hydratation).

/**
 * Transforme une date texte de la base en objet Date.
 * replace(" ", "T") gère aussi le format "2026-10-01 20:00:00" de CURRENT_TIMESTAMP.
 * Le "Z" final indique à JavaScript de lire la date en UTC.
 */
function toDate(iso: string): Date {
  return new Date(`${iso.replace(" ", "T")}Z`);
}

/**
 * Date longue en français. Exemple : "samedi 10 octobre 2026"
 */
export function formatDate(iso: string): string {
  return toDate(iso).toLocaleDateString("fr-FR", {
    weekday: "long", // "samedi"
    day: "numeric", // "10"
    month: "long", // "octobre"
    year: "numeric", // "2026"
    timeZone: "UTC",
  });
}

/**
 * Date courte. Exemple : "10 oct."
 */
export function formatDateCourte(iso: string): string {
  return toDate(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
}

/**
 * Heure. Exemple : "14:00"
 */
export function formatHeure(iso: string): string {
  return toDate(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

/**
 * Durée lisible à partir d'un nombre de minutes.
 * Exemples : 45 -> "45 min", 60 -> "1 h", 90 -> "1 h 30"
 */
export function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60); // nombre d'heures entières
  const m = minutes % 60; // minutes restantes

  if (h === 0) return `${m} min`; // moins d'une heure
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`; // padStart : "5" devient "05"
}

// Emoji et couleur de fond (classe Tailwind) associés à chaque type d'activité
const VISUELS: Record<string, { emoji: string; fond: string }> = {
  Aventure: { emoji: "🧗", fond: "bg-primary-100" },
  Nautique: { emoji: "🛶", fond: "bg-sky-100" },
  Détente: { emoji: "🧘", fond: "bg-violet-100" },
  Enfants: { emoji: "🏕️", fond: "bg-accent-100" },
  Sport: { emoji: "🎯", fond: "bg-rose-100" },
};

/**
 * Renvoie l'emoji et la couleur de fond d'un type d'activité.
 * Pour un type ajouté plus tard et absent de la liste, on renvoie un visuel par défaut.
 */
export function typeVisuel(typeNom: string): { emoji: string; fond: string } {
  return VISUELS[typeNom] ?? { emoji: "🌲", fond: "bg-primary-50" };
}

/**
 * Accorde un mot au pluriel. Exemples : (1, "place") -> "1 place", (3, "place") -> "3 places"
 */
export function pluriel(n: number, mot: string): string {
  return `${n} ${mot}${Math.abs(n) > 1 ? "s" : ""}`;
}
