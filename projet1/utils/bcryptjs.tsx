// Hachage et vérification des mots de passe avec bcrypt.

import "server-only"; // le hachage se fait uniquement côté serveur, jamais dans le navigateur

import bcrypt from "bcryptjs";

/**
 * Hache un mot de passe avant de l'enregistrer en base.
 * Le "10" est le coût : plus il est élevé, plus le hachage est lent (et difficile à casser).
 * Renvoie le hash, par exemple "$2b$10$...".
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return await bcrypt.hash(plainPassword, 10);
}

/**
 * Compare un mot de passe saisi avec le hash stocké en base.
 * Renvoie true si le mot de passe est correct, false sinon.
 */
export async function checkPassword(userPassword: string, dbPassword: string): Promise<boolean> {
  return await bcrypt.compare(userPassword, dbPassword);
}
