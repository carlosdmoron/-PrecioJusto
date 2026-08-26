"use client";

import { useState } from "react";

type ProfileKey = "nombre" | "apellido" | "email" | "ubicacion" | "telefono";
type ProfileValues = Record<ProfileKey, string>;

const FIELDS: { key: ProfileKey; type: string; autoComplete: string }[] = [
  { key: "nombre", type: "text", autoComplete: "given-name" },
  { key: "apellido", type: "text", autoComplete: "family-name" },
  { key: "email", type: "email", autoComplete: "email" },
  { key: "ubicacion", type: "text", autoComplete: "address-level2" },
  { key: "telefono", type: "tel", autoComplete: "tel" },
];

export default function ProfileForm({
  form,
  defaultValues = { nombre: "", apellido: "", email: "", ubicacion: "", telefono: "" },
  onSave,
}: {
  form: Record<string, string>;
  defaultValues?: ProfileValues;
  onSave?: (values: ProfileValues) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Partial<ProfileValues>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const values: ProfileValues = { ...defaultValues, ...draft };

  function update(key: ProfileKey, value: string) {
    setSaved(false);
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      if (onSave) {
        await onSave(values);
      }
      setDraft({});
      setSaved(true);
    } catch {
      setSaved(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 max-w-xl rounded-xl border border-line/30 bg-white p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map(({ key, type, autoComplete }) => (
          <div key={key}>
            <label
              htmlFor={`perfil-${key}`}
              className="mb-2 block text-sm font-medium text-ink"
            >
              {form[key]}
            </label>
            <input
              id={`perfil-${key}`}
              name={key}
              type={type}
              autoComplete={autoComplete}
              value={values[key]}
              onChange={(event) => update(key, event.target.value)}
              placeholder={form[`${key}Ph`]}
              className="h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
            />
          </div>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="h-12 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {saving ? "Guardando..." : form.guardar}
        </button>
        <span
          aria-live="polite"
          className={`text-sm font-medium ${saved ? "text-primary-dark" : "invisible"}`}
        >
          {form.guardado}
        </span>
      </div>
    </form>
  );
}
