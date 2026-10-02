// Formulaire de création ET de modification d'une activité (administration).
//   - sans "activite" : création  -> POST /api/activites           (page /admin/activites/nouvelle)
//   - avec "activite" : modification -> PUT /api/activites/[id]   (page /admin/activites/[id]/modifier)

"use client"; // composant client : gère la saisie, l'envoi et les messages d'erreur

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest, formToObject } from "@/lib/client";
import type { Activite, TypeActivite } from "@/lib/types";

// Propriétés du composant
interface ActiviteFormProps {
  types: TypeActivite[]; // types proposés dans la liste déroulante
  activite?: Activite; // absent = création, présent = modification (champs pré-remplis)
}

export default function ActiviteForm({ types, activite }: ActiviteFormProps) {
  const router = useRouter();
  const [error, setError] = useState(""); // message d'erreur ("" = pas d'erreur)
  const [loading, setLoading] = useState(false); // true pendant l'envoi
  const modification = Boolean(activite); // true si on modifie une activité existante

  /**
   * Envoi du formulaire vers la bonne route API, puis retour au tableau des activités.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // empêche le rechargement de la page
    setError("");
    setLoading(true);

    // Les valeurs sont envoyées en texte : le serveur les convertit en nombres et les valide
    const data = formToObject(e.currentTarget);
    const result = modification
      ? await apiRequest(`/api/activites/${activite!.id}`, "PUT", data) // "!" : on sait que activite existe ici
      : await apiRequest("/api/activites", "POST", data);

    // Échec : on affiche le message du serveur (champ manquant, places insuffisantes...)
    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // Succès : retour au tableau des activités, mis à jour
    router.push("/admin/activites");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-5 p-6 sm:p-8" noValidate>
      {/* Message d'erreur, affiché seulement s'il y en a un */}
      {error && <p className="alert-error" role="alert">{error}</p>}

      {/* Nom (pleine largeur). defaultValue : valeur actuelle en modification, vide en création */}
      <div>
        <label htmlFor="nom" className="label">Nom de l&apos;activité</label>
        <input id="nom" name="nom" defaultValue={activite?.nom} className="input" maxLength={100} required />
      </div>

      {/* Grille 2 colonnes à partir des tablettes : type, places, date, durée */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="type_id" className="label">Type</label>
          <select id="type_id" name="type_id" defaultValue={activite?.type_id ?? ""} className="input" required>
            {/* Option vide non sélectionnable : oblige à choisir un type */}
            <option value="" disabled>Choisir un type</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="places_disponibles" className="label">Nombre de places</label>
          <input
            id="places_disponibles"
            name="places_disponibles"
            type="number"
            min={1}
            defaultValue={activite?.places_disponibles ?? 10} // 10 places par défaut en création
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="datetime_debut" className="label">Date et heure de début</label>
          <input
            id="datetime_debut"
            name="datetime_debut"
            type="datetime-local" // sélecteur de date + heure, valeur au format "2026-10-15T14:00"
            defaultValue={activite?.datetime_debut}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="duree" className="label">Durée (en minutes)</label>
          {/* step={5} : les flèches du champ avancent de 5 en 5 minutes */}
          <input id="duree" name="duree" type="number" min={1} step={5} defaultValue={activite?.duree ?? 60} className="input" required />
        </div>
      </div>

      {/* Description (pleine largeur, 5 lignes) */}
      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea id="description" name="description" rows={5} defaultValue={activite?.description} className="input" />
      </div>

      {/* Boutons : enregistrer, ou revenir à la page précédente sans enregistrer */}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Enregistrement..." : modification ? "Enregistrer les modifications" : "Créer l'activité"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">Annuler</button>
      </div>
    </form>
  );
}
