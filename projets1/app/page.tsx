import Image from "next/image";
import Link from "next/link";
import { getActivites, getTypes } from "@/lib/queries";
import { typeVisuel } from "@/lib/format";
import ActiviteCard from "@/components/ActiviteCard";
import SearchBar from "@/components/SearchBar";
import { getCurrentUser } from "@/utils/sessions";

// Page d'accueil : présentation, recherche et prochaines activités
export default async function Home() {
  const [prochaines, types, user] = await Promise.all([
    getActivites({ aVenir: true, limite: 6 }),
    getTypes(),
    getCurrentUser(),
  ]);

  return (
    <>
      {/* Bannière principale */}
      <section className="container-page grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 inline-block rounded-full bg-accent-100 px-4 py-1 text-sm font-semibold text-accent-600">
            ☀️ Paris 12e · Ouvert tous les jours
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-accent-900 sm:text-5xl">
            Réservez votre <span className="text-primary-600">prochaine aventure</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            Accrobranche, canoë, yoga au bord du lac… Choisissez votre activité et réservez votre place en
            quelques clics.
          </p>
          {/* Boutons adaptés : visiteur, utilisateur connecté ou administrateur */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/activites" className="btn btn-primary px-7 py-3 text-base">
              Voir les activités
            </Link>
            {!user && (
              <Link href="/register" className="btn btn-secondary px-7 py-3 text-base">
                Créer un compte
              </Link>
            )}
            {user?.role === "user" && (
              <Link href="/mon-compte/reservations" className="btn btn-secondary px-7 py-3 text-base">
                Mes réservations
              </Link>
            )}
            {user?.role === "admin" && (
              <Link href="/admin" className="btn btn-secondary px-7 py-3 text-base">
                Administration
              </Link>
            )}
          </div>
        </div>

        <Image
          src="/hero.svg"
          width={640}
          height={480}
          alt="Illustration d'un lac entouré de forêt"
          priority
          className="h-auto w-full rounded-3xl shadow-lg"
        />
      </section>

      {/* Recherche */}
      <section className="container-page">
        <SearchBar types={types} />
        <div className="mt-4 flex flex-wrap gap-2">
          {types.map((t) => (
            <Link
              key={t.id}
              href={`/activites?type=${t.id}`}
              className="rounded-full border border-line bg-white px-4 py-1.5 text-sm font-medium hover:border-primary-500 hover:text-primary-700"
            >
              {typeVisuel(t.nom).emoji} {t.nom}
            </Link>
          ))}
        </div>
      </section>

      {/* Prochaines activités */}
      <section className="container-page mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Prochaines activités</h2>
          <Link href="/activites" className="text-sm font-semibold text-primary-600 hover:underline">
            Tout voir →
          </Link>
        </div>
        {prochaines.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {prochaines.map((a) => (
              <ActiviteCard key={a.id} activite={a} />
            ))}
          </div>
        ) : (
          <p className="card p-8 text-center text-muted">Aucune activité à venir pour le moment.</p>
        )}
      </section>

      {/* Comment ça marche : uniquement pour les visiteurs non connectés */}
      {!user && (
        <section className="container-page mt-16">
          <h2 className="mb-6 text-2xl font-bold sm:text-3xl">Comment ça marche ?</h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              { titre: "Créez votre compte", texte: "Inscription gratuite en 30 secondes." },
              { titre: "Choisissez une activité", texte: "Filtrez par type, date ou nom." },
              { titre: "Réservez votre place", texte: "Retrouvez et annulez vos réservations depuis votre compte." },
            ].map((etape, i) => (
              <li key={etape.titre} className="card p-6">
                <span className="grid size-10 place-items-center rounded-full bg-primary-600 font-display font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{etape.titre}</h3>
                <p className="mt-1 text-sm text-muted">{etape.texte}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
