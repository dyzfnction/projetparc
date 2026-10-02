// Gestion de la session côté serveur : cookie, utilisateur connecté, protection des pages.

import "server-only"; // empêche ce fichier d'être envoyé au navigateur (erreur à la compilation sinon)

import { cookies } from "next/headers"; // lecture / écriture des cookies dans Next.js
import { redirect } from "next/navigation"; // redirection côté serveur
import { getDb } from "@/lib/db";
import { COOKIE_NAME, SESSION_DURATION, decrypt, encrypt, type SessionData } from "@/lib/jwt";
import type { PublicUser } from "@/lib/types";

/**
 * Crée le cookie de session après une connexion ou une inscription.
 * Le cookie contient un JWT signé avec l'id de l'utilisateur.
 */
export async function createCookie(sessionData: SessionData): Promise<void> {
  const token = await encrypt(sessionData); // fabrication du JWT
  const cookie = await cookies(); // accès aux cookies de la réponse

  cookie.set(COOKIE_NAME, token, {
    httpOnly: true, // inaccessible depuis le JavaScript du navigateur (protège contre le vol du cookie)
    secure: process.env.NODE_ENV === "production", // envoyé uniquement en HTTPS en production
    sameSite: "lax", // pas envoyé par les formulaires d'autres sites (protection CSRF)
    path: "/", // valable sur tout le site
    maxAge: SESSION_DURATION, // le navigateur supprime le cookie au bout de 2 heures
  });
}

/**
 * Supprime le cookie de session (déconnexion ou suppression du compte).
 */
export async function deleteCookie(): Promise<void> {
  const cookie = await cookies();
  cookie.delete(COOKIE_NAME);
}

/**
 * Lit le cookie et renvoie les données de session, ou null si pas connecté / session expirée.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookie = await cookies();
  return await decrypt(cookie.get(COOKIE_NAME)?.value); // ?. : undefined si le cookie n'existe pas
}

/**
 * Renvoie l'utilisateur connecté (sans son mot de passe), ou null.
 * On relit la base à chaque fois : un compte supprimé ou un rôle modifié est pris en compte immédiatement.
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
  // 1. Lecture de la session
  const session = await getSession();
  if (!session) return null;

  // 2. Recherche de l'utilisateur en base à partir de l'id contenu dans le JWT
  const db = await getDb();
  const user = await db.get<PublicUser>(
    "SELECT id, prenom, nom, email, role FROM users WHERE id = ?", // "?" : valeur insérée de façon sécurisée (pas d'injection SQL)
    session.userId
  );

  // 3. db.get renvoie undefined si le compte n'existe plus : on renvoie alors null
  return user ?? null;
}

/**
 * À appeler au début d'une page réservée aux utilisateurs connectés.
 * Renvoie l'utilisateur, ou redirige vers la connexion (avec retour sur la page demandée ensuite).
 */
export async function requireUserPage(currentPath: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(currentPath)}`); // redirect() arrête la page
  return user;
}

/**
 * À appeler au début d'une page d'administration.
 * Redirige vers la connexion si pas connecté, vers "Accès refusé" si l'utilisateur n'est pas admin.
 */
export async function requireAdminPage(currentPath: string): Promise<PublicUser> {
  const user = await requireUserPage(currentPath); // d'abord : être connecté
  if (user.role !== "admin") redirect("/acces-refuse"); // ensuite : être administrateur
  return user;
}
