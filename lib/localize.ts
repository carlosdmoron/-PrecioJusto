import "server-only";
import { createAdminClient } from "./supabase/admin";
import { translateText } from "./translate";

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

// Una "traducción" solo es válida si no está vacía y difiere del texto origen.
// Evita que un fallback (el propio origen) quede grabado como traducción buena.
function isTranslation(value: string | null | undefined, source: string) {
  const v = String(value ?? "").trim();
  const s = String(source ?? "").trim();
  return v.length > 0 && v !== s;
}

// ---------------------------------------------------------------- servicios

async function ensureServiceTranslation(
  row: ServiceTranslatable,
  locale: Locale,
  persist: boolean
) {
  if (locale === "es") {
    return { name: row.name, description: row.description ?? null };
  }

  const nameCol = `name_${locale}` as const;
  const descCol = `description_${locale}` as const;
  const cachedName = String(row[nameCol] ?? "").trim() || "";
  const cachedDesc = String(row[descCol] ?? "").trim() || "";
  const baseDesc = row.description as string | null;

  let name = row.name;
  if (isTranslation(cachedName, row.name)) {
    name = cachedName;
  } else {
    try {
      name = await translateOne(row.name, locale);
    } catch {
      name = row.name;
    }
  }

  let description = baseDesc ?? null;
  if (baseDesc) {
    if (isTranslation(cachedDesc, baseDesc)) {
      description = cachedDesc;
    } else {
      try {
        description = await translateOne(baseDesc, locale);
      } catch {
        description = baseDesc;
      }
    }
  }

  if (persist) {
    const patch: Record<string, unknown> = {};
    if (isTranslation(name, row.name)) patch[nameCol] = name;
    if (description && isTranslation(description, baseDesc ?? "")) {
      patch[descCol] = description;
    }
    if (Object.keys(patch).length > 0) {
      const admin = createAdminClient();
      await admin.from("services").update(patch).eq("id", row.id).then(
        () => undefined,
        () => undefined
      );
    }
  }

  return { name, description };
}

export async function localizeService(
  row: ServiceTranslatable,
  locale: Locale,
  persist = true
): Promise<{ name: string; description: string | null }> {
  if (locale === "es") {
    return { name: row.name, description: row.description ?? null };
  }
  try {
    return await ensureServiceTranslation(row, locale, persist);
  } catch {
    return { name: row.name, description: row.description ?? null };
  }
}

export async function localizeServices(
  rows: ServiceTranslatable[],
  locale: Locale,
  persist = true
): Promise<Array<{ name: string; description: string | null }>> {
  if (locale === "es") {
    return rows.map((r) => ({ name: r.name, description: r.description }));
  }
  return Promise.all(rows.map((r) => localizeService(r, locale, persist)));
}

// ---------------------------------------------------------------- preguntas

async function ensureQuestionTranslation(
  row: QuestionTranslatable,
  locale: Locale,
  persist: boolean
) {
  if (locale === "es") {
    return { label: row.label, options: Array.isArray(row.options) ? row.options : [] };
  }

  const labelCol = `label_${locale}` as const;
  const optsCol = `options_${locale}` as const;
  const cachedLabel = String(row[labelCol] ?? "").trim() || "";
  const cachedOpts = Array.isArray(row[optsCol]) ? (row[optsCol] as string[]) : [];
  const baseOptions = Array.isArray(row.options) ? row.options : [];

  let label = row.label;
  if (isTranslation(cachedLabel, row.label)) {
    label = cachedLabel;
  } else {
    try {
      label = await translateOne(row.label, locale);
    } catch {
      label = row.label;
    }
  }

  // Convergencia por ítem: cada opción usa la caché si es válida; si no, se
  // traduce ahora. Así, tras varias visitas el lote termina totalmente
  // traducido aunque Google falle algunas cadenas en una ráfaga inicial.
  const translated = Array.from({ length: baseOptions.length }, () => "");
  let invalidCount = 0;
  for (let i = 0; i < baseOptions.length; i++) {
    const source = baseOptions[i];
    if (i < cachedOpts.length && isTranslation(cachedOpts[i], source)) {
      translated[i] = cachedOpts[i];
    } else {
      invalidCount++;
      try {
        translated[i] = await translateOne(source, locale);
      } catch {
        translated[i] = source;
      }
    }
  }

  if (persist) {
    const patch: Record<string, unknown> = {};
    if (isTranslation(label, row.label)) patch[labelCol] = label;
    const anyTranslated = translated.some((o, i) => isTranslation(o, baseOptions[i]));
    if (baseOptions.length > 0 && invalidCount > 0 && anyTranslated) {
      patch[optsCol] = translated;
    }
    if (Object.keys(patch).length > 0) {
      const admin = createAdminClient();
      await admin.from("form_questions").update(patch).eq("id", row.id).then(
        () => undefined,
        () => undefined
      );
    }
  }

  return { label, options: baseOptions.length > 0 ? translated : [] };
}

export async function localizeQuestion(
  row: QuestionTranslatable,
  locale: Locale,
  persist = true
): Promise<{ label: string; options: string[] }> {
  if (locale === "es") {
    return { label: row.label, options: Array.isArray(row.options) ? row.options : [] };
  }
  try {
    return await ensureQuestionTranslation(row, locale, persist);
  } catch {
    return { label: row.label, options: Array.isArray(row.options) ? row.options : [] };
  }
}

export async function localizeQuestions(
  rows: QuestionTranslatable[],
  locale: Locale,
  persist = true
): Promise<Array<{ label: string; options: string[] }>> {
  if (locale === "es") {
    return rows.map((q) => ({
      label: q.label,
      options: Array.isArray(q.options) ? q.options : [],
    }));
  }
  return Promise.all(rows.map((q) => localizeQuestion(q, locale, persist)));
}

// ------------------------------------------------------------------ helper

async function translateOne(text: string, locale: Locale) {
  if (!text) return text;
  return translateText(text, locale as "it" | "en");
}