// Types TypeScript qui décrivent les tables de la base de données.
// Ils permettent à l'éditeur de vérifier qu'on utilise les bons champs partout dans le code.

// Rôle d'un compte : simple utilisateur ou administrateur
export type Role = "user" | "admin";

// Table "users" : un compte utilisateur
export interface User {
  id: number; // identifiant unique (auto-incrémenté)
  prenom: string;
  nom: string;
  email: string; // unique : deux comptes ne peuvent pas avoir le même email
  motdepasse: string; // mot de passe haché avec bcrypt (jamais en clair)
  role: Role;
}

// Utilisateur sans le mot de passe : c'est ce qu'on peut transmettre aux pages et au navigateur.
// Omit<User, "motdepasse"> = le type User, en retirant le champ "motdepasse"
export type PublicUser = Omit<User, "motdepasse">;

// Table "type_activite" : catégorie d'activité (Aventure, Nautique...)
export interface TypeActivite {
  id: number;
  nom: string;
}

// Table "activites" : une activité proposée par le parc
export interface Activite {
  id: number;
  nom: string;
  type_id: number; // référence vers type_activite.id
  places_disponibles: number; // capacité totale de l'activité
  description: string;
  datetime_debut: string; // date et heure de début, format ISO "2026-10-15T14:00"
  duree: number; // durée en minutes
}

// Activité enrichie pour l'affichage : on ajoute le nom du type et les places restantes,
// calculés par la requête SQL (voir lib/queries.ts)
export interface ActiviteDetail extends Activite {
  type_nom: string; // nom du type (jointure avec type_activite)
  places_restantes: number; // capacité - nombre de réservations actives
}

// Table "reservations" : réservation d'une activité par un utilisateur
export interface Reservation {
  id: number;
  user_id: number; // référence vers users.id
  activite_id: number; // référence vers activites.id
  date_reservation: string; // date à laquelle la réservation a été faite
  etat: 0 | 1; // 1 = active, 0 = annulée (SQLite n'a pas de vrai booléen, il stocke 0 ou 1)
}
