import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accès refusé",
  description: "Cette page est réservée aux administrateurs.",
};

// Page affichée quand un utilisateur non administrateur tente d'ouvrir une page /admin
export default function AccesRefusePage() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="text-6xl" aria-hidden>🔒</p>
      <h1 className="mt-6 text-3xl font-bold">Accès refusé</h1>
      <p className="mt-3 max-w-md text-muted">Cette page est réservée aux administrateurs du parc.</p>
      <Link href="/" className="btn btn-primary mt-8">Retour à l&apos;accueil</Link>
    </div>
  );
}
