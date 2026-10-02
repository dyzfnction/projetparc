import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/sessions";
import AuthCard from "@/components/AuthCard";
import RefreshHeader from "@/components/RefreshHeader";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte gratuit pour réserver les activités du Bois de Vincennes.",
};

export default async function RegisterPage() {
  // Déjà connecté : on renvoie vers le compte
  if (await getCurrentUser()) redirect("/mon-compte");

  return (
    <AuthCard titre="Inscription" sousTitre="Créez votre compte pour réserver vos activités.">
      <RegisterForm />
      {/* Met à jour l'en-tête si la session a expiré */}
      <RefreshHeader />
    </AuthCard>
  );
}
