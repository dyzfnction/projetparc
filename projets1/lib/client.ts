// Fonctions utilisées par les composants client (dans le navigateur) pour appeler les routes API.

// Méthodes HTTP utilisées par nos routes : création (POST), modification (PUT), suppression (DELETE)
export type HttpMethod = "POST" | "PUT" | "DELETE";

// Résultat simplifié d'un appel API
export interface ApiResult {
  ok: boolean; // true si la requête a réussi (code HTTP 2xx)
  message: string; // message à afficher à l'utilisateur
  id?: number; // id de l'élément créé, si la route en renvoie un
}

/**
 * Envoie une requête JSON à une route API et renvoie { ok, message }.
 * Ne lève jamais d'erreur : les composants n'ont pas besoin de try/catch.
 */
export async function apiRequest(url: string, method: HttpMethod, body?: unknown): Promise<ApiResult> {
  try {
    // Envoi de la requête (le corps est transformé en texte JSON)
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    // Lecture de la réponse JSON ; objet vide si la réponse n'est pas du JSON
    const data: { message?: string; id?: number } = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      // Message de la route, ou message par défaut s'il n'y en a pas
      message: data.message ?? (response.ok ? "Opération réussie." : "Une erreur est survenue."),
      id: data.id,
    };
  } catch {
    // Erreur réseau (serveur arrêté, pas de connexion...)
    return { ok: false, message: "Impossible de contacter le serveur." };
  }
}

/**
 * Récupère les champs d'un formulaire sous forme d'objet { nomDuChamp: valeur }.
 * Exemple : <input name="email"> donne { email: "..." }
 */
export function formToObject(form: HTMLFormElement): Record<string, string> {
  const data: Record<string, string> = {};

  // FormData lit tous les champs du formulaire qui ont un attribut "name"
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") data[key] = value; // on ignore les fichiers
  });

  return data;
}
