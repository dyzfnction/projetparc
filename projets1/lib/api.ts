// Fonctions utilitaires partagées par toutes les routes API (dossier app/api).

import "server-only"; // utilisé uniquement côté serveur

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/sessions";
import type { PublicUser } from "@/lib/types";

/**
 * Crée une réponse d'erreur JSON au format { message } avec le code HTTP voulu
 * (400 = requête invalide, 401 = pas connecté, 403 = interdit, 404 = introuvable, 409 = conflit).
 */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/**
 * Lit le corps JSON d'une requête.
 * Renvoie un objet, ou null si le corps est vide ou n'est pas du JSON valide (évite un plantage).
 */
export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await req.json();
    // On n'accepte qu'un objet (pas un nombre, une chaîne ou null)
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    // JSON invalide
    return null;
  }
}

// Résultat d'une vérification de droits :
// - soit { user } : l'utilisateur a le droit, on peut continuer
// - soit { error } : une réponse d'erreur à renvoyer directement
type AuthResult = { user: PublicUser; error?: never } | { user?: never; error: NextResponse };

/**
 * Vérifie qu'un utilisateur est connecté.
 * Utilisation dans une route : const auth = await requireUser(); if (auth.error) return auth.error;
 */
export async function requireUser(): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) return { error: jsonError("Vous devez être connecté.", 401) };
  return { user };
}

/**
 * Vérifie que l'utilisateur connecté est administrateur.
 */
export async function requireAdmin(): Promise<AuthResult> {
  // D'abord : être connecté
  const result = await requireUser();
  if (result.error) return result;

  // Ensuite : avoir le rôle admin
  if (result.user.role !== "admin") return { error: jsonError("Accès réservé aux administrateurs.", 403) };

  return result;
}
