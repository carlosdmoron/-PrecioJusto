"use server";

import { createClient } from "../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("requests")
    .select("*, services(name)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createRequest(formData: {
  title: string;
  service_id: string;
  description: string;
  city: string;
  budget: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("requests").insert({
    client_id: user.id,
    title: formData.title,
    service_id: formData.service_id,
    description: formData.description,
    city: formData.city,
    budget: formData.budget,
    status: "new",
  });

  if (error) throw error.message;
  revalidatePath("/dashboard-cliente/solicitudes");
  revalidatePath("/dashboard-cliente");
  return { success: true };
}

export async function deleteRequest(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("requests")
    .delete()
    .eq("id", id)
    .eq("client_id", user.id);

  if (error) throw error.message;
  revalidatePath("/dashboard-cliente/solicitudes");
  return { success: true };
}
