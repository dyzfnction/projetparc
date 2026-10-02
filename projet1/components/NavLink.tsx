// Lien de menu qui se met en évidence (fond orange) quand on est sur la page correspondante.
// Utilisé dans l'en-tête et dans les sous-menus "Mon espace" et "Administration".

"use client"; // composant client : il a besoin de connaître l'URL actuelle (usePathname)

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Propriétés du composant
interface NavLinkProps {
  href: string; // adresse du lien
  children: React.ReactNode; // texte du lien
  exact?: boolean; // true = actif uniquement sur l'URL exacte (pas sur ses sous-pages)
}

/**
 * Exemple : <NavLink href="/activites">Activités</NavLink>
 * Sans "exact", le lien /admin/activites reste actif sur /admin/activites/nouvelle.
 */
export default function NavLink({ href, children, exact = false }: NavLinkProps) {
  // URL actuelle, par exemple "/activites/3"
  const pathname = usePathname();

  // Le lien est actif si l'URL est la même, ou (sans exact) si c'est une sous-page
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      // clsx ajoute les classes selon "active" : orange plein si actif, survol clair sinon
      className={clsx(
        "rounded-full px-4 py-2 font-medium transition-colors",
        active ? "bg-primary-600 text-white" : "text-ink hover:bg-primary-50"
      )}
    >
      {children}
    </Link>
  );
}
