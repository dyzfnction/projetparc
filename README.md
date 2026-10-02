# Bois de Vincennes - Système de réservation

Projet Next.js 16 (App Router, TypeScript) : réservation d'activités pour un parc d'activités.

## Auteurs

Projet réalisé en binôme par :

- Célia GUERIN
- Stella KIMPESE DIA SUEKMA

## Installation

```bash
cd projet1
npm install
```

Créer un fichier `.env.local` dans `projet1/` :

```
DATABASE_NAME=database.db
JWT_SECRET=une_longue_chaine_secrete
```

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Créer la base de données avec des données d'exemple (⚠️ efface la base existante) :

```bash
npm run db:init
```

Lancer le site :

```bash
npm run dev
```

Puis ouvrir http://localhost:3000.

## Comptes de test

| Rôle           | Email                | Mot de passe |
| -------------- | -------------------- | ------------ |
| Administrateur | admin@parc.fr        | admin123     |
| Utilisateur    | john.doe@gmail.com   | user123      |

## Fonctionnalités

**Utilisateurs** : inscription, connexion, déconnexion, modification du profil (avec changement de mot de passe facultatif), suppression du compte.

**Activités** : liste, détail, recherche par nom et filtre par type (accessibles sans compte). Création, modification et suppression réservées aux administrateurs.

**Réservations** : réservation d'une activité, liste de mes réservations (à venir, passées, annulées), annulation.

**Validations** :
- impossible de réserver une activité complète, déjà commencée ou déjà réservée ;
- impossible d'annuler la réservation d'un autre utilisateur ;
- pages et routes API d'administration interdites aux non-administrateurs ;
- impossible de réduire le nombre de places sous le nombre de réservations existantes.

**Bonus** : tableau de bord administrateur avec statistiques (utilisateurs, réservations, taux de remplissage, réservations par type, activités les plus réservées).

## Structure

Toutes les sources sont dans `projet1/` :

```
app/                 pages et routes API (App Router)
  api/               routes API (login, register, logout, profil, activites, reservations)
  activites/         liste et détail des activités
  mon-compte/        profil et réservations de l'utilisateur
  admin/             tableau de bord et gestion des activités
  not-found.tsx      page 404
components/          composants React (formulaires, cartes, boutons)
lib/                 base de données, types, requêtes, validations, formatage
utils/               session (JWT dans un cookie) et hachage des mots de passe
scripts/init-db.mjs  création de la base et données d'exemple
proxy.ts             redirection vers la connexion pour les pages protégées
```

## Choix techniques

- **SQLite** (`sqlite` + `sqlite3`) : base dans un simple fichier.
- **Session** : JWT signé avec `jose`, stocké dans un cookie `httpOnly`. Le JWT ne contient que l'id ; l'utilisateur et son rôle sont relus en base à chaque requête.
- **Mots de passe** hachés côté serveur avec `bcryptjs`.
- **`places_disponibles`** = capacité totale de l'activité ; les places restantes sont calculées (capacité − réservations actives).
- **Annulation** : la réservation n'est pas supprimée, son `etat` passe à `0` (historique conservé).
- **Tailwind CSS** pour l'interface, `next/font` pour les polices, `next/image` pour les images.
