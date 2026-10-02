import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/utils/sessions";
import { getActiviteById, getTypes } from "@/lib/queries";
import ActiviteForm from "@/components/ActiviteForm";

export async function generateMetadata(props: PageProps<"/admin/activites/[id]/modifier">): Promise<Metadata> {
  const activite = await getActiviteById(Number((await props.params).id));
  return {
    title: activite ? `Modifier « ${activite.nom} »` : "Activité introuvable",
    description: "Modifier une activité du Bois de Vincennes.",
  };
}

// Modification d'une activité existante
export default async function ModifierActivitePage(props: PageProps<"/admin/activites/[id]/modifier">) {
  const { id } = await props.params;
  await requireAdminPage(`/admin/activites/${id}/modifier`);

  const [activite, types] = await Promise.all([getActiviteById(Number(id)), getTypes()]);
  if (!activite) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">Modifier l&apos;activité</h1>
      <ActiviteForm types={types} activite={activite} />
    </div>
  );
}
