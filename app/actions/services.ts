"use server";

import { createClient } from "../../lib/supabase/server";
import { localizeService, localizeServices } from "../../lib/localize";

export type Locale = "es" | "it" | "en";

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
// tiene al menos un formulario de CLIENTE asociado con estado 'active' (los
// formularios de profesional quedan fuera del flujo de solicitud). Los
// formularios activos son legibles por el público (RLS), igual que los
// servicios publicados.
export async function getPublishedServices(
  locale: Locale = "es"
): Promise<PublishedService[]> {
  const supabase = await createClient();

  const { error: typeProbe } = await supabase
    .from("forms")
    .select("form_type")
    .limit(1);
  const hasType = !typeProbe;

  const formsQuery = supabase.from("forms").select("service_id").eq("status", "active");
  const { data: activeForms, error: formsError } = hasType
    ? await formsQuery.eq("form_type", "customer")
    : await formsQuery;

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

  const { error: transProbeError } = await supabase
    .from("services")
    .select("name_it")
    .limit(1);
  const hasTrans = !transProbeError;

  const baseCols = hasTrans
    ? "id, name, name_it, name_en, slug, description, description_it, description_en"
    : "id, name, slug, description";
  const select = hasImage ? `${baseCols}, image_url` : baseCols;

  const { data, error } = await supabase
    .from("services")
    .select(select)
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
    name_it: string | null;
    name_en: string | null;
    description_it: string | null;
    description_en: string | null;
    image_url?: string | null;
  }>;

  const localized = await localizeServices(rows, locale, hasTrans);

  return rows.map((s, i) => ({
    id: s.id,
    name: localized[i]?.name ?? s.name,
    slug: s.slug,
    description: localized[i]?.description ?? s.description ?? null,
    image_url: s.image_url ?? null,
  }));
}

// Busca un servicio publicado (o próximo) por slug o id. Se usa en la página
// de solicitud para resolver el servicio elegido desde la landing.
export async function getServiceBySlug(
  key: string,
  locale: Locale = "es"
): Promise<PublishedService | null> {
  const safeKey = String(key ?? "").trim();
  if (!safeKey) return null;

  const supabase = await createClient();

  const { error: probeError } = await supabase
    .from("services")
    .select("image_url")
    .limit(1);
  const hasImage = !probeError;

  const { error: transProbeError } = await supabase
    .from("services")
    .select("name_it")
    .limit(1);
  const hasTrans = !transProbeError;

  const baseCols = hasTrans
    ? "id, name, name_it, name_en, slug, description, description_it, description_en"
    : "id, name, slug, description";
  const selectCols = hasImage ? `${baseCols}, image_url` : baseCols;

  // No mezclar slug (texto) con id (uuid) en un .or(): Postgres intenta
  // castear el slug a uuid y falla. Se filtra según el formato del valor.
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    safeKey
  );

  const serviceQuery = supabase
    .from("services")
    .select(selectCols)
    .in("status", ["published", "coming_soon", "review", "paused"])
    .limit(1);

  const serviceQ = isUuid
    ? serviceQuery.eq("id", safeKey).maybeSingle()
    : serviceQuery.eq("slug", safeKey).maybeSingle();
  const { data, error } = await serviceQ;

  if (error) return null;

  const row = data as unknown as {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    name_it: string | null;
    name_en: string | null;
    description_it: string | null;
    description_en: string | null;
    image_url?: string | null;
  } | null;
  if (!row) return null;

  const localized = await localizeService(row, locale, hasTrans);

  return {
    id: row.id,
    name: localized.name ?? row.name,
    slug: row.slug,
    description: localized.description ?? row.description ?? null,
    image_url: row.image_url ?? null,
  };
}

// Servicios en estado 'coming_soon' ("Próximamente") para la sección
// "Los 3 servicios que estamos buscando". Solo aparecen los que tienen ese
// estado; el resto de estados queda excluido de esta sección.
export async function getComingSoonServices(
  locale: Locale = "es"
): Promise<PublishedService[]> {
  const supabase = await createClient();

  const { error: probeError } = await supabase
    .from("services")
    .select("image_url")
    .limit(1);
  const hasImage = !probeError;

  const { error: transProbeError } = await supabase
    .from("services")
    .select("name_it")
    .limit(1);
  const hasTrans = !transProbeError;

  const baseCols = hasTrans
    ? "id, name, name_it, name_en, slug, description, description_it, description_en"
    : "id, name, slug, description";
  const select = hasImage ? `${baseCols}, image_url` : baseCols;

  const { data, error } = await supabase
    .from("services")
    .select(select)
    .eq("status", "coming_soon")
    .order("created_at", { ascending: true })
    .limit(3);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    name_it: string | null;
    name_en: string | null;
    description_it: string | null;
    description_en: string | null;
    image_url?: string | null;
  }>;

  const localized = await localizeServices(rows, locale, hasTrans);

  return rows.map((s, i) => ({
    id: s.id,
    name: localized[i]?.name ?? s.name,
    slug: s.slug,
    description: localized[i]?.description ?? s.description ?? null,
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
