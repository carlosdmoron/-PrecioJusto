"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import { distributeRequest } from "./requests";

export type SolicitudQuestion = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
};

export type SolicitudFormData = {
  service: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
  } | null;
  form: { id: string; version: string } | null;
  questions: SolicitudQuestion[];
};

// Devuelve el formulario activo asociado a un servicio (slug o id) con todas
// sus preguntas. Si el servicio no existe o no tiene formulario activo, devuelve
// form/questions vacíos para que el frontend muestre el mensaje correspondiente.
export async function getSolicitudFormData(
  slugOrId: string
): Promise<SolicitudFormData> {
  const admin = await createAdminClient();
  const key = String(slugOrId ?? "").trim();
  if (!key) return { service: null, form: null, questions: [] };

  // Probamos si image_url existe para no romper el render si la columna aún no está.
  const { error: probeError } = await admin
    .from("services")
    .select("image_url")
    .limit(1);
  const hasImage = !probeError;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    key
  );

  // Usamos el cliente admin (service role) porque la RLS anon solo expone
  // servicios 'published'/'coming_soon'; un servicio en 'review'/'paused' con
  // formulario activo debe poder renderizar el asistente igualmente.
  const serviceQuery = admin
    .from("services")
    .select(
      hasImage
        ? "id, name, slug, description, image_url"
        : "id, name, slug, description"
    )
    .in("status", ["published", "coming_soon", "review", "paused"])
    .limit(1);

  // No usar .or(slug.eq.X,id.eq.X) en la misma query: mezclar una columna de
  // texto con una UUID hace que Postgres intente castear el slug a uuid y la
  // query falla (404). Se resuelve por slug o por id según el formato del valor.
  const serviceQ = isUuid
    ? serviceQuery.eq("id", key).maybeSingle()
    : serviceQuery.eq("slug", key).maybeSingle();
  const { data: service } = await serviceQ;
  const serviceRow = service as unknown as {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url?: string | null;
  } | null;

  if (!serviceRow) return { service: null, form: null, questions: [] };

  const { data: form } = await admin
    .from("forms")
    .select("id, version")
    .eq("service_id", serviceRow.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!form) {
    return {
      service: {
        id: serviceRow.id,
        name: serviceRow.name,
        slug: serviceRow.slug,
        description: serviceRow.description ?? null,
        image_url: serviceRow.image_url ?? null,
      },
      form: null,
      questions: [],
    };
  }

  const { data: questions } = await admin
    .from("form_questions")
    .select("id, label, type, required, options")
    .eq("form_id", form.id)
    .order("sort_order", { ascending: true });

  return {
    service: {
      id: serviceRow.id,
      name: serviceRow.name,
      slug: serviceRow.slug,
      description: serviceRow.description ?? null,
      image_url: serviceRow.image_url ?? null,
    },
    form: { id: form.id, version: form.version ?? "v1.0" },
    questions: (questions ?? []).map((q) => ({
      id: q.id,
      label: q.label,
      type: q.type,
      required: q.required ?? false,
      options: Array.isArray(q.options) ? q.options : [],
    })),
  };
}

export type SolicitudPayload = {
  service_id: string;
  form_id: string;
  answers: Record<string, unknown>;
  title?: string;
  description?: string;
  city?: string;
  budget?: number;
};

// Crea la solicitud y sus respuestas para un usuario YA AUTENTICADO.
export async function createSolicitud(data: SolicitudPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: request, error } = await supabase
    .from("requests")
    .insert({
      client_id: user.id,
      service_id: data.service_id,
      title: data.title ? String(data.title).slice(0, 200) : "Solicitud",
      description: data.description ?? null,
      city: data.city ?? null,
      budget: data.budget ?? null,
      status: "new",
    })
    .select("id, service:services!requests_service_id_fkey(name)")
    .single();

  if (error) throw new Error(error.message);

  if (data.form_id && request?.id) {
    const { error: respError } = await supabase
      .from("form_responses")
      .insert({
        form_id: data.form_id,
        request_id: request.id,
        answers: data.answers ?? {},
      });
    if (respError) throw new Error(respError.message);
  }

  if (request?.id) {
    const serviceRow = Array.isArray(request.service)
      ? request.service[0]
      : request.service;
    await distributeRequest(
      request.id,
      serviceRow?.name ?? "",
      data.city ?? ""
    ).catch((e) => console.error("Matching distribution error:", e));
  }

  revalidatePath("/dashboard-cliente/solicitudes", "page");
  revalidatePath("/dashboard-cliente", "page");
  return { success: true, id: request?.id };
}

// Guarda la solicitud como BORRADOR (sin usuario) asociada a un código anónimo.
// Se usa el cliente de servicio (rol de servicio) porque las políticas RLS de
// requests/form_responses exigen un client_id autenticado; el borrador aún no
// tiene propietario. Si ya existe un borrador con ese anon_code se actualiza.
export async function createDraftRequest(data: SolicitudPayload & { anon_code: string }) {
  const admin = createAdminClient();
  const code = String(data.anon_code ?? "").trim();
  if (!code) throw new Error("Código anónimo inválido");

  const { data: existing } = await admin
    .from("requests")
    .select("id")
    .eq("anon_code", code)
    .eq("status", "draft")
    .is("client_id", null)
    .limit(1)
    .maybeSingle();

  const common = {
    service_id: data.service_id,
    title: data.title ? String(data.title).slice(0, 200) : "Solicitud",
    description: data.description ?? null,
    city: data.city ?? null,
    budget: data.budget ?? null,
  };

  let requestId: string;

  if (existing) {
    requestId = existing.id;
    const { error } = await admin
      .from("requests")
      .update({ ...common, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);

    await admin.from("form_responses").delete().eq("request_id", existing.id);
  } else {
    const { data: created, error } = await admin
      .from("requests")
      .insert({ ...common, status: "draft", anon_code: code })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    requestId = created.id;
  }

  const { error: respError } = await admin.from("form_responses").insert({
    form_id: data.form_id,
    request_id: requestId,
    answers: data.answers ?? {},
  });
  if (respError) throw new Error(respError.message);

  return { success: true, id: requestId, anon_code: code };
}

// Vincula un borrador (por anon_code) al usuario autenticado y lo activa.
// Usa rol de servicio para poder actualizar el client_id (el borrador no tiene
// propietario todavía); la verificación del código impide robar borradores de otro.
export async function claimDraftRequest(anon_code: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const admin = createAdminClient();
  const code = String(anon_code ?? "").trim();
  if (!code) throw new Error("Código anónimo inválido");

  const { data: draft } = await admin
    .from("requests")
    .select(
      "id, city, service:services!requests_service_id_fkey(name)"
    )
    .eq("anon_code", code)
    .eq("status", "draft")
    .is("client_id", null)
    .limit(1)
    .maybeSingle();

  if (!draft) {
    throw new Error("No se encontró la solicitud pendiente.");
  }

  const { error } = await admin
    .from("requests")
    .update({
      client_id: user.id,
      status: "new",
      anon_code: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", draft.id);
  if (error) throw new Error(error.message);

  const serviceRow = Array.isArray(draft.service) ? draft.service[0] : draft.service;
  await distributeRequest(
    draft.id,
    serviceRow?.name ?? "",
    draft.city ?? ""
  ).catch((e) => console.error("Matching distribution error:", e));

  revalidatePath("/dashboard-cliente/solicitudes", "page");
  revalidatePath("/dashboard-cliente", "page");
  return { success: true, id: draft.id };
}