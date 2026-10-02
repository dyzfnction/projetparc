// Connexion à la base de données SQLite, partagée par toute l'application.

import { open, Database } from "sqlite"; // "sqlite" : surcouche qui permet d'utiliser async/await
import sqlite3 from "sqlite3"; // "sqlite3" : le pilote qui lit réellement le fichier .db

// Connexion unique, gardée en mémoire : null tant qu'elle n'a pas été ouverte
let db: Database | null = null;

/**
 * Renvoie la connexion à la base SQLite.
 * Au premier appel, la base est ouverte ; aux appels suivants, on réutilise la même connexion
 * (inutile d'ouvrir le fichier à chaque requête).
 */
export async function getDb(): Promise<Database> {
  // Première utilisation : on ouvre la base
  if (!db) {
    db = await open({
      filename: process.env.DATABASE_NAME || "database.db", // chemin défini dans .env.local
      driver: sqlite3.Database, // pilote utilisé pour lire le fichier
    });

    // SQLite désactive les clés étrangères par défaut : il faut les activer à chaque connexion,
    // sinon les "ON DELETE CASCADE" (suppression des réservations liées) ne fonctionnent pas
    await db.exec("PRAGMA foreign_keys = ON;");
  }

  // On renvoie la connexion (nouvelle ou déjà ouverte)
  return db;
}
