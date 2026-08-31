"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

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

export type AdminServiceRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  category: string | null;
  requests_count: number | null;
  revenue: number | null;
};

export type AdminServiceInput = {
  name: string;
  slug: string;
  description?: string;
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
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, name, slug, description, status, requests_count, revenue, category:categories(name)"
    )
    .order("name");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
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
  revalidatePath("/[lang]/dashboard-admin/solicitudes");
  return { success: true };
}

// ===== MATCHING (matching_rules) =====
export async function listMatchingRules() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matching_rules")
    .select("*")
    .order("priority", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
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
  const supabase = await createClient();
  const { error } = await supabase
    .from("professionals")
    .update({ admin_status: status })
    .eq("id", id);
  if (error) throw new Error(error.message);
  const { data: check, error: checkErr } = await supabase
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
