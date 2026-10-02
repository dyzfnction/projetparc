import NavLink from "@/components/NavLink";
import { getCurrentUser } from "@/utils/sessions";

// Layout de l'espace "Mon compte" : titre + sous-menu, commun à toutes les pages /mon-compte/...
export default async function CompteLayout({ children }: LayoutProps<"/mon-compte">) {
  const user = await getCurrentUser();

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold sm:text-4xl">Mon espace</h1>
      <nav className="mt-6 flex flex-wrap gap-2 border-b border-line pb-4 text-sm">
        <NavLink href="/mon-compte" exact>Mon profil</NavLink>
        {/* L'administrateur ne réserve pas : pas d'onglet "Mes réservations" */}
        {user?.role !== "admin" && <NavLink href="/mon-compte/reservations">Mes réservations</NavLink>}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
