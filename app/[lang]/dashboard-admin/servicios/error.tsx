"use client";

import { useEffect } from "react";

export default function ServiciosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces the real (otherwise minified) error server-side / in the console.
    console.error("Servicios route render error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p className="text-base font-semibold">
          Ocurrió un error al cargar el listado de servicios.
        </p>
        {error?.digest ? (
          <p className="mt-2 font-mono text-xs text-red-500">
            digest: {error.digest}
          </p>
        ) : null}
        {error?.message ? (
          <p className="mt-1 break-words font-mono text-xs text-red-500">
            {error.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-4 h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
