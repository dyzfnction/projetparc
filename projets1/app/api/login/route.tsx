import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, readJson } from "@/lib/api";
import { checkPassword } from "@/utils/bcryptjs";
import { createCookie } from "@/utils/sessions";
import type { User } from "@/lib/types";

// POST /api/login : connexion avec email + mot de passe
export async function POST(req: Request) {
  const body = await readJson(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const motdepasse = typeof body?.motdepasse === "string" ? body.motdepasse : "";

  if (!email || !motdepasse) return jsonError("Tous les champs sont obligatoires.", 400);

  const db = await getDb();
  const user = await db.get<Pick<User, "id" | "motdepasse">>(
    "SELECT id, motdepasse FROM users WHERE email = ?",
    email
  );

  // Même message que l'email existe ou non : on ne révèle pas quels comptes existent
  if (!user || !(await checkPassword(motdepasse, user.motdepasse))) {
    return jsonError("Email ou mot de passe incorrect.", 401);
  }

  await createCookie({ userId: user.id });
  return NextResponse.json({ message: "Connecté." });
}
