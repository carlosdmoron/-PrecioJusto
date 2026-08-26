"use client";

import { useState, useTransition } from "react";
import Modal from "../dashboard/Modal";
import { removeFavorite } from "../../actions/favorites";

type FavoriteItem = {
  id: string;
  professional?: any;
  professional_detail?: any;
};

type FavoritesData = {
  title: string;
  subtitle: string;
  verPerfil: string;
  quitar: string;
  perfil: { title: string; ciudad: string; experiencia: string; close: string };
};

function getInitials(first?: string | null, last?: string | null) {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

function getProf(v: any) {
  return Array.isArray(v) ? v[0] : v;
}

function getName(prof: any) {
  const p = getProf(prof);
  return [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Profesional";
}

function getInitialsFromFav(fav: FavoriteItem) {
  const p = getProf(fav.professional);
  return getInitials(p?.first_name, p?.last_name);
}

function getDetail(fav: FavoriteItem) {
  return getProf(fav.professional_detail) ?? {};
}

export default function FavoritesReal({
  data,
  favorites: initialFavorites,
}: {
  data: FavoritesData;
  favorites: FavoriteItem[];
}) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [profileIdx, setProfileIdx] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const profile = profileIdx === null ? null : favorites[profileIdx];

  function handleRemove(id: string) {
    startTransition(async () => {
      await removeFavorite(id);
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    });
  }

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">
        {data.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{data.subtitle}</p>

      {favorites.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line/40 bg-white p-10 text-center text-sm text-muted">
          No tienes profesionales guardados como favoritos.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {favorites.map((fav, index) => {
            const det = getDetail(fav);
            return (
              <li
                key={fav.id}
                className="rounded-xl border border-line/40 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-badge text-sm font-semibold text-primary-dark">
                    {getInitialsFromFav(fav)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{getName(fav.professional)}</p>
                    <p className="truncate text-xs text-steel">{det.municipality ?? ""}</p>
                  </div>
                  {det.rating != null && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ink">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {det.rating}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  {det.experience_years != null && (
                    <span className="rounded-full bg-panel px-3 py-1 text-xs font-semibold text-primary-dark">
                      {det.experience_years} anios exp.
                    </span>
                  )}
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
                      onClick={() => handleRemove(fav.id)}
                      disabled={isPending}
                      className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted transition hover:text-ink"
                    >
                      {data.quitar}
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal open={profile !== null} onClose={() => setProfileIdx(null)} title={data.perfil.title} closeLabel={data.perfil.close}>
        {profile ? (
          <>
            {(() => {
              const det = getDetail(profile);
              return (
                <>
                  <div className="mt-6 flex items-center gap-4">
                    <span className="grid size-16 shrink-0 place-items-center rounded-full bg-badge text-lg font-semibold text-primary-dark">
                      {getInitialsFromFav(profile)}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-ink">{getName(profile.professional)}</p>
                      <p className="text-sm text-steel">{det.municipality ?? ""}</p>
                    </div>
                  </div>
                  <dl className="mt-6 space-y-4">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{data.perfil.ciudad}</dt>
                      <dd className="mt-1 text-sm text-ink">{det.province ?? ""}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{data.perfil.experiencia}</dt>
                      <dd className="mt-1 text-sm text-ink">{det.experience_years ?? 0} anios</dd>
                    </div>
                    {det.rating != null && (
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted">{data.title}</dt>
                        <dd className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {det.rating}
                        </dd>
                      </div>
                    )}
                  </dl>
                </>
              );
            })()}
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
