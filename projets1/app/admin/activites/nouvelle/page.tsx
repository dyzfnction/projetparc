import type { Metadata } from "next";
import { requireAdminPage } from "@/utils/sessions";
import { getTypes } from "@/lib/queries";
import ActiviteForm from "@/components/ActiviteForm";

export const metadata: Metadata = {
  title: "Nouvelle activité",
  description: "Ajouter une activité au Bois de Vincennes.",
};

// Création d'une activité
export default async function NouvelleActivitePage() {
  await requireAdminPage("/admin/activites/nouvelle");
  const types = await getTypes();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">Nouvelle activité</h1>
      <ActiviteForm types={types} />
    </div>
  );
}
