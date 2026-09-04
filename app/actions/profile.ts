"use server";

import { createClient } from "../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateProfile(formData: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error.message;
  revalidatePath("/dashboard-cliente/perfil", "page");
  return { success: true };
}
