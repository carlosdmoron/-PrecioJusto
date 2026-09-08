"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Service = { id: string; slug: string; name: string };

export default function SearchBar({
  placeholder,
  searchButton,
  lang,
  services,
}: {
  placeholder: string;
  searchButton: string;
  lang: string;
  services: Service[];
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

  function go(s: Service) {
    const slug = s.slug || s.id;
    if (slug) {
      router.push(`/${lang}/solicitar/${slug}`);
    }
  }

  return (
    <form
      action="#"
      className="mt-8 flex w-full max-w-[768px] items-stretch lg:mt-10 lg:-translate-x-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (filtered[0]) go(filtered[0]);
      }}
    >
      <div ref={ref} className="relative flex h-[54px] min-w-0 flex-1">
        <input
          type="search"
          name="service-search"
          autoComplete="off"
          autoCapitalize="sentences"
          inputMode="text"
          maxLength={524288}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="h-full w-full rounded-l-lg bg-white px-4 pr-10 text-base text-ink outline-none placeholder:text-faint"
        />
        {open && filtered.length > 0 && (
          <ul className="absolute top-full left-0 z-50 mt-1 w-full overflow-hidden rounded-lg border border-line/60 bg-white shadow-lg">
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
        className="h-[54px] w-[82px] shrink-0 rounded-r-lg bg-primary text-base font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        {searchButton}
      </button>
    </form>
  );
}