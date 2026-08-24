"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import OnboardingLayout from "./OnboardingLayout";
import {
  ONBOARDING_DATA_INICIAL,
  PORTFOLIO_MAX_FOTOS,
  type EntityType,
  type MilestoneKey,
  type OnboardingData,
} from "./onboarding-types";

export type OnboardingTexts = {
  hitos: string[];
  continuar: string;
  atras: string;
  paso1: {
    titulo: string;
    ayuda: string;
    individual: { titulo: string; texto: string };
    empresa: { titulo: string; texto: string };
  };
  paso2: {
    titulo: string;
    ayuda: string;
    nombre: string;
    nombrePh: string;
    apellido: string;
    apellidoPh: string;
    telefono: string;
    telefonoPh: string;
    promociones: string;
  };
  paso3: {
    titulo: string;
    ayuda: string;
    provincia: string;
    provinciaPh: string;
    municipio: string;
    municipioPh: string;
    servicios: string;
  };
  servicios: string[];
  paso4: {
    titulo: string;
    ayuda: string;
    propuesta: string;
    propuestaPh: string;
    fotoPerfil: string;
    fotoAyuda: string;
    portfolio: string;
    anadirFoto: string;
    urlInvalida: string;
  };
  paso5: {
    titulo: string;
    ayuda: string;
    tarjeta: string;
    paypal: string;
    transferencia: string;
    titular: string;
    titularPh: string;
    numero: string;
    caducidad: string;
    caducidadPh: string;
    emailPaypal: string;
    iban: string;
  };
  paso6: {
    titulo: string;
    ayuda: string;
    resumen: Record<string, string>;
    confirmar: string;
  };
  exito: { titulo: string; texto: string; cta: string };
  errores: Record<string, string>;
};

const PASO_A_HITO: MilestoneKey[] = [0, 0, 1, 1, 2, 3];
const TOTAL_PASOS = PASO_A_HITO.length;

const inputClass =
  "h-[49px] w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-2 block text-sm font-medium text-gray-900";

const PREFIJOS_TELEFONO = ["+34", "+39", "+44", "+33", "+49", "+351", "+1", "+52", "+54", "+56"];

function urlValida(valor: string) {
  try {
    return Boolean(new URL(valor));
  } catch {
    return false;
  }
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function SignupWizard({
  onboarding,
  dashboardHref,
}: {
  onboarding: OnboardingTexts;
  dashboardHref: string;
}) {
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [data, setData] = useState<OnboardingData>(ONBOARDING_DATA_INICIAL);
  const [fotoInput, setFotoInput] = useState("");

  const t = onboarding;

  function set<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setError("");
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function toggleServicio(servicio: string) {
    setError("");
    setData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(servicio)
        ? prev.selectedServices.filter((s) => s !== servicio)
        : [...prev.selectedServices, servicio],
    }));
  }

  function anadirFotoPortfolio() {
    const url = fotoInput.trim();
    if (!urlValida(url)) {
      setError(t.errores.urlInvalida);
      return;
    }
    if (data.portfolioPhotos.length >= PORTFOLIO_MAX_FOTOS) {
      setError(t.errores.maxFotos);
      return;
    }
    setError("");
    setData((prev) => ({ ...prev, portfolioPhotos: [...prev.portfolioPhotos, url] }));
    setFotoInput("");
  }

  function quitarFoto(index: number) {
    setError("");
    setData((prev) => ({
      ...prev,
      portfolioPhotos: prev.portfolioPhotos.filter((_, i) => i !== index),
    }));
  }

  function validar(): string {
    if (paso === 0 && !data.entityType) return t.errores.tipoCuenta;
    if (paso === 1) {
      if (!data.firstName.trim() || !data.lastName.trim()) return t.errores.requerido;
      if (!/^\S+@\S+\.\S+$/.test(data.email)) return t.errores.emailInvalido;
      if (!/^\d{6,}$/.test(data.phoneNumber.replace(/[\s-]/g, ""))) return t.errores.telefonoInvalido;
    }
    if (paso === 2) {
      if (!data.province.trim() || !data.municipality.trim()) return t.errores.requerido;
      if (data.selectedServices.length === 0) return t.errores.seleccionaServicio;
    }
    if (paso === 3) {
      if (data.valueProposition.trim().length < 20) return t.errores.propuestaCorta;
      if (data.profilePhotoUrl && !urlValida(data.profilePhotoUrl)) return t.errores.urlInvalida;
    }
    if (paso === 4) {
      const pm = data.paymentMethod;
      if (pm.tipo === "tarjeta") {
        if (!pm.titular?.trim() || !/^\d{16}$/.test((pm.numero ?? "").replace(/\s/g, "")) || !/^\d{2}\/\d{2}$/.test(pm.caducidad ?? "") || !/^\d{3,4}$/.test(pm.cvc ?? "")) {
          return t.errores.pagoInvalido;
        }
      }
      if (pm.tipo === "paypal" && !/^\S+@\S+\.\S+$/.test(pm.emailPaypal ?? "")) return t.errores.pagoInvalido;
      if (pm.tipo === "transferencia" && !/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/i.test((pm.iban ?? "").replace(/\s/g, ""))) return t.errores.pagoInvalido;
    }
    return "";
  }

  function avanzar() {
    const msg = validar();
    if (msg) {
      setError(msg);
      return;
    }
    if (paso < TOTAL_PASOS - 1) {
      setError("");
      setPaso(paso + 1);
      return;
    }
    try {
      window.localStorage.setItem("pj-onboarding-profesional", JSON.stringify(data));
    } catch {}
    setDone(true);
  }

  function retroceder() {
    setError("");
    setPaso((p) => Math.max(0, p - 1));
  }

  if (done) {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckIcon />
        </span>
        <h2 className="mt-6 font-bold tracking-tight text-gray-900">{t.exito.titulo}</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">{t.exito.texto}</p>
        <Link
          href={dashboardHref}
          className="mt-8 inline-flex h-[52px] items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          {t.exito.cta}
        </Link>
      </div>
    );
  }

  const titulos = [
    { titulo: t.paso1.titulo, ayuda: t.paso1.ayuda },
    { titulo: t.paso2.titulo, ayuda: t.paso2.ayuda },
    { titulo: t.paso3.titulo, ayuda: t.paso3.ayuda },
    { titulo: t.paso4.titulo, ayuda: t.paso4.ayuda },
    { titulo: t.paso5.titulo, ayuda: t.paso5.ayuda },
    { titulo: t.paso6.titulo, ayuda: t.paso6.ayuda },
  ][paso];

  const etiquetaBoton = paso === TOTAL_PASOS - 1 ? t.paso6.confirmar : t.continuar;

  function handleFotoPerfil(e: ChangeEvent<HTMLInputElement>) {
    set("profilePhotoUrl", e.target.value);
  }

  return (
    <>
      <div className="mb-8 rounded-xl bg-[#EEF3FE]/60 px-5 py-6 sm:px-7">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{titulos.titulo}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{titulos.ayuda}</p>
      </div>

      <OnboardingLayout
        hitos={t.hitos}
        hitoActual={PASO_A_HITO[paso]}
        error={error}
        atrasLabel={t.atras}
        siguienteLabel={etiquetaBoton}
        onAtras={retroceder}
        onSiguiente={avanzar}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            avanzar();
          }}
          className="space-y-6"
        >
          {paso === 0 ? (
            <fieldset>
              <legend className="sr-only">{t.paso1.titulo}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["individual", "empresa"] as EntityType[]).map((tipo) => {
                  const info = tipo === "individual" ? t.paso1.individual : t.paso1.empresa;
                  const activo = data.entityType === tipo;
                  return (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => set("entityType", tipo)}
                      aria-pressed={activo}
                      className={`flex flex-col items-start gap-1 rounded-xl border p-5 text-left transition ${
                        activo
                          ? "border-primary bg-[#EEF3FE]"
                          : "border-gray-300 hover:border-primary"
                      }`}
                    >
                      <span className={`flex w-full items-center justify-between font-semibold ${activo ? "text-primary-dark" : "text-gray-900"}`}>
                        {info.titulo}
                        {activo ? <span className="text-primary"><CheckIcon /></span> : null}
                      </span>
                      <span className="text-xs text-gray-500">{info.texto}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {paso === 1 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="ob-nombre" className={labelClass}>{t.paso2.nombre}</label>
                  <input id="ob-nombre" type="text" autoComplete="given-name" value={data.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder={t.paso2.nombrePh} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="ob-apellido" className={labelClass}>{t.paso2.apellido}</label>
                  <input id="ob-apellido" type="text" autoComplete="family-name" value={data.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder={t.paso2.apellidoPh} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="ob-telefono" className={labelClass}>{t.paso2.telefono}</label>
                <div className="flex gap-3">
                  <select
                    aria-label="Prefijo"
                    value={data.phoneCountryCode}
                    onChange={(e) => set("phoneCountryCode", e.target.value)}
                    className={`${inputClass} w-28 appearance-none`}
                  >
                    {PREFIJOS_TELEFONO.map((prefijo) => (
                      <option key={prefijo} value={prefijo}>{prefijo}</option>
                    ))}
                  </select>
                  <input id="ob-telefono" type="tel" autoComplete="tel-national" value={data.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} placeholder={t.paso2.telefonoPh} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="ob-email" className={labelClass}>Email</label>
                <input id="ob-email" type="email" autoComplete="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="tu@correo.com" className={inputClass} />
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
                <input type="checkbox" checked={data.allowPromotions} onChange={(e) => set("allowPromotions", e.target.checked)} className="mt-0.5 size-4 accent-primary" />
                {t.paso2.promociones}
              </label>
            </>
          ) : null}

          {paso === 2 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="ob-provincia" className={labelClass}>{t.paso3.provincia}</label>
                  <input id="ob-provincia" type="text" value={data.province} onChange={(e) => set("province", e.target.value)} placeholder={t.paso3.provinciaPh} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="ob-municipio" className={labelClass}>{t.paso3.municipio}</label>
                  <input id="ob-municipio" type="text" value={data.municipality} onChange={(e) => set("municipality", e.target.value)} placeholder={t.paso3.municipioPh} className={inputClass} />
                </div>
              </div>
              <fieldset>
                <legend className={labelClass}>{t.paso3.servicios}</legend>
                <div className="grid grid-cols-2 gap-3">
                  {t.servicios.map((servicio) => {
                    const activo = data.selectedServices.includes(servicio);
                    return (
                      <button
                        key={servicio}
                        type="button"
                        onClick={() => toggleServicio(servicio)}
                        aria-pressed={activo}
                        className={`flex h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm transition ${
                          activo
                            ? "border-primary bg-[#EEF3FE] font-semibold text-primary-dark"
                            : "border-gray-300 text-gray-700 hover:border-primary hover:text-primary-dark"
                        }`}
                      >
                        {activo ? <CheckIcon /> : null}
                        {servicio}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          ) : null}

          {paso === 3 ? (
            <>
              <div>
                <label htmlFor="ob-propuesta" className={labelClass}>{t.paso4.propuesta}</label>
                <textarea
                  id="ob-propuesta"
                  rows={4}
                  value={data.valueProposition}
                  onChange={(e) => set("valueProposition", e.target.value)}
                  placeholder={t.paso4.propuestaPh}
                  className="w-full rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="ob-foto-perfil" className={labelClass}>{t.paso4.fotoPerfil}</label>
                <input id="ob-foto-perfil" type="url" value={data.profilePhotoUrl} onChange={handleFotoPerfil} placeholder="https://…" className={inputClass} />
                <p className="mt-2 text-xs text-gray-400">{t.paso4.fotoAyuda}</p>
              </div>
              <div>
                <p className={labelClass}>{`${t.paso4.portfolio} · ${data.portfolioPhotos.length}/${PORTFOLIO_MAX_FOTOS}`}</p>
                {data.portfolioPhotos.length > 0 ? (
                  <ul className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {data.portfolioPhotos.map((foto, i) => (
                      <li key={foto + i} className="group relative overflow-hidden rounded-lg border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={foto} alt="" className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => quitarFoto(i)}
                          aria-label="Quitar foto"
                          className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {data.portfolioPhotos.length < PORTFOLIO_MAX_FOTOS ? (
                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={fotoInput}
                      onChange={(e) => setFotoInput(e.target.value)}
                      placeholder="https://…"
                      aria-label={t.paso4.anadirFoto}
                      className={inputClass}
                    />
                    <button type="button" onClick={anadirFotoPortfolio} className="h-[49px] shrink-0 rounded-lg border border-primary px-5 text-sm font-medium text-primary transition hover:bg-primary hover:text-white">
                      {t.paso4.anadirFoto.split(" ")[0]}
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {paso === 4 ? (
            <>
              <fieldset>
                <legend className="sr-only">{t.paso5.titulo}</legend>
                <div className="grid grid-cols-3 gap-3">
                  {(["tarjeta", "paypal", "transferencia"] as const).map((tipo) => {
                    const activo = data.paymentMethod.tipo === tipo;
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => { setError(""); setData((prev) => ({ ...prev, paymentMethod: { tipo } })); }}
                        aria-pressed={activo}
                        className={`h-12 rounded-lg border text-sm font-medium transition ${
                          activo ? "border-primary bg-[#EEF3FE] text-primary-dark" : "border-gray-300 text-gray-700 hover:border-primary"
                        }`}
                      >
                        {t.paso5[tipo]}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {data.paymentMethod.tipo === "tarjeta" ? (
                <>
                  <div>
                    <label htmlFor="ob-titular" className={labelClass}>{t.paso5.titular}</label>
                    <input id="ob-titular" type="text" autoComplete="cc-name" value={data.paymentMethod.titular ?? ""} onChange={(e) => setData((p) => ({ ...p, paymentMethod: { ...p.paymentMethod, titular: e.target.value } }))} placeholder={t.paso5.titularPh} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="ob-numero" className={labelClass}>{t.paso5.numero}</label>
                    <input id="ob-numero" inputMode="numeric" autoComplete="cc-number" value={data.paymentMethod.numero ?? ""} onChange={(e) => setData((p) => ({ ...p, paymentMethod: { ...p.paymentMethod, numero: e.target.value.replace(/[^\d\s]/g, "") } }))} placeholder="4242 4242 4242 4242" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="ob-caducidad" className={labelClass}>{t.paso5.caducidad}</label>
                      <input id="ob-caducidad" inputMode="numeric" autoComplete="cc-exp" value={data.paymentMethod.caducidad ?? ""} onChange={(e) => setData((p) => ({ ...p, paymentMethod: { ...p.paymentMethod, caducidad: e.target.value } }))} placeholder={t.paso5.caducidadPh} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="ob-cvc" className={labelClass}>CVC</label>
                      <input id="ob-cvc" inputMode="numeric" autoComplete="cc-csc" value={data.paymentMethod.cvc ?? ""} onChange={(e) => setData((p) => ({ ...p, paymentMethod: { ...p.paymentMethod, cvc: e.target.value.replace(/\D/g, "") } }))} placeholder="123" className={inputClass} />
                    </div>
                  </div>
                </>
              ) : null}

              {data.paymentMethod.tipo === "paypal" ? (
                <div>
                  <label htmlFor="ob-paypal" className={labelClass}>{t.paso5.emailPaypal}</label>
                  <input id="ob-paypal" type="email" value={data.paymentMethod.emailPaypal ?? ""} onChange={(e) => setData((p) => ({ ...p, paymentMethod: { ...p.paymentMethod, emailPaypal: e.target.value } }))} placeholder="tu@correo.com" className={inputClass} />
                </div>
              ) : null}

              {data.paymentMethod.tipo === "transferencia" ? (
                <div>
                  <label htmlFor="ob-iban" className={labelClass}>{t.paso5.iban}</label>
                  <input id="ob-iban" value={data.paymentMethod.iban ?? ""} onChange={(e) => setData((p) => ({ ...p, paymentMethod: { ...p.paymentMethod, iban: e.target.value.toUpperCase() } }))} placeholder="ES91 2100 0418 4502 0005 1332" className={inputClass} />
                </div>
              ) : null}
            </>
          ) : null}

          {paso === 5 ? (
            <dl className="divide-y divide-gray-100 rounded-xl border border-gray-200">
              {[
                [t.paso6.resumen.perfil, data.entityType === "empresa" ? t.paso1.empresa.titulo : t.paso1.individual.titulo],
                [t.paso6.resumen.nombre, `${data.firstName} ${data.lastName}`],
                [t.paso6.resumen.telefono, `${data.phoneCountryCode} ${data.phoneNumber}`],
                ["Email", data.email],
                [t.paso6.resumen.zona, `${data.municipality}, ${data.province}`],
                [t.paso6.resumen.servicios, data.selectedServices.join(", ")],
                [t.paso6.resumen.propuesta, data.valueProposition.length > 90 ? `${data.valueProposition.slice(0, 90)}…` : data.valueProposition],
                [t.paso6.resumen.fotos, `1 + ${data.portfolioPhotos.length}`],
                [
                  t.paso6.resumen.pago,
                  data.paymentMethod.tipo === "tarjeta" && data.paymentMethod.numero
                    ? `${t.paso5.tarjeta} ····${data.paymentMethod.numero.replace(/\s/g, "").slice(-4)}`
                    : t.paso5[data.paymentMethod.tipo],
                ],
              ].map(([clave, valor]) => (
                <div key={clave} className="flex gap-4 px-5 py-3.5 text-sm">
                  <dt className="w-32 shrink-0 text-gray-400">{clave}</dt>
                  <dd className="min-w-0 break-words font-medium text-gray-900">{valor}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <button type="submit" className="sr-only">
            {etiquetaBoton}
          </button>
        </form>
      </OnboardingLayout>
    </>
  );
}
