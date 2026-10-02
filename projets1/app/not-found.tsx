import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "La page demandée n'existe pas.",
};

// Page 404 : affichée pour toute URL inconnue et quand une page appelle notFound()
export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="font-display text-8xl font-bold text-primary-100 sm:text-9xl">404</p>
      <p className="-mt-6 text-6xl" aria-hidden>🧭</p>
      <h1 className="mt-6 text-3xl font-bold">Vous vous êtes perdu en forêt…</h1>
      <p className="mt-3 max-w-md text-muted">
        La page que vous cherchez n&apos;existe pas ou a été déplacée. Pas de panique, on vous ramène sur le sentier.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link>
        <Link href="/activites" className="btn btn-secondary">Voir les activités</Link>
      </div>
    </div>
  );
}
