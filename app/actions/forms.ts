"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

export type FormRow = {
  id: string;
  service_id: string | null;
  service_name: string | null;
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

export async function listForms(): Promise<FormRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forms")
    .select("id, service_id, version, question_count, abandonment_rate, status, created_at, service:services(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((f: any) => ({
    id: f.id,
    service_id: f.service_id ?? null,
    service_name: Array.isArray(f.service)
      ? (f.service[0]?.name ?? null)
      : (f.service?.name ?? null),
    version: f.version ?? "v1.0",
    question_count: f.question_count ?? 0,
    abandonment_rate: Number(f.abandonment_rate ?? 0),
    status: f.status ?? "draft",
    created_at: f.created_at,
  }));
}

export async function getForm(id: string): Promise<FormDetail | null> {
  const supabase = await createClient();
  const { data: form, error } = await supabase
    .from("forms")
    .select("id, service_id, version, question_count, abandonment_rate, status, created_at, service:services(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!form) return null;
  const f = form as any;

  const { data: questions, error: qError } = await supabase
    .from("form_questions")
    .select("id, label, type, required, options")
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
    })),
  };
}

export async function createForm(serviceId: string): Promise<string> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forms")
    .insert({ service_id: serviceId || null, status: "draft", version: "v1.0" })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
  return data.id;
}

export async function updateFormService(
  formId: string,
  serviceId: string
): Promise<boolean> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("forms")
    .update({ service_id: serviceId || null, updated_at: new Date().toISOString() })
    .eq("id", formId);
  if (error) throw new Error(error.message);

  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
  return true;
}

export async function updateFormQuestions(
  formId: string,
  questions: FormQuestion[]
): Promise<boolean> {
  await requireUser();
  const supabase = await createClient();

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
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("forms")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", formId);
  if (error) throw new Error(error.message);
  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
}

export async function duplicateForm(formId: string): Promise<string> {
  await requireUser();
  const supabase = await createClient();

  const detail = await getForm(formId);
  if (!detail) throw new Error("Formulario no encontrado");

  const { data: newForm, error } = await supabase
    .from("forms")
    .insert({
      service_id: detail.form.service_id,
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
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("forms").delete().eq("id", formId);
  if (error) throw new Error(error.message);
  revalidatePath("/[lang]/dashboard-admin/formularios", "page");
}
