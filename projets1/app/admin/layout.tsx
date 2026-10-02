import NavLink from "@/components/NavLink";

// Layout de l'espace administrateur. Le contrôle du rôle est fait dans chaque page (requireAdminPage)
// et dans chaque route API, pas ici : un layout n'est pas réexécuté à chaque navigation.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="container-page py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">Administration</p>
      <nav className="mt-4 flex flex-wrap gap-2 border-b border-line pb-4 text-sm">
        <NavLink href="/admin" exact>Tableau de bord</NavLink>
        <NavLink href="/admin/activites" exact>Activités</NavLink>
        <NavLink href="/admin/activites/nouvelle">+ Nouvelle activité</NavLink>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
