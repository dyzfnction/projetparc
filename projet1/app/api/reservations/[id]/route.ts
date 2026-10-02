// Route API /api/reservations/[id] : annulation d'une réservation.
// Appelée par components/AnnulerReservationButton.tsx et components/ReservationPanel.tsx.

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/api";
import type { Reservation } from "@/lib/types";

/**
 * DELETE /api/reservations/[id] : annulation d'une réservation.
 * On ne supprime pas la ligne : on passe "etat" à 0, ce qui garde l'historique
 * (la réservation apparaît dans le groupe "Annulées" de l'utilisateur).
 */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/reservations/[id]">) {
  // 1. Il faut être connecté
  const auth = await requireUser();
  if (auth.error) return auth.error;

  // 2. Récupération de la réservation à partir de l'id dans l'URL (ctx.params)
  const id = Number((await ctx.params).id);
  const db = await getDb();
  const reservation = await db.get<Reservation>("SELECT * FROM reservations WHERE id = ?", id);

  if (!reservation) return jsonError("Réservation introuvable.", 404);

  // 3. On ne peut annuler que SES propres réservations (validation demandée par le sujet)
  if (reservation.user_id !== auth.user.id) {
    return jsonError("Vous ne pouvez pas annuler la réservation d'un autre utilisateur.", 403);
  }

  // 4. Déjà annulée : rien à faire
  if (reservation.etat === 0) return jsonError("Cette réservation est déjà annulée.", 400);

  // 5. Annulation : etat passe de 1 (active) à 0 (annulée), la place se libère
  await db.run("UPDATE reservations SET etat = 0 WHERE id = ?", id);

  return NextResponse.json({ message: "Réservation annulée." });
}
