// Composant invisible qui force la mise à jour de l'en-tête.
//
// Problème : Next.js ne recalcule pas le layout (donc l'en-tête) quand on change de page.
// Si la session a expiré, l'en-tête afficherait encore l'ancien compte connecté.
// Solution : placé sur les pages de connexion et d'inscription, ce composant demande au serveur
// de recalculer toute la page, en-tête compris, dès l'arrivée sur la page.

"use client"; // composant client : useEffect et useRouter ne fonctionnent que dans le navigateur

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RefreshHeader() {
  const router = useRouter();

  // useEffect s'exécute une fois, juste après l'affichage du composant
  useEffect(() => {
    router.refresh(); // recalcule les composants serveur (dont l'en-tête) sans recharger la page
  }, [router]);

  return null; // n'affiche rien à l'écran
}
