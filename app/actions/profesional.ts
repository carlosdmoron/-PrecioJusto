"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";
import { localizeQuestions, localizeServices, localizeService } from "../../lib/localize";
import type { Locale } from "./services";
import type { SolicitudQuestion } from "./solicitud";

export type PublishedService = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

export type ProfesionalFormData = {
  service: PublishedService | null;
  form: { id: string; version: string } | null;
  questions: SolicitudQuestion[];
};

// ---------------------------------------------------- consulta de servicios

// Servicios publicados que tienen un formulario de PROFESIONAL activo: son los
// que muestra la sección "¿Eres profesional?" de la landing.
export async function getProfesionalServices(
  locale: Locale = "es"
): Promise<PublishedService[]> {
  const supabase = await createClient();

  // La columna form_type existe desde la migración 0012; si aún no está
  // aplicada la sección simplemente no se muestra.
  const { error: typeProbe } = await supabase
    .from("forms")
    .select("form_type")
    .limit(1);
  if (typeProbe) return [];

  const { data: activeForms, error: formsError } = await supabase
    .from("forms")
    .select("service_id")
    .eq("form_type", "professional")
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

// ---------------------------------------------------- datos del formulario

// Devuelve el formulario de PROFESIONAL activo asociado a un servicio
// (slug o id) con todas sus preguntas localizadas. Si el servicio no existe o
// no tiene formulario profesional activo, devuelve form/questions vacíos para
// que el frontend muestre el estado correspondiente.
export async function getProfesionalFormData(
  slugOrId: string,
  locale: Locale = "es"
): Promise<ProfesionalFormData> {
  const admin = await createAdminClient();
  const key = String(slugOrId ?? "").trim();
  if (!key) return { service: null, form: null, questions: [] };

  // La columna form_type existe desde la migración 0012; si aún no está
  // aplicada no hay formularios profesionales y la página queda "cerrada".
  const { error: typeProbe } = await admin
    .from("forms")
    .select("form_type")
    .limit(1);
  if (typeProbe) return { service: null, form: null, questions: [] };

  const { error: transProbeError } = await admin
    .from("services")
    .select("name_it")
    .limit(1);
  const hasTrans = !transProbeError;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    key
  );

  const baseServiceCols = hasTrans
    ? "id, name, name_it, name_en, slug, description, description_it, description_en"
    : "id, name, slug, description";
  const serviceQuery = admin
    .from("services")
    .select(baseServiceCols)
    .in("status", ["published", "coming_soon", "review", "paused"])
    .limit(1);

  const serviceQ = isUuid
    ? serviceQuery.eq("id", key).maybeSingle()
    : serviceQuery.eq("slug", key).maybeSingle();
  const { data: service } = await serviceQ;
  const serviceRow = service as unknown as {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    name_it: string | null;
    name_en: string | null;
    description_it: string | null;
    description_en: string | null;
  } | null;

  if (!serviceRow) return { service: null, form: null, questions: [] };

  const localizedService = await localizeService(serviceRow, locale, hasTrans);

  const empty = (): ProfesionalFormData => ({
    service: {
      id: serviceRow.id,
      name: localizedService.name,
      slug: serviceRow.slug,
      description: localizedService.description ?? null,
      image_url: null,
    },
    form: null,
    questions: [],
  });

  const { data: form } = await admin
    .from("forms")
    .select("id, version")
    .eq("service_id", serviceRow.id)
    .eq("form_type", "professional")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!form) return empty();

  const qSelect = hasTrans
    ? "id, label, label_it, label_en, type, required, options, options_it, options_en"
    : "id, label, type, required, options";

  const { data: questions } = await admin
    .from("form_questions")
    .select(qSelect)
    .eq("form_id", form.id)
    .order("sort_order", { ascending: true });

  const questionRows = (questions ?? []) as unknown as Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
    options: string[] | null;
    label_it: string | null;
    label_en: string | null;
    options_it: string[] | null;
    options_en: string[] | null;
  }>;

  const localized = await localizeQuestions(questionRows, locale, hasTrans);

  return {
    service: {
      id: serviceRow.id,
      name: localizedService.name,
      slug: serviceRow.slug,
      description: localizedService.description ?? null,
      image_url: null,
    },
    form: { id: form.id, version: form.version ?? "v1.0" },
    questions: questionRows.map((q, i) => ({
      id: q.id,
      label: localized[i]?.label ?? q.label,
      type: q.type,
      required: q.required ?? false,
      options: localized[i]?.options ?? (Array.isArray(q.options) ? q.options : []),
    })),
  };
}

// ---------------------------------------------------------------- envío

export type ProfesionalEnrollment = {
  service_id: string;
  form_id: string;
  answers: Record<string, unknown>;
  account?: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    password: string;
  } | null;
};

type Validation = {
  formId: string;
};

async function loadAndValidate(
  serviceId: string,
  formId: string,
  answers: Record<string, unknown>,
  requiredError: string,
  invalidOptionError: string
): Promise<Validation> {
  const admin = createAdminClient();

  const { data: service } = await admin
    .from("services")
    .select("id")
    .eq("id", serviceId)
    .maybeSingle();
  if (!service) throw new Error("Servicio inexistente.");

  const { data: form } = await admin
    .from("forms")
    .select("id")
    .eq("id", formId)
    .eq("service_id", serviceId)
    .eq("form_type", "professional")
    .eq("status", "active")
    .maybeSingle();
  if (!form) throw new Error("El formulario de profesional no está disponible.");

  const { data: questions } = await admin
    .from("form_questions")
    .select("id, type, required, options")
    .eq("form_id", formId)
    .order("sort_order", { ascending: true });
  const qs = (questions ?? []) as Array<{
    id: string;
    type: string;
    required: boolean;
    options: string[] | null;
  }>;

  const isEmpty = (v: unknown): boolean => {
    if (v == null) return true;
    if (Array.isArray(v)) return v.length === 0;
    return String(v).trim().length === 0;
  };

  for (const q of qs) {
    const value = answers[q.id];
    if (q.required && isEmpty(value)) {
      throw new Error(requiredError);
    }
    if (isEmpty(value)) continue;

    const isChoice =
      q.type === "radio" || q.type === "select" || q.type === "checkbox";
    if (isChoice) {
      const valid = new Set(q.options ?? []);
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (!valid.has(String(v))) {
          throw new Error(invalidOptionError);
        }
      }
    }
  }

  return { formId };
}

async function resolveProfessionalUser(
  account: ProfesionalEnrollment["account"],
  notAuthedError: string,
  emailInUseError: string
): Promise<{ userId: string; email: string }> {
  const supabase = await createClient();
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  if (sessionUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", sessionUser.id)
      .maybeSingle();
    if (profile?.role !== "professional") {
      throw new Error(
        "Tu cuenta ya existe con otro rol. Usa una cuenta de profesional o contacta con soporte."
      );
    }
    return { userId: sessionUser.id, email: sessionUser.email ?? "" };
  }

  // Invitado: crea la cuenta de profesional en el mismo envío.
  if (!account?.email || !account.password) {
    throw new Error(notAuthedError);
  }
  const email = String(account.email).trim();
  const firstName = String(account.firstName ?? "").trim();
  const lastName = String(account.lastName ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Email inválido");
  if (account.password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: account.password,
    options: {
      data: { role: "professional", first_name: firstName, last_name: lastName },
    },
  });
  if (error) {
    const msg = String(error.message ?? "").toLowerCase();
    if (msg.includes("already") || msg.includes("exists") || msg.includes("ya existe")) {
      throw new Error(emailInUseError);
    }
    throw new Error(error.message);
  }
  const userId = data?.user?.id;
  if (!userId) throw new Error(notAuthedError);

  const admin = createAdminClient();
  const patch: Record<string, string> = {
    id: userId,
    email,
    role: "professional",
    first_name: firstName,
    last_name: lastName,
  };
  const phone = String(account.phone ?? "").trim();
  if (phone) patch.phone = phone;
  await admin
    .from("profiles")
    .upsert(patch, { onConflict: "id" })
    .then(() => undefined, () => undefined);

  return { userId, email };
}

// Crea (o completa) el perfil profesional: fila en professionals,
// asociación professional_services (si no existe ya) y respuestas del
// formulario en form_responses con professional_id.
export async function submitProfesionalEnrollment(
  input: ProfesionalEnrollment,
  texts: {
    required?: string;
    invalidOption?: string;
    notAuthed?: string;
    emailInUse?: string;
    duplicate?: string;
    saveError?: string;
  } = {}
) {
  const required = texts.required ?? "Responde todas las preguntas obligatorias.";
  const invalidOption = texts.invalidOption ?? "Alguna opción de respuesta no es válida.";
  const notAuthed = texts.notAuthed ?? "Inicia sesión para continuar.";
  const emailInUse = texts.emailInUse ?? "Ya existe una cuenta con ese email. Inicia sesión.";
  const duplicate =
    texts.duplicate ?? "Ya tienes un perfil registrado para este servicio.";
  const saveError = texts.saveError ?? "No se pudo guardar tu registro. Inténtalo de nuevo.";

  if (!input.service_id || !input.form_id) {
    throw new Error("Faltan datos del formulario.");
  }

  const { formId } = await loadAndValidate(
    input.service_id,
    input.form_id,
    input.answers ?? {},
    required,
    invalidOption
  );

  const { userId, email } = await resolveProfessionalUser(
    input.account ?? null,
    notAuthed,
    emailInUse
  );

  const admin = createAdminClient();

  // Evita duplicar el perfil del profesional para el mismo servicio.
  const { data: existing } = await admin
    .from("professional_services")
    .select("id")
    .eq("professional_id", userId)
    .eq("service_id", input.service_id)
    .limit(1)
    .maybeSingle();
  if (existing) throw new Error(duplicate);

  // Rellena la fila de professionals solo si no existe aún (id = auth user).
  await admin
    .from("professionals")
    .upsert(
      {
        id: userId,
        entity_type: "individual",
        admin_status: "pending",
        verification_status: "pending",
      },
      { onConflict: "id", ignoreDuplicates: true }
    )
    .then(() => undefined, () => undefined);

  const { error: psError } = await admin.from("professional_services").insert({
    professional_id: userId,
    service_id: input.service_id,
    status: "active",
  });
  if (psError) throw new Error(saveError);

  const { error: respError } = await admin.from("form_responses").insert({
    form_id: formId,
    professional_id: userId,
    answers: input.answers ?? {},
  });
  if (respError) throw new Error(saveError);

  revalidatePath("/dashboard-profesional", "layout");
  revalidatePath("/[lang]/dashboard-admin/profesionales", "page");

  return {
    ok: true,
    professionalId: userId,
    email,
    href: "/dashboard-profesional",
  };
}

// Indica si el usuario autenticado ya tiene un perfil profesional para el
// servicio (se usa para ocultar la sección de registro si ya está registrado).
export async function hasProfesionalForService(serviceId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("professional_services")
    .select("id")
    .eq("professional_id", user.id)
    .eq("service_id", serviceId)
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}