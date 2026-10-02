// Formulaire de modification du profil (page /mon-compte), pré-rempli avec les données actuelles.
// Le changement de mot de passe est facultatif : laissé vide, l'ancien mot de passe est conservé.

"use client"; // composant client : gère la saisie, l'envoi et les messages

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest, formToObject } from "@/lib/client";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";
import type { PublicUser } from "@/lib/types";

export default function ProfilForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null); // succès ou erreur
  const [loading, setLoading] = useState(false); // true pendant l'envoi

  /**
   * Envoi du formulaire : vérification du mot de passe, appel de PUT /api/profil.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // empêche le rechargement de la page
    const form = e.currentTarget; // on garde le formulaire pour vider les mots de passe ensuite
    const { prenom, nom, email, motdepasse, confirmation } = formToObject(form);

    // Mot de passe facultatif : on ne le vérifie que s'il est rempli
    if (motdepasse && motdepasse.length < PASSWORD_MIN_LENGTH) {
      setMessage({ ok: false, texte: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.` });
      return;
    }
    if (motdepasse !== confirmation) {
      setMessage({ ok: false, texte: "Les deux mots de passe ne correspondent pas." });
      return;
    }

    setLoading(true);
    const result = await apiRequest("/api/profil", "PUT", { prenom, nom, email, motdepasse });
    setMessage({ ok: result.ok, texte: result.message }); // affiche "Profil mis à jour." ou l'erreur
    setLoading(false);

    if (result.ok) {
      // On vide les champs mot de passe après l'enregistrement
      form.motdepasse.value = "";
      form.confirmation.value = "";
      router.refresh(); // met à jour le prénom affiché dans l'en-tête
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Message de succès (orange clair) ou d'erreur (rouge) */}
      {message && (
        <p className={message.ok ? "alert-success" : "alert-error"} role="status">{message.texte}</p>
      )}

      {/* Prénom et nom côte à côte à partir des tablettes. defaultValue : valeur actuelle pré-remplie */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prenom" className="label">Prénom</label>
          <input type="text" name="prenom" id="prenom" defaultValue={user.prenom} className="input" maxLength={50} required />
        </div>
        <div>
          <label htmlFor="nom" className="label">Nom</label>
          <input type="text" name="nom" id="nom" defaultValue={user.nom} className="input" maxLength={50} required />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input type="email" name="email" id="email" defaultValue={user.email} className="input" required />
      </div>

      {/* Bloc encadré pour le changement de mot de passe (fieldset + legend = groupe de champs) */}
      <fieldset className="mt-2 rounded-xl border border-line p-4">
        <legend className="px-2 text-sm font-semibold">Changer de mot de passe (facultatif)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="motdepasse" className="label">Nouveau mot de passe</label>
            <input type="password" name="motdepasse" id="motdepasse" autoComplete="new-password" className="input" />
          </div>
          <div>
            <label htmlFor="confirmation" className="label">Confirmation</label>
            <input type="password" name="confirmation" id="confirmation" autoComplete="new-password" className="input" />
          </div>
        </div>
      </fieldset>

      {/* self-start : le bouton garde sa largeur au lieu de prendre toute la ligne */}
      <button type="submit" disabled={loading} className="btn btn-primary self-start">
        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
