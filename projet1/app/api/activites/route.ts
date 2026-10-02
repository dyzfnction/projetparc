// Route API /api/activites : création d'une activité.
// Appelée par components/ActiviteForm.tsx (page /admin/activites/nouvelle).

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, readJson, requireAdmin } from "@/lib/api";
import { validateActivite } from "@/lib/validation";

/**
 * POST /api/activites : création d'une activité (administrateurs uniquement).
 * Corps attendu : { nom, type_id, places_disponibles, description, datetime_debut, duree }
 */
export async function POST(req: Request) {
  // 1. Il faut être administrateur (sinon erreur 401 ou 403)
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  // 2. Lecture et validation des données
  const body = await readJson(req);
  if (!body) return jsonError("Requête invalide.", 400);

  const result = validateActivite(body);
  if (!result.data) return jsonError(result.error, 400);
  const a = result.data; // données validées et converties

  const db = await getDb();

  // 3. Le type choisi doit exister dans la table type_activite
  const type = await db.get("SELECT id FROM type_activite WHERE id = ?", a.type_id);
  if (!type) return jsonError("Ce type d'activité n'existe pas.", 400);

  // 4. Insertion de l'activité
  const insert = await db.run(
    `INSERT INTO activites (nom, type_id, places_disponibles, description, datetime_debut, duree)
     VALUES (?, ?, ?, ?, ?, ?)`,
    a.nom, a.type_id, a.places_disponibles, a.description, a.datetime_debut, a.duree
  );

  // 5. Succès : code 201 ("créé") et id de la nouvelle activité
  return NextResponse.json({ message: "Activité créée.", id: insert.lastID }, { status: 201 });
}
