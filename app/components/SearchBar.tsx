"use client";

import { useState, useRef, useEffect } from "react";

const suggestions = [
  { key: "electricista", label: "Electricista", icon: "⚡" },
  { key: "fontanero", label: "Fontanero", icon: "🔧" },
  { key: "tecnico-aire", label: "Técnico de aire acondicionado", icon: "❄️" },
];

export default function SearchBar({ placeholder }: { placeholder: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter((s) =>
    s.label.toLowerCase().includes(query.toLowerCase())
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

  return (
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
            <li key={s.key}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ink transition hover:bg-surface"
                onMouseDown={() => {
                  setQuery(s.label);
                  setOpen(false);
                }}
              >
                <span className="text-lg">{s.icon}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
