import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/sessions";
import AuthCard from "@/components/AuthCard";
import RefreshHeader from "@/components/RefreshHeader";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous pour réserver vos activités au Bois de Vincennes.",
};

// N'accepte que les chemins internes ("/..."), pour éviter de rediriger vers un autre site
function cheminSur(valeur: unknown): string {
  return typeof valeur === "string" && valeur.startsWith("/") && !valeur.startsWith("//") ? valeur : "/mon-compte";
}

export default async function LoginPage(props: PageProps<"/login">) {
  const destination = cheminSur((await props.searchParams).redirect);

  // Déjà connecté : inutile d'afficher le formulaire
  if (await getCurrentUser()) redirect(destination);

  return (
    <AuthCard titre="Connexion" sousTitre="Content de vous revoir !">
      <LoginForm redirect={destination} />
      {/* Met à jour l'en-tête si la session a expiré */}
      <RefreshHeader />
    </AuthCard>
  );
}
