// Formulaire de connexion (email + mot de passe), affiché sur la page /login.

"use client"; // composant client : gère la saisie, l'envoi et les messages d'erreur

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest, formToObject } from "@/lib/client";

/**
 * redirect : page où aller après la connexion (ex : la page d'une activité qu'on voulait réserver).
 */
export default function LoginForm({ redirect }: { redirect: string }) {
  const router = useRouter();
  const [error, setError] = useState(""); // message d'erreur ("" = pas d'erreur)
  const [loading, setLoading] = useState(false); // true pendant l'envoi

  /**
   * Envoi du formulaire : vérification des champs, appel de /api/login, puis redirection.
   */
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // empêche le rechargement de la page (comportement par défaut d'un formulaire)

    // Récupération des valeurs saisies (grâce aux attributs "name" des champs)
    const { email, motdepasse } = formToObject(e.currentTarget);

    // Vérification rapide avant d'appeler le serveur
    if (!email.trim() || !motdepasse) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    setLoading(true);
    const result = await apiRequest("/api/login", "POST", { email, motdepasse });

    // Échec (mauvais mot de passe...) : on affiche le message du serveur
    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // Succès : le cookie de session a été créé par le serveur
    router.push(redirect); // retour à la page demandée
    router.refresh(); // met à jour l'en-tête (connecté)
  };

  return (
    // noValidate : désactive les bulles d'erreur du navigateur, on affiche nos propres messages
    <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
      {/* Message d'erreur, affiché seulement s'il y en a un */}
      {error && <p className="alert-error" role="alert">{error}</p>}

      <div>
        <label htmlFor="email" className="label">Email</label>
        <input type="email" name="email" id="email" autoComplete="email" placeholder="john.doe@gmail.com" className="input" required />
      </div>
      <div>
        <label htmlFor="motdepasse" className="label">Mot de passe</label>
        <input type="password" name="motdepasse" id="motdepasse" autoComplete="current-password" className="input" required />
      </div>

      {/* Bouton désactivé pendant l'envoi, pour éviter les doubles clics */}
      <button type="submit" disabled={loading} className="btn btn-primary mt-2 py-3">
        {loading ? "Connexion..." : "Se connecter"}
      </button>

      <p className="text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-primary-600 hover:underline">Inscrivez-vous</Link>
      </p>
    </form>
  );
}
