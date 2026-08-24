"use client";

import type { ReactNode } from "react";
import type { MilestoneKey } from "./onboarding-types";

export default function OnboardingLayout({
  hitos,
  hitoActual,
  completado = false,
  error = "",
  atrasLabel,
  siguienteLabel,
  onAtras,
  onSiguiente,
  children,
}: {
  hitos: string[];
  hitoActual: MilestoneKey;
  completado?: boolean;
  error?: string;
  atrasLabel: string;
  siguienteLabel: string;
  onAtras: () => void;
  onSiguiente: () => void;
  children: ReactNode;
}) {
  const puedeVolver = !completado && hitoActual > 0;

  return (
    <>
      <div className="mb-9">
        <ol className="flex items-center gap-2" aria-label="Progreso del registro">
          {hitos.map((hito, i) => {
            const estado = i < hitoActual || completado ? "hecho" : i === hitoActual ? "actual" : "pendiente";
            return (
              <li key={hito} className="flex min-w-0 flex-1 items-center gap-2" aria-current={estado === "actual" ? "step" : undefined}>
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold transition ${
                    estado === "pendiente"
                      ? "bg-gray-200 text-gray-400"
                      : estado === "actual"
                        ? "bg-primary text-white"
                        : "bg-primary-dark text-white"
                  }`}
                >
                  {estado === "hecho" ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`hidden truncate text-xs sm:block ${
                    estado === "pendiente" ? "text-gray-400" : "font-semibold text-gray-900"
                  }`}
                >
                  {hito}
                </span>
                {i < hitos.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`h-px flex-1 ${i < hitoActual || completado ? "bg-primary-dark/60" : "bg-gray-200"}`}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <div aria-live="polite">{children}</div>

      {error ? (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}

      {!completado ? (
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={onSiguiente}
            className="h-[52px] flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {siguienteLabel}
          </button>
          {puedeVolver ? (
            <button
              type="button"
              onClick={onAtras}
              className="h-[52px] rounded-lg border border-gray-300 px-6 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
            >
              {atrasLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
