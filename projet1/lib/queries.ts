// Requêtes de lecture en base de données, utilisées par les pages (composants serveur).
// Les écritures (création, modification, suppression) sont dans les routes API (app/api).

import "server-only"; // ces requêtes ne doivent jamais être exécutées dans le navigateur

import { getDb } from "@/lib/db";
import type { ActiviteDetail, TypeActivite } from "@/lib/types";

// Requête de base réutilisée pour lire les activités. Pour chaque activité, elle ajoute :
// - type_nom : le nom du type (JOIN avec la table type_activite)
// - places_restantes : capacité totale moins le nombre de réservations actives (etat = 1)
const ACTIVITE_SELECT = `
  SELECT a.*,
         t.nom AS type_nom,
         a.places_disponibles - (
           SELECT COUNT(*) FROM reservations r WHERE r.activite_id = a.id AND r.etat = 1
         ) AS places_restantes
  FROM activites a
  JOIN type_activite t ON t.id = a.type_id
`;

/**
 * Date et heure actuelles au format "2026-10-15T14:00", le même que dans la base.
 * Deux dates dans ce format se comparent directement comme du texte ("2026-10-10" < "2026-10-11").
 */
export function nowIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0"); // 5 -> "05"
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Filtres possibles pour la liste des activités (tous facultatifs)
export interface ActiviteFiltres {
  recherche?: string; // recherche par nom
  typeId?: number; // filtre par type
  aVenir?: boolean; // uniquement les activités qui n'ont pas encore commencé
  limite?: number; // nombre maximum de résultats
}

/**
 * Liste des activités, triées par date de début, avec les filtres demandés.
 * La requête SQL est construite morceau par morceau selon les filtres présents.
 */
export async function getActivites(filtres: ActiviteFiltres = {}): Promise<ActiviteDetail[]> {
  const db = await getDb();
  const conditions: string[] = []; // morceaux du WHERE
  const params: (string | number)[] = []; // valeurs des "?", dans le même ordre

  // Recherche par nom : LIKE "%canoë%" trouve les noms qui contiennent le mot
  if (filtres.recherche) {
    conditions.push("a.nom LIKE ?");
    params.push(`%${filtres.recherche}%`);
  }
  // Filtre par type
  if (filtres.typeId) {
    conditions.push("a.type_id = ?");
    params.push(filtres.typeId);
  }
  // Activités à venir uniquement
  if (filtres.aVenir) {
    conditions.push("a.datetime_debut > ?");
    params.push(nowIso());
  }

  // Assemblage de la requête
  let sql = ACTIVITE_SELECT;
  if (conditions.length) sql += ` WHERE ${conditions.join(" AND ")}`;
  sql += " ORDER BY a.datetime_debut"; // de la plus proche à la plus lointaine
  if (filtres.limite) {
    sql += " LIMIT ?";
    params.push(filtres.limite);
  }

  return await db.all<ActiviteDetail[]>(sql, params);
}

/**
 * Une activité par son id, ou null si elle n'existe pas (ou si l'id n'est pas un nombre entier).
 */
export async function getActiviteById(id: number): Promise<ActiviteDetail | null> {
  if (!Number.isInteger(id)) return null; // ex : /activites/abc -> id = NaN
  const db = await getDb();
  const activite = await db.get<ActiviteDetail>(`${ACTIVITE_SELECT} WHERE a.id = ?`, id);
  return activite ?? null; // db.get renvoie undefined si aucune ligne
}

/**
 * Tous les types d'activités, par ordre alphabétique.
 */
export async function getTypes(): Promise<TypeActivite[]> {
  const db = await getDb();
  return await db.all<TypeActivite[]>("SELECT id, nom FROM type_activite ORDER BY nom");
}

// Réservation affichée dans "Mes réservations" : réservation + infos de l'activité
export interface ReservationAvecActivite {
  id: number;
  date_reservation: string;
  etat: 0 | 1;
  activite_id: number;
  activite_nom: string;
  type_nom: string;
  datetime_debut: string;
  duree: number;
}

/**
 * Réservations d'un utilisateur : les actives d'abord, puis par date de l'activité.
 */
export async function getReservationsByUser(userId: number): Promise<ReservationAvecActivite[]> {
  const db = await getDb();
  return await db.all<ReservationAvecActivite[]>(
    `SELECT r.id, r.date_reservation, r.etat, r.activite_id,
            a.nom AS activite_nom, a.datetime_debut, a.duree, t.nom AS type_nom
     FROM reservations r
     JOIN activites a ON a.id = r.activite_id
     JOIN type_activite t ON t.id = a.type_id
     WHERE r.user_id = ?
     ORDER BY r.etat DESC, a.datetime_debut`,
    userId
  );
}

/**
 * Id de la réservation active de l'utilisateur pour cette activité, ou null s'il n'en a pas.
 * Sert à savoir s'il est déjà inscrit (et à pouvoir annuler depuis la page de l'activité).
 */
export async function getReservationActive(userId: number, activiteId: number): Promise<number | null> {
  const db = await getDb();
  const row = await db.get<{ id: number }>(
    "SELECT id FROM reservations WHERE user_id = ? AND activite_id = ? AND etat = 1",
    userId,
    activiteId
  );
  return row?.id ?? null;
}

// Statistiques affichées sur le tableau de bord administrateur
export interface Statistiques {
  nbUsers: number;
  nbActivites: number;
  nbReservationsActives: number;
  nbReservationsAnnulees: number;
  tauxRemplissage: number; // en %, sur les activités à venir
  parType: { nom: string; reservations: number }[]; // réservations actives par type
  topActivites: { id: number; nom: string; reservations: number; places_disponibles: number }[]; // top 5
}

/**
 * Calcule toutes les statistiques du tableau de bord administrateur.
 */
export async function getStatistiques(): Promise<Statistiques> {
  const db = await getDb();

  // 1. Totaux : plusieurs COUNT dans une seule requête
  const totaux = await db.get<{
    nbUsers: number;
    nbActivites: number;
    nbReservationsActives: number;
    nbReservationsAnnulees: number;
  }>(`SELECT
        (SELECT COUNT(*) FROM users) AS nbUsers,
        (SELECT COUNT(*) FROM activites) AS nbActivites,
        (SELECT COUNT(*) FROM reservations WHERE etat = 1) AS nbReservationsActives,
        (SELECT COUNT(*) FROM reservations WHERE etat = 0) AS nbReservationsAnnulees`);

  // 2. Remplissage des activités à venir : total des places et total des places réservées
  const remplissage = await db.get<{ places: number | null; reservees: number | null }>(
    `SELECT SUM(a.places_disponibles) AS places,
            SUM((SELECT COUNT(*) FROM reservations r WHERE r.activite_id = a.id AND r.etat = 1)) AS reservees
     FROM activites a WHERE a.datetime_debut > ?`,
    nowIso()
  );

  // 3. Réservations actives par type (LEFT JOIN : les types sans réservation apparaissent avec 0)
  const parType = await db.all<{ nom: string; reservations: number }[]>(
    `SELECT t.nom, COUNT(r.id) AS reservations
     FROM type_activite t
     LEFT JOIN activites a ON a.type_id = t.id
     LEFT JOIN reservations r ON r.activite_id = a.id AND r.etat = 1
     GROUP BY t.id ORDER BY reservations DESC, t.nom`
  );

  // 4. Les 5 activités les plus réservées
  const topActivites = await db.all<Statistiques["topActivites"]>(
    `SELECT a.id, a.nom, a.places_disponibles, COUNT(r.id) AS reservations
     FROM activites a
     LEFT JOIN reservations r ON r.activite_id = a.id AND r.etat = 1
     GROUP BY a.id ORDER BY reservations DESC, a.nom LIMIT 5`
  );

  // SUM renvoie null s'il n'y a aucune activité à venir : on remplace par 0
  const places = remplissage?.places ?? 0;

  return {
    nbUsers: totaux?.nbUsers ?? 0,
    nbActivites: totaux?.nbActivites ?? 0,
    nbReservationsActives: totaux?.nbReservationsActives ?? 0,
    nbReservationsAnnulees: totaux?.nbReservationsAnnulees ?? 0,
    // Pourcentage arrondi ; 0 si aucune place (évite une division par zéro)
    tauxRemplissage: places ? Math.round(((remplissage?.reservees ?? 0) / places) * 100) : 0,
    parType,
    topActivites,
  };
}
