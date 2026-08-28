"use client";

import { useState } from "react";

export type FilterField = {
  key: string;
  label: string;
  type: "select" | "text" | "date";
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export default function FilterBar({
  fields,
  labels,
  onApply,
}: {
  fields: FilterField[];
  labels: { apply: string; clear: string };
  onApply?: (filters: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  function handleChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function handleClear() {
    const empty: Record<string, string> = {};
    fields.forEach((f) => (empty[f.key] = ""));
    setValues(empty);
    onApply?.(empty);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-pj-border bg-white p-4 shadow-pj-card">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-pj-steel">{field.label}</label>
          {field.type === "select" ? (
            <select
              value={values[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="h-10 rounded-lg border border-pj-border bg-white px-3 text-sm text-pj-ink outline-none transition focus:border-pj-primary focus:ring-2 focus:ring-pj-primary/20"
            >
              <option value="">{field.placeholder ?? "—"}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={values[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="h-10 rounded-lg border border-pj-border bg-white px-3 text-sm text-pj-ink outline-none transition placeholder:text-pj-faint focus:border-pj-primary focus:ring-2 focus:ring-pj-primary/20"
            />
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onApply?.(values)}
          className="h-10 rounded-lg bg-pj-primary px-5 text-sm font-semibold text-white shadow-sm shadow-pj-primary/25 transition hover:bg-pj-primary-hover"
        >
          {labels.apply}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="h-10 rounded-lg border border-pj-border bg-white px-5 text-sm font-medium text-pj-steel transition hover:bg-pj-bg hover:text-pj-ink"
        >
          {labels.clear}
        </button>
      </div>
    </div>
  );
}
