import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/utils/sessions";
import { getStatistiques } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Statistiques des activités, utilisateurs et réservations du Bois de Vincennes.",
};

// Tableau de bord administrateur (bonus) : chiffres clés et classements
export default async function AdminDashboardPage() {
  await requireAdminPage("/admin");
  const stats = await getStatistiques();
  const maxParType = Math.max(1, ...stats.parType.map((t) => t.reservations));

  const chiffres = [
    { label: "Utilisateurs", valeur: stats.nbUsers },
    { label: "Activités", valeur: stats.nbActivites },
    { label: "Réservations actives", valeur: stats.nbReservationsActives },
    { label: "Réservations annulées", valeur: stats.nbReservationsAnnulees },
    { label: "Remplissage (à venir)", valeur: `${stats.tauxRemplissage} %` },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      {/* Chiffres clés */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {chiffres.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-1 font-display text-3xl font-bold text-primary-700">{c.valeur}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Réservations par type, en barres horizontales */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Réservations actives par type</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {stats.parType.map((t) => (
              <li key={t.nom}>
                <div className="flex justify-between text-sm">
                  <span>{t.nom}</span>
                  <span className="font-semibold">{t.reservations}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-primary-50">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${(t.reservations / maxParType) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Activités les plus réservées */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold">Activités les plus réservées</h2>
          <ol className="mt-4 flex flex-col divide-y divide-line">
            {stats.topActivites.map((a, i) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="grid size-7 place-items-center rounded-full bg-accent-100 font-semibold text-accent-600">{i + 1}</span>
                <Link href={`/activites/${a.id}`} className="flex-1 hover:underline">{a.nom}</Link>
                <span className="text-muted">
                  {a.reservations} / {a.places_disponibles}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
