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

  // La columna image_url puede no existir aún si la migración 0004 no se ha
  // aplicado en la BD. Se comprueba con un SELECT mínimo: si falla, la columna
  // no existe y no debe referenciarse o rompería el render (React #441). Cuando
  // se aplique la migración, la columna pasará a existir y se usará automáticamente.
  const { error: probeError } = await supabase
    .from("services")
    .select("image_url")
    .limit(1);
  const hasImage = !probeError;

  const { data, error } = await supabase
    .from("services")
    .select(hasImage ? "id, name, slug, description, image_url" : "id, name, slug, description")
    .in("id", serviceIds)
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .limit(3);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url?: string | null;
  }>;

  return rows.map((s) => ({
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
