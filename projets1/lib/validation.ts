// Validation des données envoyées par les formulaires (utilisé par les routes API).
// Chaque fonction renvoie soit { data } (données nettoyées et typées), soit { error } (message à afficher).
// Ce fichier n'utilise rien de spécifique au serveur : les formulaires client l'importent aussi
// (pour PASSWORD_MIN_LENGTH).

// Résultat d'une validation : soit les données, soit une erreur (jamais les deux)
export type ValidationResult<T> = { data: T; error?: never } | { data?: never; error: string };

// Format d'un email : "texte@texte.texte" sans espace
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Format renvoyé par un <input type="datetime-local"> : "2026-10-15T14:00"
const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

// Longueur minimale d'un mot de passe (partagée avec les formulaires)
export const PASSWORD_MIN_LENGTH = 6;

/**
 * Renvoie la valeur sous forme de chaîne sans espaces au début et à la fin,
 * ou "" si ce n'est pas une chaîne.
 */
function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Convertit une valeur en nombre entier, ou NaN ("Not a Number") si ce n'est pas un entier.
 */
function int(value: unknown): number {
  const n = typeof value === "number" ? value : Number(str(value));
  return Number.isInteger(n) ? n : NaN;
}

// Données d'un profil (inscription ou modification)
export interface ProfilInput {
  prenom: string;
  nom: string;
  email: string;
  motdepasse: string; // "" = ne pas changer le mot de passe (modification du profil)
}

/**
 * Valide les champs d'inscription ou de modification du profil.
 * passwordRequired : true à l'inscription, false en modification (mot de passe facultatif).
 */
export function validateProfil(body: Record<string, unknown>, passwordRequired: boolean): ValidationResult<ProfilInput> {
  // Nettoyage des valeurs reçues
  const data: ProfilInput = {
    prenom: str(body.prenom),
    nom: str(body.nom),
    email: str(body.email).toLowerCase(), // email en minuscules pour éviter les doublons "Jean@" / "jean@"
    motdepasse: typeof body.motdepasse === "string" ? body.motdepasse : "", // pas de trim : un espace peut être voulu
  };

  // Vérifications, dans l'ordre : le premier problème trouvé est renvoyé
  if (!data.prenom || !data.nom || !data.email) return { error: "Tous les champs sont obligatoires." };
  if (data.prenom.length > 50 || data.nom.length > 50) return { error: "Le nom et le prénom font 50 caractères maximum." };
  if (!EMAIL_REGEX.test(data.email)) return { error: "L'adresse email n'est pas valide." };
  if (passwordRequired && !data.motdepasse) return { error: "Le mot de passe est obligatoire." };
  if (data.motdepasse && data.motdepasse.length < PASSWORD_MIN_LENGTH) {
    return { error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` };
  }

  // Tout est valide
  return { data };
}

// Données du formulaire d'activité
export interface ActiviteInput {
  nom: string;
  type_id: number;
  places_disponibles: number;
  description: string;
  datetime_debut: string;
  duree: number;
}

/**
 * Valide les champs du formulaire d'activité (création et modification).
 * Les nombres arrivent sous forme de texte depuis le formulaire : ils sont convertis ici.
 */
export function validateActivite(body: Record<string, unknown>): ValidationResult<ActiviteInput> {
  // Nettoyage et conversion des valeurs reçues
  const data: ActiviteInput = {
    nom: str(body.nom),
    type_id: int(body.type_id),
    places_disponibles: int(body.places_disponibles),
    description: str(body.description),
    datetime_debut: str(body.datetime_debut),
    duree: int(body.duree),
  };

  // Vérifications
  if (!data.nom) return { error: "Le nom est obligatoire." };
  if (data.nom.length > 100) return { error: "Le nom fait 100 caractères maximum." };
  if (Number.isNaN(data.type_id)) return { error: "Choisissez un type d'activité." };
  if (Number.isNaN(data.places_disponibles) || data.places_disponibles < 1) {
    return { error: "Le nombre de places doit être un entier supérieur à 0." };
  }
  if (!DATETIME_REGEX.test(data.datetime_debut)) return { error: "La date de début n'est pas valide." };
  if (Number.isNaN(data.duree) || data.duree < 1) return { error: "La durée doit être un nombre de minutes supérieur à 0." };

  // Tout est valide
  return { data };
}
