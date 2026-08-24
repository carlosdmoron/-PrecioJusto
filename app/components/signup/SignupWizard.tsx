"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import PasswordInput from "./PasswordInput";

export type WizardTexts = {
  progreso: string;
  atras: string;
  continuar: string;
  paso1: {
    titulo: string;
    ayuda: string;
    seleccionados: string;
    requerido: string;
  };
  categorias: string[];
  paso2: {
    titulo: string;
    ayuda: string;
    label: string;
    placeholder: string;
    requerido: string;
  };
  paso3: {
    titulo: string;
    ayuda: string;
    nombre: string;
    nombrePh: string;
    apellido: string;
    apellidoPh: string;
    telefono: string;
    telefonoPh: string;
    emailInvalido: string;
    requerido: string;
  };
  paso4: {
    titulo: string;
    ayuda: string;
    minLength: string;
  };
  exito: {
    titulo: string;
    texto: string;
    cta: string;
  };
};

type WizardData = {
  servicios: string[];
  ubicacion: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
};

const inputClass =
  "h-[49px] w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-2 block text-sm font-medium text-gray-900";
const errorClass =
  "mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function SignupWizard({
  wizard,
  emailLabel,
  emailPlaceholder,
  passwordLabel,
  passwordPlaceholder,
  showPassword,
  hidePassword,
  dashboardHref,
}: {
  wizard: WizardTexts;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  dashboardHref: string;
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [data, setData] = useState<WizardData>({
    servicios: [],
    ubicacion: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
  });

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setError("");
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleServicio(categoria: string) {
    setError("");
    setData((prev) => ({
      ...prev,
      servicios: prev.servicios.includes(categoria)
        ? prev.servicios.filter((s) => s !== categoria)
        : [...prev.servicios, categoria],
    }));
  }

  function validar(): string {
    if (step === 1 && data.servicios.length === 0) return wizard.paso1.requerido;
    if (step === 2 && !data.ubicacion.trim()) return wizard.paso2.requerido;
    if (step === 3) {
      if (!data.nombre.trim() || !data.apellido.trim() || !data.telefono.trim())
        return wizard.paso3.requerido;
      if (!/^\S+@\S+\.\S+$/.test(data.email)) return wizard.paso3.emailInvalido;
    }
    if (step === 4 && data.password.length < 8) return wizard.paso4.minLength;
    return "";
  }

  function avanzar(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const msg = validar();
    if (msg) {
      setError(msg);
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    try {
      window.localStorage.setItem("pj-registro-profesional", JSON.stringify(data));
    } catch {}
    setDone(true);
  }

  function retroceder() {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  }

  if (done) {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckIcon />
        </span>
        <h2 className="mt-6 font-bold tracking-tight text-gray-900">
          {wizard.exito.titulo}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">{wizard.exito.texto}</p>
        <Link
          href={dashboardHref}
          className="mt-8 inline-flex h-[52px] items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          {wizard.exito.cta}
        </Link>
      </div>
    );
  }

  const titulos: Record<number, { titulo: string; ayuda: string }> = {
    1: { titulo: wizard.paso1.titulo, ayuda: wizard.paso1.ayuda },
    2: { titulo: wizard.paso2.titulo, ayuda: wizard.paso2.ayuda },
    3: { titulo: wizard.paso3.titulo, ayuda: wizard.paso3.ayuda },
    4: { titulo: wizard.paso4.titulo, ayuda: wizard.paso4.ayuda },
  };

  return (
    <>
      <div className="mb-9">
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4}>
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`h-1.5 flex-1 rounded-full transition ${n <= step ? "bg-primary" : "bg-gray-200"}`}
            />
          ))}
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          {wizard.progreso.replace("{n}", String(step))}
        </p>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-gray-900">
        {titulos[step].titulo}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-500">{titulos[step].ayuda}</p>

      <form onSubmit={avanzar} className="mt-8 space-y-6" noValidate>
        {step === 1 ? (
          <>
            <fieldset>
              <legend className="sr-only">{wizard.paso1.titulo}</legend>
              <div className="grid grid-cols-2 gap-3">
                {wizard.categorias.map((cat) => {
                  const activo = data.servicios.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleServicio(cat)}
                      aria-pressed={activo}
                      className={`flex h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm transition ${
                        activo
                          ? "border-primary bg-[#EEF3FE] font-semibold text-primary-dark"
                          : "border-gray-300 text-gray-700 hover:border-primary hover:text-primary-dark"
                      }`}
                    >
                      {activo ? <CheckIcon /> : null}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            {data.servicios.length > 0 ? (
              <p aria-live="polite" className="text-sm font-medium text-primary-dark">
                {wizard.paso1.seleccionados.replace("{n}", String(data.servicios.length))}
              </p>
            ) : null}
          </>
        ) : null}

        {step === 2 ? (
          <div>
            <label htmlFor="wiz-ubicacion" className={labelClass}>
              {wizard.paso2.label}
            </label>
            <input
              id="wiz-ubicacion"
              name="ubicacion"
              type="text"
              autoComplete="address-level2"
              autoFocus
              value={data.ubicacion}
              onChange={(e) => update("ubicacion", e.target.value)}
              placeholder={wizard.paso2.placeholder}
              className={inputClass}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="wiz-nombre" className={labelClass}>
                  {wizard.paso3.nombre}
                </label>
                <input
                  id="wiz-nombre"
                  name="nombre"
                  type="text"
                  autoComplete="given-name"
                  value={data.nombre}
                  onChange={(e) => update("nombre", e.target.value)}
                  placeholder={wizard.paso3.nombrePh}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="wiz-apellido" className={labelClass}>
                  {wizard.paso3.apellido}
                </label>
                <input
                  id="wiz-apellido"
                  name="apellido"
                  type="text"
                  autoComplete="family-name"
                  value={data.apellido}
                  onChange={(e) => update("apellido", e.target.value)}
                  placeholder={wizard.paso3.apellidoPh}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="wiz-email" className={labelClass}>
                {emailLabel}
              </label>
              <input
                id="wiz-email"
                name="email"
                type="email"
                autoComplete="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder={emailPlaceholder}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="wiz-telefono" className={labelClass}>
                {wizard.paso3.telefono}
              </label>
              <input
                id="wiz-telefono"
                name="telefono"
                type="tel"
                autoComplete="tel"
                value={data.telefono}
                onChange={(e) => update("telefono", e.target.value)}
                placeholder={wizard.paso3.telefonoPh}
                className={inputClass}
              />
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <PasswordInput
            label={passwordLabel}
            placeholder={passwordPlaceholder}
            showLabel={showPassword}
            hideLabel={hidePassword}
            value={data.password}
            onChange={(v) => update("password", v)}
          />
        ) : null}

        {error ? (
          <p role="alert" className={errorClass}>
            {error}
          </p>
        ) : null}

        <div className="flex gap-3 pt-1">
          {step > 1 ? (
            <button
              type="button"
              onClick={retroceder}
              className="h-[52px] flex-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
            >
              {wizard.atras}
            </button>
          ) : null}
          <button
            type="submit"
            className="h-[52px] flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {wizard.continuar}
          </button>
        </div>
      </form>
    </>
  );
}
