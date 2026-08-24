"use client";

import { useState } from "react";
import Modal from "../dashboard/Modal";

export type FavoritesData = {
  title: string;
  subtitle: string;
  verPerfil: string;
  quitar: string;
  perfil: { title: string; ciudad: string; experiencia: string; close: string };
  items: {
    iniciales: string;
    nombre: string;
    oficio: string;
    valoracion: string;
    tarifa: string;
    ciudad: string;
    experiencia: string;
  }[];
};

export default function FavoritesSection({ data }: { data: FavoritesData }) {
  const [list, setList] = useState(data.items);
  const [profileIdx, setProfileIdx] = useState<number | null>(null);
  const profile = profileIdx === null ? null : list[profileIdx];

  function remove(index: number) {
    setList((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">
        {data.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{data.subtitle}</p>

      {list.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line/40 bg-white p-10 text-center text-sm text-muted">
          {data.subtitle}
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {list.map((f, index) => (
            <li
              key={f.nombre}
              className="rounded-xl border border-line/40 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-badge text-sm font-semibold text-primary-dark">
                  {f.iniciales}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{f.nombre}</p>
                  <p className="truncate text-xs text-steel">{f.oficio}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ink">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {f.valoracion}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-panel px-3 py-1 text-xs font-semibold text-primary-dark">
                  {f.tarifa}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileIdx(index)}
                    className="inline-flex h-9 items-center rounded-lg border border-primary px-4 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
                  >
                    {data.verPerfil}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted transition hover:text-ink"
                  >
                    {data.quitar}
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={profile !== null} onClose={() => setProfileIdx(null)} title={data.perfil.title} closeLabel={data.perfil.close}>
        {profile ? (
          <>
            <div className="mt-6 flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-badge text-lg font-semibold text-primary-dark">
                {profile.iniciales}
              </span>
              <div>
                <p className="text-base font-semibold text-ink">{profile.nombre}</p>
                <p className="text-sm text-steel">{profile.oficio}</p>
              </div>
            </div>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">{data.perfil.ciudad}</dt>
                <dd className="mt-1 text-sm text-ink">{profile.ciudad}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">{data.perfil.experiencia}</dt>
                <dd className="mt-1 text-sm text-ink">{profile.experiencia}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">{data.title}</dt>
                <dd className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {profile.valoracion} · {profile.tarifa}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setProfileIdx(null)}
              className="mt-7 h-12 w-full rounded-lg border border-line/60 text-sm font-medium text-ink transition hover:border-primary hover:text-primary"
            >
              {data.perfil.close}
            </button>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
