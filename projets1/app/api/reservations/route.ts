// Route API /api/reservations : création d'une réservation.
// Appelée par components/ReservationPanel.tsx (bouton "Réserver ma place").

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, readJson, requireUser } from "@/lib/api";
import { getActiviteById, getReservationActive, nowIso } from "@/lib/queries";

/**
 * POST /api/reservations : réservation d'une activité par l'utilisateur connecté.
 * Corps attendu : { activite_id }
 */
export async function POST(req: Request) {
  // 1. Il faut être connecté
  const auth = await requireUser();
  if (auth.error) return auth.error;

  // 2. Les administrateurs gèrent le parc : ils ne réservent pas d'activités
  if (auth.user.role === "admin") {
    return jsonError("Un compte administrateur ne peut pas réserver d'activité.", 403);
  }

  // 3. L'activité doit exister
  const body = await readJson(req);
  const activite = await getActiviteById(Number(body?.activite_id));
  if (!activite) return jsonError("Activité introuvable.", 404);

  // 4. Règles métier
  // L'activité ne doit pas avoir déjà commencé
  if (activite.datetime_debut <= nowIso()) {
    return jsonError("Cette activité a déjà commencé, elle ne peut plus être réservée.", 400);
  }
  // Il doit rester au moins une place (validation demandée par le sujet)
  if (activite.places_restantes <= 0) {
    return jsonError("Cette activité est complète.", 409);
  }
  // L'utilisateur ne doit pas l'avoir déjà réservée
  if (await getReservationActive(auth.user.id, activite.id)) {
    return jsonError("Vous avez déjà réservé cette activité.", 409);
  }

  // 5. Insertion en une seule requête : la ligne n'est ajoutée QUE s'il reste une place.
  // Ça évite de dépasser la capacité si deux personnes réservent la dernière place au même moment.
  const db = await getDb();
  const insert = await db.run(
    `INSERT INTO reservations (user_id, activite_id)
     SELECT ?, a.id FROM activites a
     WHERE a.id = ?
       AND a.places_disponibles > (
         SELECT COUNT(*) FROM reservations r WHERE r.activite_id = a.id AND r.etat = 1
       )`,
    auth.user.id,
    activite.id
  );

  // insert.changes = nombre de lignes ajoutées : 0 si la dernière place vient d'être prise
  if (!insert.changes) return jsonError("Cette activité est complète.", 409);

  // 6. Succès : code 201 ("créé") et id de la nouvelle réservation
  return NextResponse.json({ message: "Réservation confirmée.", id: insert.lastID }, { status: 201 });
}
