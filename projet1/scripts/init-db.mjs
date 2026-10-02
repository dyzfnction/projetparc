// Script d'initialisation de la base de données SQLite.
// Usage : npm run db:init   (lit DATABASE_NAME dans .env.local)
// ATTENTION : supprime les tables existantes puis les recrée avec des données d'exemple.
//
// Étapes : 1. ouverture de la base  2. suppression des tables  3. création des tables
//          4. insertion des données d'exemple (comptes, types, activités, réservations)

import { open } from "sqlite";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";

// Même fichier que celui utilisé par l'application (voir .env.local)
const DATABASE_NAME = process.env.DATABASE_NAME || "database.db";

// 1. Ouverture de la base (le fichier est créé s'il n'existe pas)
const db = await open({ filename: DATABASE_NAME, driver: sqlite3.Database });

// Active les clés étrangères (désactivées par défaut dans SQLite)
await db.exec("PRAGMA foreign_keys = ON;");

// 2. Suppression des anciennes tables, dans l'ordre inverse des dépendances
// (les réservations dépendent des activités, qui dépendent des types)
// db.exec : exécute une ou plusieurs requêtes SQL sans paramètres
await db.exec(`
  DROP TABLE IF EXISTS reservations;
  DROP TABLE IF EXISTS activites;
  DROP TABLE IF EXISTS type_activite;
  DROP TABLE IF EXISTS users;
`);

// 3. Création des 4 tables demandées par le sujet.
// REFERENCES : clé étrangère vers une autre table ; CHECK : règle vérifiée par SQLite à chaque insertion
await db.exec(`
  CREATE TABLE users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    prenom     TEXT NOT NULL,
    nom        TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    motdepasse TEXT NOT NULL, -- mot de passe haché avec bcrypt
    role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
  );

  CREATE TABLE type_activite (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL UNIQUE
  );

  CREATE TABLE activites (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    nom                TEXT NOT NULL,
    type_id            INTEGER NOT NULL REFERENCES type_activite(id),
    places_disponibles INTEGER NOT NULL CHECK (places_disponibles >= 0), -- capacité totale
    description        TEXT NOT NULL DEFAULT '',
    datetime_debut     TEXT NOT NULL, -- format ISO : "2026-10-15T14:00"
    duree              INTEGER NOT NULL CHECK (duree > 0) -- en minutes
  );

  CREATE TABLE reservations (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activite_id      INTEGER NOT NULL REFERENCES activites(id) ON DELETE CASCADE,
    date_reservation TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    etat             INTEGER NOT NULL DEFAULT 1 CHECK (etat IN (0, 1)) -- 1 = active, 0 = annulée
  );
`);

// 4. Données d'exemple
// db.run : exécute une requête avec des paramètres "?" (valeurs insérées de façon sécurisée)

// Comptes de démonstration (mots de passe hachés)
await db.run(
  "INSERT INTO users (prenom, nom, email, motdepasse, role) VALUES (?, ?, ?, ?, ?)",
  "Admin", "Parc", "admin@parc.fr", await bcrypt.hash("admin123", 10), "admin"
);
await db.run(
  "INSERT INTO users (prenom, nom, email, motdepasse, role) VALUES (?, ?, ?, ?, ?)",
  "John", "Doe", "john.doe@gmail.com", await bcrypt.hash("user123", 10), "user"
);

// Types d'activités : les id seront 1 = Aventure, 2 = Nautique, 3 = Détente, 4 = Enfants, 5 = Sport
const types = ["Aventure", "Nautique", "Détente", "Enfants", "Sport"];
for (const nom of types) { // une insertion par type
  await db.run("INSERT INTO type_activite (nom) VALUES (?)", nom);
}

// Activités : [nom, type_id, places, description, début, durée en minutes]
const activites = [
  ["Accrobranche géant", 1, 20, "Parcours dans les arbres sur 5 niveaux de difficulté, tyrolienne finale de 200 m.", "2026-10-10T10:00", 120],
  ["Tir à l'arc", 5, 12, "Initiation au tir à l'arc avec un moniteur diplômé. Matériel fourni.", "2026-10-10T14:00", 90],
  ["Canoë sur la rivière", 2, 16, "Descente de 8 km en canoë biplace au fil de l'eau.", "2026-10-11T09:30", 180],
  ["Paddle au coucher du soleil", 2, 2, "Balade en stand-up paddle sur le lac à la tombée de la nuit.", "2026-10-11T18:00", 90],
  ["Yoga en plein air", 3, 15, "Séance de yoga tous niveaux au bord du lac.", "2026-10-12T08:30", 60],
  ["Atelier cabanes", 4, 10, "Les enfants construisent leur cabane en forêt avec un animateur (6-12 ans).", "2026-10-12T14:00", 120],
  ["Escalade sur bloc", 1, 8, "Découverte de l'escalade sur blocs naturels, encadrée.", "2026-10-17T10:00", 150],
  ["Chasse au trésor", 4, 25, "Grand jeu de piste en famille à travers le parc.", "2026-10-18T15:00", 90],
];
for (const a of activites) { // "...a" : passe les 6 valeurs du tableau comme 6 paramètres
  await db.run(
    `INSERT INTO activites (nom, type_id, places_disponibles, description, datetime_debut, duree)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ...a
  );
}

// Le paddle (2 places) est réservé en entier par John : permet de tester le cas "complet"
await db.run("INSERT INTO reservations (user_id, activite_id) VALUES (2, 4)");
await db.run("INSERT INTO reservations (user_id, activite_id) VALUES (2, 4)");
// Une réservation active et une annulée pour John
await db.run("INSERT INTO reservations (user_id, activite_id) VALUES (2, 1)");
await db.run("INSERT INTO reservations (user_id, activite_id, etat) VALUES (2, 3, 0)");

// Fermeture de la base et récapitulatif dans le terminal
await db.close();
console.log(`Base "${DATABASE_NAME}" initialisée.`);
console.log("Admin : admin@parc.fr / admin123");
console.log("Utilisateur : john.doe@gmail.com / user123");
