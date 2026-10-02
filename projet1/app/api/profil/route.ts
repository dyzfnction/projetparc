// Route API /api/profil : modification et suppression du compte de l'utilisateur connecté.
// Appelée par components/ProfilForm.tsx (PUT) et components/DeleteAccountButton.tsx (DELETE).

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jsonError, readJson, requireUser } from "@/lib/api";
import { validateProfil } from "@/lib/validation";
import { hashPassword } from "@/utils/bcryptjs";
import { deleteCookie } from "@/utils/sessions";

/**
 * PUT /api/profil : modification du profil.
 * Corps attendu : { prenom, nom, email, motdepasse } (motdepasse vide = inchangé)
 */
export async function PUT(req: Request) {
  // 1. Il faut être connecté
  const auth = await requireUser();
  if (auth.error) return auth.error;

  // 2. Le compte administrateur est protégé : il ne peut pas être modifié depuis le site
  if (auth.user.role === "admin") {
    return jsonError("Le compte administrateur ne peut pas être modifié.", 403);
  }

  // 3. Lecture et validation des données (mot de passe facultatif)
  const body = await readJson(req);
  if (!body) return jsonError("Requête invalide.", 400);

  const result = validateProfil(body, false);
  if (!result.data) return jsonError(result.error, 400);
  const { prenom, nom, email, motdepasse } = result.data;

  const db = await getDb();

  // 4. Le nouvel email ne doit pas être déjà utilisé par un AUTRE compte (id != le nôtre)
  const existing = await db.get("SELECT id FROM users WHERE email = ? AND id != ?", email, auth.user.id);
  if (existing) return jsonError("Cet email est déjà utilisé par un autre compte.", 409);

  // 5. Mise à jour en base : avec ou sans le mot de passe
  if (motdepasse) {
    // Nouveau mot de passe fourni : on le hache avant de l'enregistrer
    await db.run(
      "UPDATE users SET prenom = ?, nom = ?, email = ?, motdepasse = ? WHERE id = ?",
      prenom, nom, email, await hashPassword(motdepasse), auth.user.id
    );
  } else {
    // Pas de nouveau mot de passe : on garde l'ancien
    await db.run(
      "UPDATE users SET prenom = ?, nom = ?, email = ? WHERE id = ?",
      prenom, nom, email, auth.user.id
    );
  }

  // 6. Réponse de succès (code 200 par défaut)
  return NextResponse.json({ message: "Profil mis à jour." });
}

/**
 * DELETE /api/profil : suppression du compte (et déconnexion).
 */
export async function DELETE() {
  // 1. Il faut être connecté
  const auth = await requireUser();
  if (auth.error) return auth.error;

  // 2. Le compte administrateur est protégé : il ne peut pas être supprimé depuis le site
  if (auth.user.role === "admin") {
    return jsonError("Le compte administrateur ne peut pas être supprimé.", 403);
  }

  // 3. Suppression du compte. Ses réservations sont supprimées automatiquement (ON DELETE CASCADE)
  const db = await getDb();
  await db.run("DELETE FROM users WHERE id = ?", auth.user.id);

  // 4. Suppression du cookie : l'utilisateur est déconnecté
  await deleteCookie();

  return NextResponse.json({ message: "Compte supprimé." });
}
