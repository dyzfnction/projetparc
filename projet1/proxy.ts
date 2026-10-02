// Proxy (appelé "middleware" avant Next.js 16) : s'exécute AVANT l'affichage des pages protégées.
//
// Rôle : vérification rapide. Si la personne n'a pas de session valide, on la redirige
// vers la page de connexion, avec l'adresse demandée pour y revenir après.
// Le contrôle complet (compte toujours existant, rôle admin) est refait dans chaque page
// (requireUserPage / requireAdminPage) et dans chaque route API (requireUser / requireAdmin).

import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, decrypt } from "@/lib/jwt";

/**
 * Fonction appelée par Next.js pour chaque requête qui correspond au "matcher" ci-dessous.
 */
export async function proxy(request: NextRequest) {
  // Lecture et vérification du JWT contenu dans le cookie
  const session = await decrypt(request.cookies.get(COOKIE_NAME)?.value);

  // Pas de session valide : redirection vers /login?redirect=/page-demandee
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Session valide : on laisse la page s'afficher normalement
  return NextResponse.next();
}

// Pages concernées par le proxy : tout l'espace "mon compte" et tout l'espace "admin"
export const config = {
  matcher: ["/mon-compte/:path*", "/admin/:path*"], // ":path*" = la page et toutes ses sous-pages
};
