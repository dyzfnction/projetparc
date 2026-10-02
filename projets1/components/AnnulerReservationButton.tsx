// Bouton "Annuler" affiché à côté de chaque réservation à venir, dans /mon-compte/reservations.

"use client"; // composant client : réagit au clic et appelle l'API

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/client";

export default function AnnulerReservationButton({ reservationId }: { reservationId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // true pendant l'annulation
  const [error, setError] = useState(""); // message d'erreur éventuel

  /**
   * Demande une confirmation puis annule la réservation via DELETE /api/reservations/[id].
   */
  const handleCancel = async () => {
    if (!confirm("Annuler cette réservation ?")) return;

    setLoading(true);
    const result = await apiRequest(`/api/reservations/${reservationId}`, "DELETE");
    setLoading(false);

    // Échec : on affiche le message sous le bouton
    if (!result.ok) {
      setError(result.message);
      return;
    }

    // Succès : on recalcule la page, la réservation passe dans le groupe "Annulées"
    router.refresh();
  };

  return (
    // items-end : bouton et message alignés à droite
    <div className="flex flex-col items-end gap-1">
      <button onClick={handleCancel} disabled={loading} className="btn btn-ghost-danger">
        {loading ? "Annulation..." : "Annuler"}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
