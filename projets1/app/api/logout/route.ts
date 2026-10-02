import { NextResponse } from "next/server";
import { deleteCookie } from "@/utils/sessions";

// POST /api/logout : déconnexion (suppression du cookie de session)
export async function POST() {
  await deleteCookie();
  return NextResponse.json({ message: "Déconnecté." });
}
