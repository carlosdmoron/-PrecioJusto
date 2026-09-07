import "server-only";
import { createAdminClient } from "./supabase/admin";
import { translateTexts } from "./translate";

export type ServiceTranslatable = {
  id: string;
  name: string;
  description: string | null;
  [k: string]: unknown;
};

export type QuestionTranslatable = {
  id: string;
  label: string;
  options: string[] | null;
  [k: string]: unknown;
};

type Locale = "es" | "it" | "en";

// ---------------------------------------------------------------- servicios

async function ensureServiceTranslation(
  row: ServiceTranslatable,
  locale: Locale
) {
  if (locale === "es") return;

  const nameCol = `name_${locale}` as const;
  const descCol = `description_${locale}` as const;
  const existingName = (row[nameCol] as string | null) ?? "";
  const existingDesc = (row[descCol] as string | null) ?? "";
  const baseDesc = row.description as string | null;

  const name = existingName || (await translateOne(row.name, locale));
  const description =
    existingDesc ||
    (baseDesc ? await translateOne(baseDesc, locale) : null);

  if (existingName !== name || existingDesc !== (description ?? "")) {
    const patch: Record<string, unknown> = {};
    if (!existingName) patch[nameCol] = name;
    if (!existingDesc && description != null) patch[descCol] = description;
    const admin = createAdminClient();
    await admin.from("services").update(patch).eq("id", row.id);
  }

  return { name, description };
}

export async function localizeService(
  row: ServiceTranslatable,
  locale: Locale,
  enabled = true
): Promise<{ name: string; description: string | null }> {
  if (locale === "es" || !enabled) {
    return { name: row.name, description: row.description ?? null };
  }
  try {
    return (await ensureServiceTranslation(row, locale))!;
  } catch {
    return { name: row.name, description: row.description ?? null };
  }
}

export async function localizeServices(
  rows: ServiceTranslatable[],
  locale: Locale,
  enabled = true
): Promise<Array<{ name: string; description: string | null }>> {
  if (locale === "es" || !enabled) {
    return rows.map((r) => ({ name: r.name, description: r.description }));
  }
  return Promise.all(rows.map((r) => localizeService(r, locale, true)));
}

// ---------------------------------------------------------------- preguntas

async function ensureQuestionTranslation(
  row: QuestionTranslatable,
  locale: Locale
) {
  if (locale === "es") return;

  const labelCol = `label_${locale}` as const;
  const optsCol = `options_${locale}` as const;
  const existingLabel = (row[labelCol] as string | null) ?? "";
  const existingOpts = (row[optsCol] as string[] | null) ?? [];

  const label = existingLabel || (await translateOne(row.label, locale));

  const baseOptions = Array.isArray(row.options) ? row.options : [];
  let options = existingOpts;
  if (!existingOpts || existingOpts.length !== baseOptions.length) {
    options = baseOptions.length
      ? await translateTexts(baseOptions, locale as "it" | "en")
      : [];
  } else if (baseOptions.length === 0) {
    options = [];
  }

  if (existingLabel !== label || options !== existingOpts) {
    const patch: Record<string, unknown> = {};
    if (!existingLabel) patch[labelCol] = label;
    if (
      !existingOpts ||
      existingOpts.length !== baseOptions.length
    ) {
      patch[optsCol] = options;
    }
    const admin = createAdminClient();
    await admin.from("form_questions").update(patch).eq("id", row.id);
  }

  return { label, options };
}

export async function localizeQuestion(
  row: QuestionTranslatable,
  locale: Locale,
  enabled = true
): Promise<{ label: string; options: string[] }> {
  if (locale === "es" || !enabled) {
    return { label: row.label, options: Array.isArray(row.options) ? row.options : [] };
  }
  try {
    return (await ensureQuestionTranslation(row, locale))!;
  } catch {
    return { label: row.label, options: Array.isArray(row.options) ? row.options : [] };
  }
}

export async function localizeQuestions(
  rows: QuestionTranslatable[],
  locale: Locale,
  enabled = true
): Promise<Array<{ label: string; options: string[] }>> {
  if (locale === "es" || !enabled) {
    return rows.map((q) => ({
      label: q.label,
      options: Array.isArray(q.options) ? q.options : [],
    }));
  }
  return Promise.all(rows.map((q) => localizeQuestion(q, locale, true)));
}

// ------------------------------------------------------------------ helper

async function translateOne(text: string, locale: Locale) {
  if (!text) return text;
  const out = await import("./translate").then((m) =>
    m.translateTexts([text], locale as "it" | "en")
  );
  return out[0] ?? text;
}
