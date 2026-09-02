"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error(
      "Tu sesión ha expirado o no has iniciado sesión. Vuelve a iniciar sesión."
    );
  }
  return user;
}

// Valida que el usuario autenticado sea administrador y devuelve un cliente de
// servicio (bypasea RLS) para operaciones que requieren privilegios de admin.
async function requireAdmin() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    throw new Error("No se pudo verificar permisos de administrador.");
  }
  const isAdmin =
    profile?.role === "admin" ||
    profile?.role === "superadmin" ||
    profile?.role === "SuperAdmin";
  if (!isAdmin) {
    throw new Error("No tienes permisos de administrador para esta acción.");
  }
  return createAdminClient();
}

export type AdminServiceRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  status: string;
  category: string | null;
  requests_count: number | null;
  revenue: number | null;
};

export type AdminServiceInput = {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  status: string;
  category_id?: string | null;
};

export async function listCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, status")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    status: string | null;
  }>;
}

export async function listServices(): Promise<AdminServiceRow[]> {
  const supabase = await createClient();

  // La columna image_url puede no existir aún si la migración 0004 no se ha
  // aplicado en la BD. Se comprueba con un SELECT mínimo: si falla, la columna
  // no existe y no se referencia, para no romper el render del dashboard. Cuando
  // se aplique la migración, la columna pasará a existir y se usará automáticamente.
  const { error: probeError } = await supabase
    .from("services")
    .select("image_url")
    .limit(1);
  const hasImage = !probeError;

  const select = hasImage
    ? "id, name, slug, description, image_url, status, requests_count, revenue, category:categories(name)"
    : "id, name, slug, description, status, requests_count, revenue, category:categories(name)";

  const { data, error } = await supabase
    .from("services")
    .select(select)
    .order("name");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url?: string | null;
    status: string;
    requests_count: number | null;
    revenue: number | null;
    category: { name: string } | { name: string }[] | null;
  }>;

  return rows.map((s) => {
    const cat = Array.isArray(s.category) ? s.category[0] : s.category;
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description ?? null,
      image_url: s.image_url ?? null,
      status: s.status,
      requests_count: s.requests_count ?? 0,
      revenue: s.revenue ?? 0,
      category: cat?.name ?? null,
    };
  });
}

export async function createService(input: AdminServiceInput) {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description ?? "",
      image_url: input.image_url ?? null,
      status: input.status,
      category_id: input.category_id ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("No se pudo verificar la creación en la base de datos");
  revalidatePath("/[lang]/dashboard-admin/servicios");
  return { success: true, id: data.id };
}

export async function updateService(id: string, input: AdminServiceInput) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description ?? "",
      image_url: input.image_url ?? null,
      status: input.status,
      category_id: input.category_id ?? null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await supabase
    .from("services")
    .select("id, name, status")
    .eq("id", id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.status !== input.status) {
    throw new Error("No se pudo verificar la actualización en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/servicios");
  return { success: true };
}

export async function setServiceStatus(id: string, status: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await supabase
    .from("services")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.status !== status) {
    throw new Error("No se pudo verificar el cambio de estado en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/servicios");
  return { success: true };
}

export async function deleteService(id: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await supabase
    .from("services")
    .select("id")
    .eq("id", id);
  if (checkErr) throw new Error(checkErr.message);
  if (check && check.length > 0) {
    throw new Error("No se pudo verificar la eliminación en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/servicios");
  return { success: true };
}

// ===== SOLICITUDES (requests) =====
export async function listRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, title, description, city, urgency, status, quotes_count, budget, created_at, client:profiles!requests_client_id_fkey(first_name, last_name, email), service:services!requests_service_id_fkey(name)"
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<Record<string, any>>;
  return rows.map((r) => {
    const clientRow = Array.isArray(r.client) ? r.client[0] : r.client;
    const firstName = clientRow?.first_name?.trim() ?? "";
    const lastName = clientRow?.last_name?.trim() ?? "";
    const clientName = `${firstName} ${lastName}`.trim();
    const clientEmail = clientRow?.email ?? "—";
    return {
      id: r.id,
      code: `SOL-${(r.id ?? "").slice(0, 4).toUpperCase()}`,
      title: r.title,
      service: Array.isArray(r.service) ? r.service[0]?.name : r.service?.name ?? "—",
      client: clientName || clientEmail,
      clientEmail,
      city: r.city ?? "—",
      urgency: r.urgency ?? "none",
      status: r.status ?? "new",
      quotes: r.quotes_count ?? 0,
      date: r.created_at ? new Date(r.created_at).toLocaleDateString("es-ES") : "—",
    };
  });
}

export async function setRequestStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await supabase
    .from("requests")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.status !== status) {
    throw new Error("No se pudo verificar el cambio de estado en la base de datos");
  }
  await logRequestAudit(id, `request_status_${status}`, { status });
  revalidatePath("/[lang]/dashboard-admin/solicitudes");
  return { success: true };
}

// Registra una entrada de auditoría para una solicitud. Usa el cliente de
// servicio (bypasa RLS) y el usuario autenticado como autor del cambio.
async function logRequestAudit(
  requestId: string,
  action: string,
  details: Record<string, unknown> = {}
) {
  try {
    const admin = await requireAdmin();
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    await admin.from("audit_logs").insert({
      user_id: user?.id ?? null,
      action,
      entity_type: "request",
      entity_id: requestId,
      details: { ...details, ts: new Date().toISOString() },
    });
  } catch {
    // El historial es auxiliar: nunca debe impedir la operación principal.
  }
}

export type RequestDetail = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  service: string;
  service_id: string | null;
  category: string | null;
  city: string | null;
  budget: string | null;
  urgency: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  client: { name: string; email: string };
  answers: Array<{ question: string; answer: string }>;
  quotes: Array<{
    id: string;
    professional: string;
    amount_min: string | null;
    amount_max: string | null;
    status: string;
    created_at: string | null;
  }>;
  history: Array<{ action: string; details: string; created_at: string | null }>;
  conversations: Array<{ id: string; status: string; last_message: string | null; last_message_at: string | null }>;
};

// Devuelve toda la información necesaria para el panel de detalle de una
// solicitud: datos básicos, respuestas del formulario, presupuestos recibidos,
// historial de cambios, conversaciones y datos de contacto del cliente.
// Es defensivo: cada consulta falla de forma independiente sin crashear.
export async function getRequestDetails(id: string): Promise<RequestDetail | null> {
  const adminSupabase = await requireAdmin();

  const [reqResult, answersResult, quotesResult, historyResult, convResult] =
    await Promise.all([
      adminSupabase
        .from("requests")
        .select(
          "*, " +
            "client:profiles!requests_client_id_fkey(first_name, last_name, email), " +
            "service:services!requests_service_id_fkey(name)"
        )
        .eq("id", id)
        .maybeSingle(),
      adminSupabase
        .from("form_responses")
        .select("answers")
        .eq("request_id", id)
        .maybeSingle(),
      adminSupabase
        .from("quotes")
        .select(
          "id, amount_min, amount_max, status, created_at, " +
            "professional:professionals!quotes_professional_id_fkey(id, profile:profiles!professionals_id_fkey(first_name, last_name, email))"
        )
        .eq("request_id", id)
        .order("created_at", { ascending: false }),
      adminSupabase
        .from("audit_logs")
        .select("action, details, created_at")
        .eq("entity_type", "request")
        .eq("entity_id", id)
        .order("created_at", { ascending: false }),
      adminSupabase
        .from("conversations")
        .select("id, status, last_message, last_message_at")
        .eq("request_id", id)
        .order("created_at", { ascending: true }),
    ]);

  const req = reqResult.data as Record<string, any> | null;
  if (reqResult.error || !req) return null;

  const clientRow = Array.isArray(req.client) ? req.client[0] : req.client;
  const clientName = clientRow?.first_name
    ? `${clientRow.first_name} ${clientRow.last_name ?? ""}`.trim()
    : clientRow?.email ?? "—";

  const serviceRow: any = Array.isArray(req.service) ? req.service[0] : req.service;
  const categoryRow: any = null;

  // Respuestas del formulario: el JSON responde con claves (ids de pregunta).
  // Se muestran de forma genérica y defensiva añadiendo el prefijo de la clave.
  const rawAnswers: Record<string, any> = answersResult.data?.answers ?? {};
  const answers: Array<{ question: string; answer: string }> = [];
  for (const [k, v] of Object.entries(rawAnswers ?? {})) {
    const label = k.replace(/[_-]+/g, " ").trim();
    const val = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    if (val) answers.push({ question: label || "Respuesta", answer: val });
  }

  const quotes = (quotesResult.data ?? []).map((q: any) => {
    const pro = Array.isArray(q.professional) ? q.professional[0] : q.professional;
    const proProfile = Array.isArray(pro?.profile) ? pro.profile[0] : pro?.profile;
    const professional = proProfile?.first_name
      ? `${proProfile.first_name} ${proProfile.last_name ?? ""}`.trim()
      : proProfile?.email ?? "—";
    const fmt = (n: any) =>
      n != null ? `€${Number(n).toLocaleString("es-ES", { minimumFractionDigits: 2 })}` : null;
    return {
      id: q.id,
      professional,
      amount_min: fmt(q.amount_min),
      amount_max: fmt(q.amount_max),
      status: q.status ?? "draft",
      created_at: q.created_at ? new Date(q.created_at).toLocaleString("es-ES") : null,
    };
  });

  const history = (historyResult.data ?? []).map((h: any) => ({
    action: h.action ?? "",
    details:
      typeof h.details === "object" && h.details !== null
        ? JSON.stringify(h.details)
        : String(h.details ?? ""),
    created_at: h.created_at ? new Date(h.created_at).toLocaleString("es-ES") : null,
  }));

  const conversations = (convResult.data ?? []).map((c: any) => ({
    id: c.id,
    status: c.status ?? "active",
    last_message: c.last_message ?? null,
    last_message_at: c.last_message_at
      ? new Date(c.last_message_at).toLocaleString("es-ES")
      : null,
  }));

  return {
    id: req.id,
    code: `SOL-${(req.id ?? "").slice(0, 4).toUpperCase()}`,
    title: req.title ?? "—",
    description: req.description ?? null,
    service: serviceRow?.name ?? "—",
    service_id: req.service_id ?? null,
    category: categoryRow?.name ?? null,
    city: req.city ?? null,
    budget:
      req.budget != null
        ? `€${Number(req.budget).toLocaleString("es-ES", { minimumFractionDigits: 2 })}`
        : null,
    urgency: req.urgency ?? "none",
    status: req.status ?? "new",
    created_at: req.created_at ? new Date(req.created_at).toLocaleString("es-ES") : null,
    updated_at: req.updated_at ? new Date(req.updated_at).toLocaleString("es-ES") : null,
    client: { name: clientName, email: clientRow?.email ?? "—" },
    answers,
    quotes,
    history,
    conversations,
  };
}

export async function updateRequest(
  id: string,
  input: {
    service_id?: string;
    description?: string;
    city?: string;
    urgency?: string;
  }
) {
  const adminSupabase = await requireAdmin();
  const patch: Record<string, unknown> = {};
  if (input.service_id !== undefined) patch.service_id = input.service_id || null;
  if (input.description !== undefined) patch.description = input.description;
  if (input.city !== undefined) patch.city = input.city;
  if (input.urgency !== undefined) patch.urgency = input.urgency;
  if (Object.keys(patch).length === 0) {
    throw new Error("No hay cambios para guardar");
  }

  const { error } = await adminSupabase
    .from("requests")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const { data: check, error: checkErr } = await adminSupabase
    .from("requests")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check) throw new Error("No se pudo verificar el cambio en la base de datos");

  await logRequestAudit(id, "request_edited", patch);
  revalidatePath("/[lang]/dashboard-admin/solicitudes");
  return { success: true };
}

// ===== MATCHING (matching_rules) =====
export type MatchingRuleRow = {
  id: string;
  name: string;
  criterion: string;
  zone_postal_code: string | null;
  priority: number;
  professionals_count: number;
  status: string;
};

export async function listMatchingRules(): Promise<MatchingRuleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matching_rules")
    .select("*")
    .order("priority", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MatchingRuleRow[];
}

export async function toggleMatchingRule(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("matching_rules")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await supabase
    .from("matching_rules")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.status !== status) {
    throw new Error("No se pudo verificar el cambio de estado en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/matching");
  return { success: true };
}

export async function createMatchingRule(input: {
  name: string;
  criterion: string;
  zone_postal_code: string;
  priority: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matching_rules")
    .insert({
      name: input.name,
      criterion: input.criterion,
      zone_postal_code: input.zone_postal_code || null,
      priority: input.priority,
      status: "active",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("No se pudo verificar la creación en la base de datos");
  revalidatePath("/[lang]/dashboard-admin/matching");
  return { success: true, id: data.id };
}

export async function updateMatchingRule(
  id: string,
  input: { name: string; criterion: string; zone_postal_code: string; priority: number }
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matching_rules")
    .update({
      name: input.name,
      criterion: input.criterion,
      zone_postal_code: input.zone_postal_code || null,
      priority: input.priority,
    })
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("No se pudo verificar la actualización en la base de datos");
  revalidatePath("/[lang]/dashboard-admin/matching");
  return { success: true };
}

export async function deleteMatchingRule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("matching_rules").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/[lang]/dashboard-admin/matching");
  return { success: true };
}

export async function duplicateMatchingRule(id: string) {
  const supabase = await createClient();
  const { data: rule, error: getErr } = await supabase
    .from("matching_rules")
    .select("*")
    .eq("id", id)
    .single();
  if (getErr) throw new Error(getErr.message);
  const { data, error } = await supabase
    .from("matching_rules")
    .insert({
      name: `${rule.name} (copia)`,
      criterion: rule.criterion,
      zone_postal_code: rule.zone_postal_code || null,
      priority: rule.priority,
      status: "inactive",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("No se pudo verificar la duplicación en la base de datos");
  revalidatePath("/[lang]/dashboard-admin/matching");
  return { success: true, id: data.id };
}

// Obtiene profesionales reales (con servicios y perfil) como candidatos
// para el simulador de matching. Defensivo: si falta una columna o tabla,
// devuelve [] en vez de crashear.
export async function listMatchingCandidates() {
  const supabase = await createClient();
  try {
    const { data: profs, error } = await supabase
      .from("professionals")
      .select(
        "id, province, municipality, rating, verification_status, total_jobs_completed, admin_status, " +
          "profile:profiles!professionals_id_fkey(first_name, last_name, email), " +
          "services:professional_services!professional_services_professional_id_fkey(service:services(id, name))"
      )
      .eq("admin_status", "active")
      .limit(50);
    if (error) return [];
    const rows = (profs ?? []) as Array<Record<string, any>>;
    return rows
      .map((p) => {
        const prof = Array.isArray(p.profile) ? p.profile[0] : p.profile;
        const services = Array.isArray(p.services) ? p.services : [];
        return {
          id: p.id,
          name: prof?.first_name
            ? `${prof.first_name} ${prof.last_name ?? ""}`.trim()
            : prof?.email ?? p.id,
          services: services
            .map((s: any) => {
              const sv = Array.isArray(s.service) ? s.service[0] : s.service;
              return sv?.name ?? null;
            })
            .filter(Boolean),
          province: p.province,
          municipality: p.municipality,
          rating: p.rating ?? 0,
          verification_status: p.verification_status ?? "pending",
          total_jobs_completed: p.total_jobs_completed ?? 0,
          available: true,
          contacts_this_month: 0,
        };
      })
      .filter((c) => c.services.length > 0);
  } catch {
    return [];
  }
}

export async function listServicesForSimulator() {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("services")
      .select("id, name")
      .eq("status", "published")
      .order("name");
    if (error) return [];
    return (data ?? []).map((s: any) => ({ id: s.id, name: s.name }));
  } catch {
    return [];
  }
}

// ===== PROFESIONALES (professionals) =====
export async function listProfessionals() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professionals")
    .select("*, profile:profiles!professionals_id_fkey(first_name, last_name, email)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<Record<string, any>>;
  return rows.map((p) => {
    const prof = Array.isArray(p.profile) ? p.profile[0] : p.profile;
    return {
      id: p.id,
      name: prof?.first_name
        ? `${prof.first_name} ${prof.last_name ?? ""}`.trim()
        : prof?.email ?? p.id,
      services: p.total_jobs_completed ?? 0,
      zone: [p.province, p.municipality].filter(Boolean).join(", ") || "—",
      status: p.admin_status ?? "pending",
      verified: p.verification_status ?? "pending",
      rating: p.rating ?? 0,
      quotes: p.total_jobs_completed ?? 0,
      balance: p.balance ?? 0,
      conversion: `${Math.round((p.rating ?? 0) * 20)}%`,
    };
  });
}

export async function setProfessionalAdminStatus(id: string, status: string) {
  const adminSupabase = await requireAdmin();
  const { error } = await adminSupabase
    .from("professionals")
    .update({ admin_status: status })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // Bloquear también revoca el acceso: el perfil pasa a 'banned' para que el
  // profesional no pueda iniciar sesión ni usar la plataforma.
  if (status === "blocked") {
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({ status: "banned" })
      .eq("id", id);
    if (profileError) throw new Error(profileError.message);
  }

  // Reactivar restablece el acceso: si el perfil estaba 'banned' (por un bloqueo
  // previo) vuelve a 'active' para que pueda iniciar sesión y usar la plataforma.
  if (status === "active") {
    const { error: restoreError } = await adminSupabase
      .from("profiles")
      .update({ status: "active" })
      .eq("id", id);
    if (restoreError) throw new Error(restoreError.message);
  }

  const { data: check, error: checkErr } = await adminSupabase
    .from("professionals")
    .select("admin_status")
    .eq("id", id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.admin_status !== status) {
    throw new Error("No se pudo verificar el cambio de estado en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/profesionales");
  return { success: true };
}

// ===== RESEÑAS (reviews) =====
export async function listReviews() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, verified, status, created_at, client:profiles!reviews_client_id_fkey(email), professional:profiles!reviews_professional_id_fkey(email)"
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<Record<string, any>>;
  return rows.map((r) => {
    const cl = Array.isArray(r.client) ? r.client[0] : r.client;
    const pr = Array.isArray(r.professional) ? r.professional[0] : r.professional;
    return {
      id: r.id,
      client: cl?.email ?? "—",
      professional: pr?.email ?? "—",
      rating: r.rating ?? 0,
      status: r.status ?? "pending",
      verified: r.verified ? "Sí" : "No",
      date: r.created_at ? new Date(r.created_at).toLocaleDateString("es-ES") : "—",
      comment: r.comment ?? "",
    };
  });
}

export async function setReviewStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await supabase
    .from("reviews")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.status !== status) {
    throw new Error("No se pudo verificar el cambio de estado en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/resenas");
  return { success: true };
}

// ===== TRABAJOS (jobs) =====
export async function listJobs() {
  const adminSupabase = await requireAdmin();
  const { data, error } = await adminSupabase
    .from("jobs")
    .select(
      "id, status, commission, start_date, end_date, created_at, " +
        "request:requests!jobs_request_id_fkey(id, title), " +
        "client:profiles!jobs_client_id_fkey(first_name, last_name, email), " +
        "professional:professionals!jobs_professional_id_fkey(id, profile:profiles!professionals_id_fkey(first_name, last_name, email))"
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<Record<string, any>>;
  return rows.map((j) => {
    const req = Array.isArray(j.request) ? j.request[0] : j.request;
    const cl = Array.isArray(j.client) ? j.client[0] : j.client;
    const pro = Array.isArray(j.professional) ? j.professional[0] : j.professional;
    const proProfile = Array.isArray(pro?.profile) ? pro.profile[0] : pro?.profile;
    return {
      id: j.id,
      request: req?.title || "—",
      requestTitle: req?.title ?? "—",
      client: cl?.first_name
        ? `${cl.first_name} ${cl.last_name ?? ""}`.trim()
        : cl?.email ?? "—",
      professional: proProfile?.first_name
        ? `${proProfile.first_name} ${proProfile.last_name ?? ""}`.trim()
        : proProfile?.email ?? "—",
      status: j.status ?? "selected",
      commission: j.commission != null ? `€${Number(j.commission).toFixed(2)}` : "€0.00",
      startDate: j.start_date ? new Date(j.start_date).toLocaleDateString("es-ES") : "—",
      endDate: j.end_date ? new Date(j.end_date).toLocaleDateString("es-ES") : "—",
    };
  });
}

export async function setJobStatus(id: string, status: string) {
  const adminSupabase = await requireAdmin();
  const allowed = ["selected", "started", "inProgress", "completed", "cancelled", "disputed"];
  if (!allowed.includes(status)) {
    throw new Error("Estado de trabajo no válido");
  }
  const { error } = await adminSupabase
    .from("jobs")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await adminSupabase
    .from("jobs")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.status !== status) {
    throw new Error("No se pudo verificar el cambio de estado en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/trabajos");
  return { success: true };
}

// ===== SOPORTE (support_tickets) =====
export async function listTickets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<Record<string, any>>;
  return rows.map((t) => ({
    id: t.id,
    from: t.sender_id ?? "—",
    type: t.sender_type ?? "client",
    priority: t.priority ?? "medium",
    sla: `${t.sla_hours ?? 8}h`,
    status: t.status ?? "open",
    assigned: t.assigned_to ?? "—",
    date: t.created_at ? new Date(t.created_at).toLocaleDateString("es-ES") : "—",
    description: t.description ?? "",
  }));
}

export async function setTicketStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("support_tickets")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await supabase
    .from("support_tickets")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.status !== status) {
    throw new Error("No se pudo verificar el cambio de estado en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/soporte");
  return { success: true };
}

export async function createTicket(input: {
  sender_id: string;
  sender_type: string;
  priority: string;
  description: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      sender_id: input.sender_id || null,
      sender_type: input.sender_type || "client",
      priority: input.priority || "medium",
      sla_hours: 8,
      description: input.description || null,
      status: "open",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("No se pudo verificar la creación en la base de datos");
  revalidatePath("/[lang]/dashboard-admin/soporte");
  return { success: true };
}

// ===== CLIENTES =====
export async function listClients() {
  const adminSupabase = await requireAdmin();
  const { data, error } = await adminSupabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, phone, status, created_at, updated_at, requests:requests!requests_client_id_fkey(id)"
    )
    .eq("role", "client")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<Record<string, any>>;
  return rows.map((c) => {
    const reqs = Array.isArray(c.requests) ? c.requests : [];
    return {
      id: c.id,
      name: [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email || c.id,
      email: c.email ?? "—",
      phone: c.phone ?? "—",
      requests: String(reqs.length),
      registered: c.created_at
        ? new Date(c.created_at).toLocaleDateString("es-ES")
        : "—",
      lastAccess: c.updated_at
        ? new Date(c.updated_at).toLocaleDateString("es-ES")
        : "—",
      status: c.status ?? "active",
    };
  });
}

export async function setClientBlocked(id: string) {
  const adminSupabase = await requireAdmin();
  const { error } = await adminSupabase
    .from("profiles")
    .update({ status: "banned" })
    .eq("role", "client")
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await adminSupabase
    .from("profiles")
    .select("status")
    .eq("id", id)
    .eq("role", "client")
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.status !== "banned") {
    throw new Error("No se pudo verificar el bloqueo del cliente en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/clientes");
  return { success: true };
}

export async function setClientActive(id: string) {
  const adminSupabase = await requireAdmin();
  const { error } = await adminSupabase
    .from("profiles")
    .update({ status: "active" })
    .eq("role", "client")
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await adminSupabase
    .from("profiles")
    .select("status")
    .eq("id", id)
    .eq("role", "client")
    .maybeSingle();
  if (checkErr) throw new Error(checkErr.message);
  if (!check || check.status !== "active") {
    throw new Error("No se pudo verificar la reactivación del cliente en la base de datos");
  }
  revalidatePath("/[lang]/dashboard-admin/clientes");
  return { success: true };
}
