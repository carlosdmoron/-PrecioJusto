"use client";

import { useRef, useState } from "react";
import type { SolicitudQuestion } from "../../actions/solicitud";
import { uploadFormAttachment } from "../../actions/upload";
import { countryCodes, DEFAULT_COUNTRY_CODE } from "../../lib/countryCodes";

export type Answer = string | string[] | number;
export type Answers = Record<string, Answer>;

export type UploadLabels = {
  attachPhotoButton: string;
  attachPhotoHint: string;
  uploadingPhoto: string;
  removePhoto: string;
  invalidFileType: string;
  fileTooLarge: string;
  uploadFailed: string;
};

export const inputClass =
  "h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40";

export function QuestionField({
  question,
  value,
  requiredMark,
  onChange,
  uploadLabels,
}: {
  question: SolicitudQuestion;
  value: Answer;
  requiredMark: string;
  onChange: (v: Answer) => void;
  uploadLabels?: UploadLabels;
}) {
  const { id, label, type, required, options, field_key } = question;

  const isPhone =
    field_key === "phone" ||
    type === "phone" ||
    /(móvil|movil|celular|mobile|cell\s*phone|phone\s*number)/i.test(label);

  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium text-ink"
        htmlFor={
          type === "radio" || type === "checkbox" || type === "scale" || type === "file"
            ? undefined
            : id
        }
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

      ) : type === "file" ? (
        <PhotoField value={value} labels={uploadLabels} onChange={onChange} />

      ) : isPhone ? (
        <PhoneField id={id} value={value} onChange={onChange} />

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

// Descompone un valor guardado como "+34 612 345 678" en prefijo y número.
function splitPhone(value: Answer): { prefix: string; number: string } {
  const raw = typeof value === "string" ? value.trim() : "";
  const match = raw.match(/^(\+\d{1,4}(?:-\d+)?)\s*(.*)$/);
  if (!match) return { prefix: DEFAULT_COUNTRY_CODE, number: raw };
  return { prefix: match[1], number: match[2].replace(/\s+/g, " ").trim() };
}

// Campo de teléfono con selector de prefijo internacional y altura reducida
// (h-10 en lugar de h-12). Se usa cuando el label de la pregunta hace referencia
// a un móvil/celular (móvil, mobile, cell) o cuando field_key === "phone".
function PhoneField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: Answer;
  onChange: (v: Answer) => void;
}) {
  const { prefix, number } = splitPhone(value);

  return (
    <div className="flex items-stretch gap-2">
      <select
        aria-label="Prefijo internacional"
        value={prefix}
        onChange={(e) =>
          onChange(`${e.target.value} ${number}`.trim())
        }
        className="h-10 w-[150px] shrink-0 rounded-lg bg-field px-2 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
      >
        {countryCodes.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} · {c.nameEs}
          </option>
        ))}
      </select>
      <input
        type="tel"
        id={id}
        inputMode="tel"
        autoComplete="tel"
        value={number}
        placeholder={"600 000 000"}
        onChange={(e) =>
          onChange(`${prefix} ${e.target.value}`.trim())
        }
        className="h-10 w-full min-w-0 rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
      />
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

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function PhotoField({
  value,
  labels,
  onChange,
}: {
  value: Answer;
  labels?: UploadLabels;
  onChange: (v: Answer) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = typeof value === "string" && value.trim() ? value.trim() : "";

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError(labels?.invalidFileType ?? "El archivo debe ser una imagen.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setError(labels?.fileTooLarge ?? "La imagen supera el tamaño máximo de 5 MB.");
      setStatus("error");
      return;
    }
    setStatus("uploading");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadFormAttachment(fd);
      onChange(result.url);
      setStatus("idle");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : (labels?.uploadFailed ?? "No se pudo subir la foto.")
      );
      setStatus("error");
    }
  }

  const t = (k: keyof UploadLabels, fallback: string) => labels?.[k] ?? fallback;

  return (
    <div className="space-y-3">
      {url ? (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-lg border border-line/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="max-h-60 w-full object-cover" />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={status === "uploading"}
              className="rounded-lg border border-line/60 px-4 py-2 text-sm font-medium text-ink transition hover:border-primary/40 disabled:opacity-60"
            >
              {t("attachPhotoButton", "Cambiar foto")}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={status === "uploading"}
              className="rounded-lg px-4 py-2 text-sm font-medium text-steel transition hover:text-danger disabled:opacity-60"
            >
              {t("removePhoto", "Quitar")}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading"}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line/70 bg-surface/40 px-4 py-6 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-primary-dark disabled:opacity-60"
        >
          {status === "uploading"
            ? t("uploadingPhoto", "Subiendo foto...")
            : t("attachPhotoButton", "Adjuntar foto")}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />

      <p className="text-xs text-muted">{t("attachPhotoHint", "JPG, PNG o WebP · máx. 5 MB")}</p>

      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}