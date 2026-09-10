"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";
import { createAdminClient } from "../../lib/supabase/admin";

export type FormType = "customer" | "professional";

export type FormRow = {
  id: string;
  service_id: string | null;
  service_name: string | null;
  form_type: FormType;
  version: string;
  question_count: number;
  abandonment_rate: number;
  status: string;
  created_at: string;
};

export type FormQuestion = {
  id?: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  field_key?: string | null;
};

export type FormDetail = {
  form: FormRow;
  questions: FormQuestion[];
};

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

// Verifica que el usuario autenticado sea un administrador real y devuelve un
// cliente de servicio (bypass RLS) para las escrituras. El cliente autenticado
// puede fallar a nivel RLS en algunos contextos de sesión, por lo que usamos el
// rol de servicio tras una comprobación explícita de administrador.
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

export async function listForms(): Promise<FormRow[]> {
  const supabase = await createClient();

  // La columna form_type puede no existir aún si la migración 0012 no está
  // aplicada: se detecta y se devuelve 'customer' como valor por defecto.
  const { error: typeProbe } = await supabase
    .from("forms")
    .select("form_type")
    .limit(1);
  const hasType = !typeProbe;

  const select = hasType
    ? "id, service_id, form_type, version, question_count, abandonment_rate, status, created_at, service:services(name)"
    : "id, service_id, version, question_count, abandonment_rate, status, created_at, service:services(name)";

  const { data, error } = await supabase
    .from("forms")
    .select(select)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((f: any) => ({
    id: f.id,
    service_id: f.service_id ?? null,
    service_name: Array.isArray(f.service)
      ? (f.service[0]?.name ?? null)
      : (f.service?.name ?? null),
    form_type: f.form_type === "professional" ? "professional" : "customer",
    version: f.version ?? "v1.0",
    question_count: f.question_count ?? 0,
    abandonment_rate: Number(f.abandonment_rate ?? 0),
    status: f.status ?? "draft",
    created_at: f.created_at,
  }));
}

export async function getForm(id: string): Promise<FormDetail | null> {
  // Usamos el cliente de servicio (bypass RLS) para la lectura, igual que en las
  // escrituras: el cliente autenticado puede fallar a nivel RLS en algunos
  // contextos de sesión y dejaría las preguntas en blanco.
  const supabase = await requireAdmin();

  const { error: typeProbe } = await supabase
    .from("forms")
    .select("form_type")
    .limit(1);
  const hasType = !typeProbe;

  const select = hasType
    ? "id, service_id, form_type, version, question_count, abandonment_rate, status, created_at, service:services(name)"
    : "id, service_id, version, question_count, abandonment_rate, status, created_at, service:services(name)";

  const { data: form, error } = await supabase
    .from("forms")
    .select(select)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!form) return null;
  const f = form as any;

  const { data: questions, error: qError } = await supabase
    .from("form_questions")
    .select("id, label, type, required, options, field_key")
    .eq("form_id", id)
    .order("sort_order", { ascending: true });

  if (qError) throw new Error(qError.message);

  return {
    form: {
      id: f.id,
      service_id: f.service_id ?? null,
      service_name: Array.isArray(f.service)
        ? (f.service[0]?.name ?? null)
        : (f.service?.name ?? null),
      form_type: f.form_type === "professional" ? "professional" : "customer",
      version: f.version ?? "v1.0",
      question_count: f.question_count ?? 0,
      abandonment_rate: Number(f.abandonment_rate ?? 0),
      status: f.status ?? "draft",
      created_at: f.created_at,
    },
    questions: (questions ?? []).map((q: any) => ({
      id: q.id,
      label: q.label,
      type: q.type,
      required: q.required ?? false,
      options: Array.isArray(q.options) ? q.options : [],
      field_key: q.field_key ?? null,
    })),
  };
}

export async function createForm(
  serviceId: string,
  formType: FormType = "customer"
): Promise<string> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("forms")
    .insert({
      service_id: serviceId || null,
      form_type: formType === "professional" ? "professional" : "customer",
      status: "draft",
      version: "v1.0",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Los formularios de profesionales siempre incluyen las preguntas base que
  // alimentan la cuenta y el perfil del profesional (nombre, foto, correo y
  // teléfono). El campo field_key indica a qué dato de perfil corresponde.
  if (formType === "professional") {
    const baseQuestions: Array<{
      label: string;
      type: string;
      required: boolean;
      field_key: string;
    }> = [
      { label: "¿Cuál es tu nombre completo?", type: "textarea", required: true, field_key: "full_name" },
      { label: "Adjunta una foto de perfil", type: "file", required: false, field_key: "photo" },
      { label: "¿Cuál es tu correo electrónico?", type: "text", required: true, field_key: "email" },
      { label: "¿Cuál es tu teléfono móvil?", type: "text", required: true, field_key: "phone" },
    ];
    const rows = baseQuestions.map((q, index) => ({
      form_id: data.id,
      sort_order: index,
      label: q.label,
      type: q.type,
      required: q.required,
      options: [],
      field_key: q.field_key,
    }));
    const { error: insError } = await supabase
      .from("form_questions")
      .insert(rows);
    if (insError) throw new Error(insError.message);
    await supabase
      .from("forms")
      .update({ question_count: rows.length, updated_at: new Date().toISOString() })
      .eq("id", data.id);
  }

  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
  return data.id;
}

export async function updateFormService(
  formId: string,
  serviceId: string
): Promise<boolean> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("forms")
    .update({ service_id: serviceId || null, updated_at: new Date().toISOString() })
    .eq("id", formId);
  if (error) throw new Error(error.message);

  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
  return true;
}

export async function updateFormType(
  formId: string,
  formType: FormType
): Promise<boolean> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("forms")
    .update({
      form_type: formType === "professional" ? "professional" : "customer",
      updated_at: new Date().toISOString(),
    })
    .eq("id", formId);
  if (error) throw new Error(error.message);

  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
  return true;
}

export async function updateFormQuestions(
  formId: string,
  questions: FormQuestion[]
): Promise<boolean> {
  const supabase = await requireAdmin();

  const { error: delError } = await supabase
    .from("form_questions")
    .delete()
    .eq("form_id", formId);
  if (delError) throw new Error(delError.message);

  if (questions.length > 0) {
    const rows = questions.map((q, index) => ({
      form_id: formId,
      sort_order: index,
      label: q.label,
      type: q.type,
      required: q.required ?? false,
      options: q.options ?? [],
      field_key: q.field_key || null,
    }));
    const { error: insError } = await supabase
      .from("form_questions")
      .insert(rows);
    if (insError) throw new Error(insError.message);
  }

  const { error: updError } = await supabase
    .from("forms")
    .update({ question_count: questions.length, updated_at: new Date().toISOString() })
    .eq("id", formId);
  if (updError) throw new Error(updError.message);

  const { data: verify, error: verifyError } = await supabase
    .from("form_questions")
    .select("id")
    .eq("form_id", formId);
  if (verifyError) throw new Error(verifyError.message);

  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
  return verify?.length === questions.length;
}

export async function publishForm(formId: string): Promise<void> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("forms")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", formId);
  if (error) throw new Error(error.message);
  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
}

export async function duplicateForm(formId: string): Promise<string> {
  const supabase = await requireAdmin();

  const detail = await getForm(formId);
  if (!detail) throw new Error("Formulario no encontrado");

  const { data: newForm, error } = await supabase
    .from("forms")
    .insert({
      service_id: detail.form.service_id,
      form_type: detail.form.form_type,
      version: detail.form.version,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (detail.questions.length > 0) {
    const rows = detail.questions.map((q, index) => ({
      form_id: newForm.id,
      sort_order: index,
      label: q.label,
      type: q.type,
      required: q.required,
      options: q.options,
      field_key: q.field_key || null,
    }));
    const { error: insError } = await supabase
      .from("form_questions")
      .insert(rows);
    if (insError) throw new Error(insError.message);
  }

  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
  return newForm.id;
}

export async function deleteForm(formId: string): Promise<void> {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("forms").delete().eq("id", formId);
  if (error) throw new Error(error.message);
  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
}
