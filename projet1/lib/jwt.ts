// Création et vérification du JWT (JSON Web Token) qui sert de session.
// Ce fichier n'accède pas à la base de données : il peut donc aussi être utilisé dans proxy.ts.

import { SignJWT, jwtVerify } from "jose"; // librairie de création / vérification de JWT

// Clé secrète (définie dans .env.local) transformée en octets, format attendu par jose.
// Sans cette clé, personne ne peut fabriquer un faux JWT.
const key = new TextEncoder().encode(process.env.JWT_SECRET);

// Nom du cookie qui contient le JWT
export const COOKIE_NAME = "session";

// Durée de validité de la session : 2 heures (en secondes)
export const SESSION_DURATION = 60 * 60 * 2;

// Contenu du JWT : uniquement l'id de l'utilisateur.
// Le reste (nom, rôle...) est relu en base, pour être toujours à jour.
export interface SessionData {
  userId: number;
}

/**
 * Crée un JWT signé contenant les données de session.
 * Renvoie le JWT sous forme de texte, à stocker dans le cookie.
 */
export async function encrypt(payload: SessionData): Promise<string> {
  return await new SignJWT({ ...payload }) // données à mettre dans le jeton
    .setProtectedHeader({ alg: "HS256" }) // algorithme de signature
    .setIssuedAt() // date de création
    .setExpirationTime(`${SESSION_DURATION}s`) // date d'expiration (vérifiée automatiquement par jose)
    .sign(key); // signature avec la clé secrète
}

/**
 * Vérifie un JWT et renvoie son contenu.
 * Renvoie null si le jeton est absent, falsifié ou expiré.
 */
export async function decrypt(token: string | undefined): Promise<SessionData | null> {
  // Pas de cookie : pas de session
  if (!token) return null;

  try {
    // jwtVerify vérifie la signature ET la date d'expiration ; il lève une erreur sinon
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });

    // Sécurité : on s'assure que le contenu a bien la forme attendue
    if (typeof payload.userId !== "number") return null;

    // Jeton valide : on renvoie l'id de l'utilisateur
    return { userId: payload.userId };
  } catch {
    // Jeton invalide ou expiré
    return null;
  }
}
