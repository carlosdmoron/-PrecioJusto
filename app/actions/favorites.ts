"use server";

import { createClient } from "../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFavorites() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("favorites")
    .select(`
      id,
      created_at,
      professional:profiles!favorites_professional_id_fkey(
        id, first_name, last_name, avatar_url
      ),
      professional_detail:professionals(
        province, municipality, experience_years, rating, description
      )
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function removeFavorite(favoriteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId)
    .eq("client_id", user.id);

  if (error) throw error.message;
  revalidatePath("/dashboard-cliente/favoritos");
  return { success: true };
}

export async function addFavorite(professionalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("favorites").insert({
    client_id: user.id,
    professional_id: professionalId,
  });

  if (error) throw error.message;
  revalidatePath("/dashboard-cliente/favoritos");
  return { success: true };
}
