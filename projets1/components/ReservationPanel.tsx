// Encart de réservation affiché sur la page détail d'une activité (colonne de droite).
// Il affiche une seule chose, selon la situation (testées dans cet ordre) :
//   1. déjà inscrit      -> message + bouton "Annuler ma réservation"
//   2. activité passée   -> message "déjà eu lieu"
//   3. activité complète -> message "complète"
//   4. pas connecté      -> bouton "Se connecter pour réserver"
//   5. sinon             -> bouton "Réserver ma place"
// (L'administrateur ne voit pas cet encart : voir app/activites/[id]/page.tsx)

"use client"; // composant client : il réagit aux clics et appelle l'API

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/client";

// Propriétés transmises par la page (calculées côté serveur)
interface ReservationPanelProps {
  activiteId: number;
  connecte: boolean; // l'utilisateur est-il connecté ?
  reservationId: number | null; // réservation active de l'utilisateur pour cette activité (null si aucune)
  complet: boolean; // plus de places
  passee: boolean; // l'activité a déjà commencé
}

export default function ReservationPanel({ activiteId, connecte, reservationId, complet, passee }: ReservationPanelProps) {
  const router = useRouter();
  const pathname = usePathname(); // adresse de la page, pour y revenir après la connexion
  const [loading, setLoading] = useState(false); // true pendant un appel API
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null); // retour de l'API

  /**
   * Envoie la réservation, affiche le résultat, puis rafraîchit la page (places restantes à jour).
   */
  const reserver = async () => {
    setLoading(true);
    const result = await apiRequest("/api/reservations", "POST", { activite_id: activiteId });
    setMessage({ ok: result.ok, texte: result.message });
    setLoading(false);
    router.refresh(); // recalcule la page côté serveur : l'encart passe en "déjà inscrit"
  };

  /**
   * Annule la réservation après confirmation, puis rafraîchit la page.
   */
  const annuler = async () => {
    // confirm() affiche une boîte "OK / Annuler" ; on s'arrête si l'utilisateur refuse
    if (!reservationId || !confirm("Annuler votre réservation pour cette activité ?")) return;
    setLoading(true);
    const result = await apiRequest(`/api/reservations/${reservationId}`, "DELETE");
    setMessage({ ok: result.ok, texte: result.message });
    setLoading(false);
    router.refresh();
  };

  // Message de retour de l'API (vert si succès, rouge si erreur), ou rien
  const feedback = message && <p className={`mt-3 ${message.ok ? "alert-success" : "alert-error"}`}>{message.texte}</p>;

  // 1. Déjà inscrit : on propose l'annulation (sauf si l'activité est passée)
  if (reservationId) {
    return (
      <>
        <p className="alert-success">✅ Vous êtes inscrit à cette activité.</p>
        {!passee && (
          <button onClick={annuler} disabled={loading} className="btn btn-ghost-danger mt-3 w-full">
            {loading ? "Annulation..." : "Annuler ma réservation"}
          </button>
        )}
        <Link href="/mon-compte/reservations" className="btn btn-secondary mt-3 w-full">
          Voir mes réservations
        </Link>
      </>
    );
  }

  // 2. Activité passée et 3. activité complète : simple message, pas de bouton
  if (passee) return <><p className="alert-error">Cette activité a déjà eu lieu.</p>{feedback}</>;
  if (complet) return <><p className="alert-error">Cette activité est complète.</p>{feedback}</>;

  // 4. Pas connecté : lien vers la connexion, avec retour sur cette page ensuite
  if (!connecte) {
    return (
      <>
        <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="btn btn-primary w-full py-3">
          Se connecter pour réserver
        </Link>
        <p className="mt-3 text-center text-sm text-muted">
          Pas de compte ?{" "}
          <Link href="/register" className="font-semibold text-primary-600 hover:underline">Inscrivez-vous</Link>
        </p>
      </>
    );
  }

  // 5. Connecté, places disponibles : bouton de réservation
  return (
    <>
      <button onClick={reserver} disabled={loading} className="btn btn-primary w-full py-3">
        {loading ? "Réservation..." : "Réserver ma place"}
      </button>
      {feedback}
    </>
  );
}
