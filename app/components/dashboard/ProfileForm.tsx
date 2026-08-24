"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

type ProfileKey = "nombre" | "apellido" | "email" | "ubicacion" | "telefono";
type ProfileValues = Record<ProfileKey, string>;

const DEFAULT_STORAGE_KEY = "pj-perfil-profesional";

const DEMO_VALUES: ProfileValues = {
  nombre: "Carlos",
  apellido: "Morón",
  email: "carlos@preciojusto.com",
  ubicacion: "Santiago, Chile",
  telefono: "+56 9 1234 5678",
};

const FIELDS: { key: ProfileKey; type: string; autoComplete: string }[] = [
  { key: "nombre", type: "text", autoComplete: "given-name" },
  { key: "apellido", type: "text", autoComplete: "family-name" },
  { key: "email", type: "email", autoComplete: "email" },
  { key: "ubicacion", type: "text", autoComplete: "address-level2" },
  { key: "telefono", type: "tel", autoComplete: "tel" },
];

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getServerSnapshot(): string | null {
  return null;
}

export default function ProfileForm({
  form,
  storageKey = DEFAULT_STORAGE_KEY,
  defaultValues = DEMO_VALUES,
}: {
  form: Record<string, string>;
  storageKey?: string;
  defaultValues?: ProfileValues;
}) {
  const getSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey),
    [storageKey],
  );
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const stored = useMemo<Partial<ProfileValues>>(() => {
    try {
      return JSON.parse(raw ?? "{}") as Partial<ProfileValues>;
    } catch {
      return {};
    }
  }, [raw]);

  const [draft, setDraft] = useState<Partial<ProfileValues>>({});
  const [saved, setSaved] = useState(false);

  const values: ProfileValues = { ...defaultValues, ...stored, ...draft };

  function update(key: ProfileKey, value: string) {
    setSaved(false);
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(values));
      setDraft({});
      setSaved(true);
    } catch {
      setSaved(false);
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
          className="h-12 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          {form.guardar}
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
