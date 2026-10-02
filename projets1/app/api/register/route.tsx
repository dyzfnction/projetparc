import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, readJson } from "@/lib/api";
import { validateProfil } from "@/lib/validation";
import { hashPassword } from "@/utils/bcryptjs";
import { createCookie } from "@/utils/sessions";

// POST /api/register : création d'un compte utilisateur
export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return jsonError("Requête invalide.", 400);

  // Vérification des champs (mot de passe obligatoire à l'inscription)
  const result = validateProfil(body, true);
  if (result.error) return jsonError(result.error, 400);
  const { prenom, nom, email, motdepasse } = result.data;

  const db = await getDb();

  // L'email doit être unique
  const existing = await db.get("SELECT id FROM users WHERE email = ?", email);
  if (existing) return jsonError("Un compte existe déjà avec cet email.", 409);

  // Le mot de passe est haché côté serveur avant l'enregistrement
  const hash = await hashPassword(motdepasse);
  const insert = await db.run(
    "INSERT INTO users (prenom, nom, email, motdepasse, role) VALUES (?, ?, ?, ?, 'user')",
    prenom,
    nom,
    email,
    hash
  );

  // Connexion automatique après l'inscription
  await createCookie({ userId: insert.lastID as number });

  return NextResponse.json({ message: "Compte créé." }, { status: 201 });
}
