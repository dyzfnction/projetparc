import type { Metadata } from "next";
import Link from "next/link";
import { getActivites, getTypes } from "@/lib/queries";
import ActiviteCard from "@/components/ActiviteCard";
import SearchBar from "@/components/SearchBar";

// Lit les paramètres de recherche de l'URL (?q=...&type=...)
function lireFiltres(params: Record<string, string | string[] | undefined>) {
  const recherche = typeof params.q === "string" ? params.q.trim() : "";
  const typeId = Number(params.type) || undefined;
  return { recherche, typeId };
}

// Titre de l'onglet adapté à la recherche
export async function generateMetadata(props: PageProps<"/activites">): Promise<Metadata> {
  const { recherche } = lireFiltres(await props.searchParams);
  return {
    title: recherche ? `Recherche « ${recherche} »` : "Toutes les activités",
    description: "Consultez toutes les activités du Bois de Vincennes et réservez votre place.",
  };
}

// Liste des activités avec recherche par nom et filtre par type
export default async function ActivitesPage(props: PageProps<"/activites">) {
  const { recherche, typeId } = lireFiltres(await props.searchParams);
  const [activites, types] = await Promise.all([getActivites({ recherche, typeId }), getTypes()]);
  const filtreActif = Boolean(recherche || typeId);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Nos activités</h1>
      <p className="mt-2 text-muted">Trouvez l&apos;activité qui vous ressemble et réservez votre place.</p>

      <div className="mt-6">
        <SearchBar types={types} recherche={recherche} typeId={typeId} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <p>
          {activites.length} activité{activites.length > 1 ? "s" : ""}
          {recherche && <> pour « {recherche} »</>}
        </p>
        {filtreActif && (
          <Link href="/activites" className="font-semibold text-primary-600 hover:underline">
            Effacer les filtres
          </Link>
        )}
      </div>

      {activites.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activites.map((a) => (
            <ActiviteCard key={a.id} activite={a} />
          ))}
        </div>
      ) : (
        <div className="card mt-4 p-10 text-center">
          <p className="text-4xl" aria-hidden>🔍</p>
          <p className="mt-3 font-semibold">Aucune activité ne correspond à votre recherche.</p>
          <Link href="/activites" className="btn btn-secondary mt-5">Voir toutes les activités</Link>
        </div>
      )}
    </div>
  );
}
