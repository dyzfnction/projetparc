import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { redirect } from "next/navigation";
import { requireUserPage } from "@/utils/sessions";
import { getReservationsByUser, nowIso, type ReservationAvecActivite } from "@/lib/queries";
import { formatDate, formatDateCourte, formatDuree, formatHeure, typeVisuel } from "@/lib/format";
import AnnulerReservationButton from "@/components/AnnulerReservationButton";

export const metadata: Metadata = {
  title: "Mes réservations",
  description: "Consultez et annulez vos réservations au Bois de Vincennes.",
};

// Liste de mes réservations, rangées en 3 groupes : à venir, passées, annulées
export default async function MesReservationsPage() {
  const user = await requireUserPage("/mon-compte/reservations");
  if (user.role === "admin") redirect("/admin"); // l'administrateur n'a pas de réservations

  const reservations = await getReservationsByUser(user.id);
  const maintenant = nowIso();

  const aVenir = reservations.filter((r) => r.etat === 1 && r.datetime_debut > maintenant);
  const passees = reservations.filter((r) => r.etat === 1 && r.datetime_debut <= maintenant);
  const annulees = reservations.filter((r) => r.etat === 0);

  if (reservations.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-4xl" aria-hidden>🎟️</p>
        <p className="mt-3 font-semibold">Vous n&apos;avez encore aucune réservation.</p>
        <Link href="/activites" className="btn btn-primary mt-5">Découvrir les activités</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Groupe titre="À venir" reservations={aVenir} vide="Aucune réservation à venir." annulable />
      {passees.length > 0 && <Groupe titre="Passées" reservations={passees} />}
      {annulees.length > 0 && <Groupe titre="Annulées" reservations={annulees} />}
    </div>
  );
}

interface GroupeProps {
  titre: string;
  reservations: ReservationAvecActivite[];
  vide?: string;
  annulable?: boolean;
}

// Un groupe de réservations avec son titre
function Groupe({ titre, reservations, vide, annulable = false }: GroupeProps) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">
        {titre} <span className="text-muted">({reservations.length})</span>
      </h2>
      {reservations.length === 0 ? (
        <p className="card p-6 text-muted">{vide}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reservations.map((r) => (
            <li
              key={r.id}
              className={clsx("card flex flex-col gap-4 p-4 sm:flex-row sm:items-center", r.etat === 0 && "opacity-60")}
            >
              {/* Pastille date */}
              <div className={`grid size-16 shrink-0 place-items-center rounded-xl text-center ${typeVisuel(r.type_nom).fond}`}>
                <span className="text-sm font-bold leading-tight text-primary-900">{formatDateCourte(r.datetime_debut)}</span>
              </div>

              <div className="flex-1">
                <Link href={`/activites/${r.activite_id}`} className="font-semibold hover:text-primary-700 hover:underline">
                  {r.activite_nom}
                </Link>
                <p className="text-sm text-muted">
                  <span className="capitalize">{formatDate(r.datetime_debut)}</span> à {formatHeure(r.datetime_debut)} ·{" "}
                  {formatDuree(r.duree)} · {r.type_nom}
                </p>
                <p className="mt-1 text-xs text-muted">Réservé le {formatDate(r.date_reservation)}</p>
              </div>

              {r.etat === 0 && <span className="text-sm font-semibold text-red-700">Annulée</span>}
              {annulable && <AnnulerReservationButton reservationId={r.id} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
