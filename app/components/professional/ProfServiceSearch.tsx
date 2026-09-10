"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type ProfService = {
  id: string;
  name: string;
  slug: string;
};

// Barra de búsqueda del hero de profesionales: filtra en tiempo real los
// servicios que tienen un formulario de inscripción de profesionales activo y,
// al hacer clic en un resultado, redirige a su formulario (/profesional/{slug}).
export default function ProfServiceSearch({
  services,
  lang,
  placeholder,
  button,
}: {
  services: ProfService[];
  lang: string;
  placeholder: string;
  button: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function go(s: ProfService) {
    router.push(`/${lang}/profesional/${s.slug || s.id}`);
  }

  return (
    <form
      action="#"
      className="mt-9"
      onSubmit={(e) => {
        e.preventDefault();
        if (filtered[0]) go(filtered[0]);
      }}
    >
      <div ref={ref} className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          type="search"
          name="prof-service-search"
          autoComplete="off"
          autoCapitalize="sentences"
          inputMode="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="h-12 w-full rounded-lg bg-field pl-11 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
        />
        {open && filtered.length > 0 && (
          <ul className="absolute top-full left-0 z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line/60 bg-white shadow-lg">
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ink transition hover:bg-surface"
                  onClick={() => go(s)}
                >
                  <span className="text-muted">→</span>
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="submit"
        className="mt-4 h-12 w-full rounded-lg bg-primary-dark text-sm font-medium text-white transition hover:bg-primary"
      >
        {button}
      </button>
    </form>
  );
}