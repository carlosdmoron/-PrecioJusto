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
      professional_id,
      professional:profiles!favorites_professional_id_fkey(
        id, first_name, last_name, avatar_url
      )
    `)
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (!data) return [];

  const profIds = data
    .map((f) => f.professional_id as string)
    .filter((id): id is string => Boolean(id));

  let detailMap: Record<string, Record<string, unknown>> = {};
  if (profIds.length > 0) {
    const { data: details } = await supabase
      .from("professionals")
      .select("id, province, municipality, experience_years, rating, description")
      .in("id", profIds);
    detailMap = (details ?? []).reduce<Record<string, Record<string, unknown>>>(
      (acc, d) => {
        acc[d.id] = d;
        return acc;
      },
      {},
    );
  }

  return data.map((f) => ({
    ...f,
    professional_detail: detailMap[f.professional_id as string] ?? null,
  }));
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
