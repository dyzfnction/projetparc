import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, readJson, requireAdmin } from "@/lib/api";
import { validateActivite } from "@/lib/validation";
import { getActiviteById } from "@/lib/queries";

// PUT /api/activites/[id] : modification d'une activité (administrateurs uniquement)
export async function PUT(req: Request, ctx: RouteContext<"/api/activites/[id]">) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const activite = await getActiviteById(Number((await ctx.params).id));
  if (!activite) return jsonError("Activité introuvable.", 404);

  const body = await readJson(req);
  if (!body) return jsonError("Requête invalide.", 400);

  const result = validateActivite(body);
  if (!result.data) return jsonError(result.error, 400);
  const a = result.data;

  const db = await getDb();

  const type = await db.get("SELECT id FROM type_activite WHERE id = ?", a.type_id);
  if (!type) return jsonError("Ce type d'activité n'existe pas.", 400);

  // On ne peut pas descendre la capacité sous le nombre de places déjà réservées
  const reservees = activite.places_disponibles - activite.places_restantes;
  if (a.places_disponibles < reservees) {
    return jsonError(`Impossible : ${reservees} places sont déjà réservées pour cette activité.`, 400);
  }

  await db.run(
    `UPDATE activites
     SET nom = ?, type_id = ?, places_disponibles = ?, description = ?, datetime_debut = ?, duree = ?
     WHERE id = ?`,
    a.nom, a.type_id, a.places_disponibles, a.description, a.datetime_debut, a.duree, activite.id
  );

  return NextResponse.json({ message: "Activité modifiée." });
}

// DELETE /api/activites/[id] : suppression d'une activité (administrateurs uniquement)
export async function DELETE(_req: Request, ctx: RouteContext<"/api/activites/[id]">) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const activite = await getActiviteById(Number((await ctx.params).id));
  if (!activite) return jsonError("Activité introuvable.", 404);

  // Les réservations liées sont supprimées automatiquement (ON DELETE CASCADE)
  const db = await getDb();
  await db.run("DELETE FROM activites WHERE id = ?", activite.id);

  return NextResponse.json({ message: "Activité supprimée." });
}
