"use server";

import { createClient } from "../../lib/supabase/server";
import { revalidatePath } from "next/cache";
import { runMatching } from "../lib/matching";

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

  const { data: inserted, error } = await supabase
    .from("requests")
    .insert({
      client_id: user.id,
      title: formData.title,
      service_id: formData.service_id,
      description: formData.description,
      city: formData.city,
      budget: formData.budget,
      status: "new",
    })
    .select("id, service:services!requests_service_id_fkey(name)")
    .single();

  if (error) throw error.message;

  // Disparo de matching: distribuye la solicitud a los profesionales idóneos.
  // Es defensivo: si el matching falla o la tabla de asignación no existe, la
  // creación de la solicitud no se ve afectada.
  if (inserted?.id) {
    const serviceRow = Array.isArray(inserted.service)
      ? inserted.service[0]
      : inserted.service;
    const serviceName = serviceRow?.name ?? "";
    await distributeRequest(inserted.id, serviceName, formData.city).catch(
      (e) => console.error("Matching distribution error:", e)
    );
  }

  revalidatePath("/dashboard-cliente/solicitudes");
  revalidatePath("/dashboard-cliente");
  return { success: true, id: inserted?.id };
}

// Ejecuta el matching de una solicitud y registra los profesionales asignados.
async function distributeRequest(
  requestId: string,
  serviceName: string,
  city: string
) {
  const supabase = await createClient();

  const [{ data: rules }, { data: rows }] = await Promise.all([
    supabase
      .from("matching_rules")
      .select("id, name, criterion, priority, status")
      .eq("status", "active"),
    supabase
      .from("professionals")
      .select(
        "id, province, municipality, rating, verification_status, total_jobs_completed, admin_status, " +
          "services:professional_services!professional_services_professional_id_fkey(service:services(id, name))"
      )
      .eq("admin_status", "active")
      .limit(50),
  ]);
  if (Array.isArray(rows) === false) return;

  const candidates = (rows ?? []).map((p: any) => {
    const services = Array.isArray(p.services) ? p.services : [];
    return {
      id: p.id,
      name: p.id,
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
  });

  const ranked = runMatching(candidates, (rules ?? []) as any[], {
    serviceName: serviceName ?? "",
    zone: city ?? "",
    limit: 5,
  });
  const selected = ranked.filter((r) => r.passed);

  if (selected.length === 0) return;

  // Registro de asignación (defensivo: si match_assignments no existe, se ignora)
  const { error: insErr } = await supabase.from("match_assignments").insert(
    selected.map((s) => ({
      request_id: requestId,
      professional_id: s.id,
      score: Math.round(s.score),
      status: "assigned",
    }))
  );
  if (insErr) {
    console.warn("match_assignments insert skipped:", insErr.message);
  }
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
