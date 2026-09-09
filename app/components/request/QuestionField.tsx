"use client";

import type { SolicitudQuestion } from "../../actions/solicitud";

export type Answer = string | string[] | number;
export type Answers = Record<string, Answer>;

export const inputClass =
  "h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40";

export function QuestionField({
  question,
  value,
  requiredMark,
  onChange,
}: {
  question: SolicitudQuestion;
  value: Answer;
  requiredMark: string;
  onChange: (v: Answer) => void;
}) {
  const { id, label, type, required, options } = question;

  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium text-ink"
        htmlFor={type === "radio" || type === "checkbox" || type === "scale" ? undefined : id}
      >
        {label}
        {required ? (
          <span className="ml-1 text-primary" aria-hidden="true">
            {requiredMark}
          </span>
        ) : null}
      </label>

      {type === "textarea" ? (
        <textarea
          id={id}
          rows={4}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-field p-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
        />

      ) : type === "select" ? (
        <SelectField
          id={id}
          options={Array.isArray(options) ? options : []}
          value={value}
          onChange={onChange}
        />

      ) : type === "radio" ? (
        <RadioGroup
          name={id}
          options={Array.isArray(options) ? options : []}
          value={value}
          onChange={onChange}
        />

      ) : type === "checkbox" ? (
        <CheckboxGroup
          name={id}
          options={Array.isArray(options) ? options : []}
          value={value}
          onChange={onChange}
        />

      ) : type === "scale" ? (
        <ScaleField value={value} required={required} onChange={onChange} />

      ) : (
        <input
          type="text"
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={type === "number" ? "0" : ""}
          className={inputClass}
        />
      )}
    </div>
  );
}

function SelectField({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: string[];
  value: Answer;
  onChange: (v: Answer) => void;
}) {
  return (
    <select
      id={id}
      value={Array.isArray(value) ? "" : String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    >
      <option value="">—</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: Answer;
  onChange: (v: Answer) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
            value === opt
              ? "border-primary/60 bg-primary/5"
              : "border-line/60 bg-white hover:border-primary/30"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-ink">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: Answer;
  onChange: (v: Answer) => void;
}) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((o) => o !== opt)
      : [...selected, opt];
    onChange(next);
  };

  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
            selected.includes(opt)
              ? "border-primary/60 bg-primary/5"
              : "border-line/60 bg-white hover:border-primary/30"
          }`}
        >
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-ink">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function ScaleField({
  value,
  required,
  onChange,
}: {
  value: Answer;
  required: boolean;
  onChange: (v: Answer) => void;
}) {
  const scale = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div className="flex flex-wrap gap-1.5">
      {scale.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-9 w-9 rounded-lg border text-sm font-semibold transition ${
            value === n
              ? "border-primary bg-primary text-white"
              : "border-line/60 bg-white text-ink hover:border-primary/40"
          }`}
          aria-pressed={value === n}
          aria-label={required ? `${n} (obligatorio)` : String(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}