"use server";

import { createClient } from "../../lib/supabase/server";

export async function getServices() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("services")
    .select("id, name, slug, description, category:categories(name)")
    .eq("status", "published")
    .order("name");

  return data ?? [];
}

export type PublishedService = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

// Servicios publicados para la landing: un servicio se muestra únicamente si
// tiene al menos un formulario asociado con estado 'active'. Los formularios
// activos son legibles por el público (RLS), igual que los servicios publicados.
export async function getPublishedServices(): Promise<PublishedService[]> {
  const supabase = await createClient();

  const { data: activeForms, error: formsError } = await supabase
    .from("forms")
    .select("service_id")
    .eq("status", "active");

  if (formsError) throw new Error(formsError.message);

  const serviceIds = Array.from(
    new Set(
      (activeForms ?? [])
        .map((f) => f.service_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  if (serviceIds.length === 0) return [];

  const { data, error } = await supabase
    .from("services")
    .select("id, name, slug, description, image_url")
    .in("id", serviceIds)
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .limit(3);

  if (error) throw new Error(error.message);

  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description ?? null,
    image_url: s.image_url ?? null,
  }));
}

export async function getClientRequestCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("requests")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user.id);

  return count ?? 0;
}
