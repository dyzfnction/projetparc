// Bouton "Supprimer mon compte", dans la zone de danger de la page /mon-compte.

"use client"; // composant client : réagit au clic et appelle l'API

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/client";

export default function DeleteAccountButton() {
  const router = useRouter();
  const [error, setError] = useState(""); // message d'erreur éventuel
  const [loading, setLoading] = useState(false); // true pendant la suppression

  /**
   * Demande une confirmation, supprime le compte via DELETE /api/profil, puis retourne à l'accueil.
   */
  const handleDelete = async () => {
    // Action définitive : on demande confirmation
    if (!confirm("Supprimer définitivement votre compte et toutes vos réservations ?")) return;

    setLoading(true);
    const result = await apiRequest("/api/profil", "DELETE");

    // Échec : on affiche le message du serveur
    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    // Succès : le compte est supprimé et le cookie de session aussi
    router.push("/"); // retour à l'accueil
    router.refresh(); // met à jour l'en-tête (plus connecté)
  };

  return (
    <>
      {error && <p className="alert-error mt-4">{error}</p>}
      <button onClick={handleDelete} disabled={loading} className="btn btn-danger mt-4 w-full">
        {loading ? "Suppression..." : "Supprimer mon compte"}
      </button>
    </>
  );
}
