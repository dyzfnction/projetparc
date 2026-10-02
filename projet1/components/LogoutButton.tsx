// Bouton "Déconnexion" affiché dans l'en-tête quand on est connecté.

"use client"; // composant client : il réagit au clic et appelle l'API

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/client";

export default function LogoutButton() {
  const router = useRouter(); // permet de changer de page depuis le code
  const [loading, setLoading] = useState(false); // true pendant la déconnexion (bouton désactivé)

  /**
   * Au clic : supprime le cookie de session via l'API, puis retourne à l'accueil.
   */
  const handleLogout = async () => {
    setLoading(true);
    await apiRequest("/api/logout", "POST"); // le serveur supprime le cookie
    router.push("/"); // retour à l'accueil
    router.refresh(); // recalcule la page pour mettre à jour l'en-tête (plus connecté)
  };

  return (
    <button onClick={handleLogout} disabled={loading} className="btn btn-secondary">
      {/* Texte différent pendant le chargement */}
      {loading ? "..." : "Déconnexion"}
    </button>
  );
}
