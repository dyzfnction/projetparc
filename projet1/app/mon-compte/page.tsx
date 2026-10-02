import type { Metadata } from "next";
import Link from "next/link";
import { requireUserPage } from "@/utils/sessions";
import ProfilForm from "@/components/ProfilForm";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Modifiez les informations de votre compte.",
};

// Page profil : modification des informations et suppression du compte
export default async function MonComptePage() {
  const user = await requireUserPage("/mon-compte");

  // Compte administrateur : protégé, affiché en lecture seule
  if (user.role === "admin") {
    return (
      <section className="card max-w-2xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Compte administrateur</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Nom</dt>
            <dd className="mt-1 font-semibold">{user.prenom} {user.nom}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
            <dd className="mt-1 font-semibold">{user.email}</dd>
          </div>
        </dl>
        <p className="alert-success mt-6">
          🔒 Ce compte est protégé : il ne peut être ni modifié ni supprimé depuis le site, et il ne peut pas
          réserver d&apos;activités.
        </p>
        <Link href="/admin" className="btn btn-primary mt-6">Aller à l&apos;administration</Link>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Mes informations</h2>
        <p className="mb-6 mt-1 text-sm text-muted">Compte utilisateur</p>
        <ProfilForm user={user} />
      </section>

      <section className="card h-fit border-red-200 p-6">
        <h2 className="text-xl font-semibold text-red-700">Zone de danger</h2>
        <p className="mt-2 text-sm text-muted">
          La suppression de votre compte est définitive. Toutes vos réservations seront supprimées.
        </p>
        <DeleteAccountButton />
      </section>
    </div>
  );
}
