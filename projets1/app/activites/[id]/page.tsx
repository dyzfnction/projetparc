import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiviteById, getReservationActive, nowIso } from "@/lib/queries";
import { formatDate, formatDuree, formatHeure, pluriel, typeVisuel } from "@/lib/format";
import { getCurrentUser } from "@/utils/sessions";
import PlacesBadge from "@/components/PlacesBadge";
import ReservationPanel from "@/components/ReservationPanel";

// Metadata basées sur l'activité affichée
export async function generateMetadata(props: PageProps<"/activites/[id]">): Promise<Metadata> {
  const activite = await getActiviteById(Number((await props.params).id));
  if (!activite) return { title: "Activité introuvable" };
  return {
    title: activite.nom,
    description: activite.description.slice(0, 160),
  };
}

// Détail d'une activité + encart de réservation
export default async function ActivitePage(props: PageProps<"/activites/[id]">) {
  const activite = await getActiviteById(Number((await props.params).id));
  if (!activite) notFound(); // id inexistant -> page 404

  const user = await getCurrentUser();
  const reservationId = user ? await getReservationActive(user.id, activite.id) : null;
  const visuel = typeVisuel(activite.type_nom);
  const reservees = activite.places_disponibles - activite.places_restantes;
  const remplissage = Math.min(100, Math.round((reservees / activite.places_disponibles) * 100));

  return (
    <div className="container-page py-10">
      <Link href="/activites" className="text-sm font-semibold text-primary-600 hover:underline">
        ← Toutes les activités
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Informations */}
        <article className="card overflow-hidden">
          <div className={`flex h-56 items-center justify-center text-8xl ${visuel.fond}`}>
            <span aria-hidden>{visuel.emoji}</span>
          </div>
          <div className="p-6 sm:p-8">
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              {activite.type_nom}
            </span>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{activite.nom}</h1>

            <dl className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-cream p-4">
                <dt className="text-xs uppercase tracking-wide text-muted">Date</dt>
                <dd className="mt-1 font-semibold capitalize">{formatDate(activite.datetime_debut)}</dd>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <dt className="text-xs uppercase tracking-wide text-muted">Heure</dt>
                <dd className="mt-1 font-semibold">{formatHeure(activite.datetime_debut)}</dd>
              </div>
              <div className="rounded-xl bg-cream p-4">
                <dt className="text-xs uppercase tracking-wide text-muted">Durée</dt>
                <dd className="mt-1 font-semibold">{formatDuree(activite.duree)}</dd>
              </div>
            </dl>

            <h2 className="mt-8 text-xl font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">
              {activite.description || "Pas de description pour cette activité."}
            </p>
          </div>
        </article>

        {/* Réservation */}
        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">Réserver</h2>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted">{pluriel(activite.places_disponibles, "place")} au total</span>
            <PlacesBadge restantes={activite.places_restantes} total={activite.places_disponibles} />
          </div>
          {/* Jauge de remplissage */}
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-50" aria-hidden>
            <div className="h-full rounded-full bg-primary-500" style={{ width: `${remplissage}%` }} />
          </div>

          <div className="mt-6">
            {user?.role === "admin" ? (
              // L'administrateur ne réserve pas : il peut modifier l'activité
              <>
                <p className="alert-success">Vous êtes connecté en administrateur.</p>
                <Link href={`/admin/activites/${activite.id}/modifier`} className="btn btn-primary mt-3 w-full">
                  Modifier cette activité
                </Link>
              </>
            ) : (
              <ReservationPanel
                activiteId={activite.id}
                connecte={Boolean(user)}
                reservationId={reservationId}
                complet={activite.places_restantes <= 0}
                passee={activite.datetime_debut <= nowIso()}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
