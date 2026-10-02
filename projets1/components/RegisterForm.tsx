// Formulaire d'inscription (prénom, nom, email, mot de passe + confirmation), affiché sur /register.

"use client"; // composant client : gère la saisie, l'envoi et les messages d'erreur

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest, formToObject } from "@/lib/client";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState(""); // message d'erreur ("" = pas d'erreur)
  const [loading, setLoading] = useState(false); // true pendant l'envoi

  /**
   * Envoi du formulaire : vérifications, appel de /api/register, puis redirection.
   */
  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // empêche le rechargement de la page

    // Récupération des valeurs saisies
    const { prenom, nom, email, motdepasse, confirmation } = formToObject(e.currentTarget);

    // Vérifications rapides côté navigateur, pour un retour immédiat (le serveur revérifie tout)
    if (!prenom.trim() || !nom.trim() || !email.trim() || !motdepasse) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    if (motdepasse.length < PASSWORD_MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
      return;
    }
    if (motdepasse !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    // Le mot de passe est envoyé tel quel (en HTTPS en production) et haché par le serveur.
    // La confirmation n'est pas envoyée : elle sert seulement à la vérification ci-dessus.
    const result = await apiRequest("/api/register", "POST", { prenom, nom, email, motdepasse });

    // Échec (email déjà utilisé...) : on affiche le message du serveur
    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // Succès : l'utilisateur est connecté automatiquement par le serveur
    router.push("/activites");
    router.refresh(); // met à jour l'en-tête (connecté)
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
      {/* Message d'erreur, affiché seulement s'il y en a un */}
      {error && <p className="alert-error" role="alert">{error}</p>}

      {/* Prénom et nom côte à côte à partir des tablettes, l'un sous l'autre sur mobile */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prenom" className="label">Prénom</label>
          <input type="text" name="prenom" id="prenom" autoComplete="given-name" placeholder="John" className="input" maxLength={50} required />
        </div>
        <div>
          <label htmlFor="nom" className="label">Nom</label>
          <input type="text" name="nom" id="nom" autoComplete="family-name" placeholder="Doe" className="input" maxLength={50} required />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input type="email" name="email" id="email" autoComplete="email" placeholder="john.doe@gmail.com" className="input" required />
      </div>
      <div>
        <label htmlFor="motdepasse" className="label">Mot de passe</label>
        <input type="password" name="motdepasse" id="motdepasse" autoComplete="new-password" className="input" minLength={PASSWORD_MIN_LENGTH} required />
        <p className="mt-1 text-xs text-muted">{PASSWORD_MIN_LENGTH} caractères minimum.</p>
      </div>
      <div>
        <label htmlFor="confirmation" className="label">Confirmer le mot de passe</label>
        <input type="password" name="confirmation" id="confirmation" autoComplete="new-password" className="input" required />
      </div>

      {/* Bouton désactivé pendant l'envoi */}
      <button type="submit" disabled={loading} className="btn btn-primary mt-2 py-3">
        {loading ? "Création du compte..." : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">Connectez-vous</Link>
      </p>
    </form>
  );
}
