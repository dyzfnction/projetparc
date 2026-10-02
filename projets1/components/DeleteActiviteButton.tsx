// Bouton "Supprimer" d'une activité, dans le tableau d'administration (/admin/activites).

"use client"; // composant client : réagit au clic et appelle l'API

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/client";

// Propriétés : id de l'activité à supprimer et son nom (affiché dans la confirmation)
interface DeleteActiviteButtonProps {
  activiteId: number;
  nom: string;
}

export default function DeleteActiviteButton({ activiteId, nom }: DeleteActiviteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // true pendant la suppression

  /**
   * Demande une confirmation puis supprime l'activité via DELETE /api/activites/[id].
   */
  const handleDelete = async () => {
    // Action définitive : on prévient que les réservations liées seront aussi supprimées
    if (!confirm(`Supprimer « ${nom} » ? Les réservations liées seront aussi supprimées.`)) return;

    setLoading(true);
    const result = await apiRequest(`/api/activites/${activiteId}`, "DELETE");
    setLoading(false);

    if (!result.ok) alert(result.message); // en cas d'erreur, simple message d'alerte
    router.refresh(); // recalcule le tableau : la ligne supprimée disparaît
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="btn btn-ghost-danger px-4 py-1.5">
      {loading ? "..." : "Supprimer"}
    </button>
  );
}
