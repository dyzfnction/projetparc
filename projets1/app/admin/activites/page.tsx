import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminPage } from "@/utils/sessions";
import { getActivites } from "@/lib/queries";
import { formatDateCourte, formatHeure } from "@/lib/format";
import PlacesBadge from "@/components/PlacesBadge";
import DeleteActiviteButton from "@/components/DeleteActiviteButton";

export const metadata: Metadata = {
  title: "Gestion des activités",
  description: "Créer, modifier et supprimer les activités du parc.",
};

// Tableau de gestion des activités (administrateurs)
export default async function AdminActivitesPage() {
  await requireAdminPage("/admin/activites");
  const activites = await getActivites();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Activités</h1>
        <Link href="/admin/activites/nouvelle" className="btn btn-primary">+ Nouvelle activité</Link>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-cream text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Activité</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Places</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {activites.map((a) => (
              <tr key={a.id} className="hover:bg-cream/60">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/activites/${a.id}`} className="hover:underline">{a.nom}</Link>
                </td>
                <td className="px-4 py-3 text-muted">{a.type_nom}</td>
                <td className="px-4 py-3 text-muted">
                  {formatDateCourte(a.datetime_debut)} à {formatHeure(a.datetime_debut)}
                </td>
                <td className="px-4 py-3">
                  <PlacesBadge restantes={a.places_restantes} total={a.places_disponibles} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/activites/${a.id}/modifier`} className="btn btn-secondary px-4 py-1.5">
                      Modifier
                    </Link>
                    <DeleteActiviteButton activiteId={a.id} nom={a.nom} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activites.length === 0 && <p className="p-8 text-center text-muted">Aucune activité pour le moment.</p>}
      </div>
    </>
  );
}
