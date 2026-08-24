"use client";

import { useState, type FormEvent } from "react";
import Modal from "../dashboard/Modal";

type PublicarForm = {
  cta: string;
  title: string;
  cancel: string;
  enviar: string;
  titulo: string;
  tituloPh: string;
  categoria: string;
  categorias: string[];
  descripcion: string;
  descripcionPh: string;
  ubicacion: string;
  ubicacionPh: string;
  presupuesto: string;
  presupuestoPh: string;
};

export type RequestsData = {
  title: string;
  subtitle: string;
  publicar: PublicarForm;
  items: { title: string; meta: string; detail: string; cta: string }[];
  detalle: { title: string; estado: string; descripcion: string; close: string };
  descripciones: string[];
};

const inputClass =
  "h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40";

export default function CustomerRequestsSection({ data }: { data: RequestsData }) {
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const detail = detailIdx === null ? null : data.items[detailIdx];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPublishOpen(false);
  }

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">
            {data.title}
          </h1>
          <p className="mt-2 text-sm text-muted">{data.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setPublishOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {data.publicar.cta}
        </button>
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {data.items.map((item, index) => (
          <li
            key={item.title}
            className="rounded-xl border border-line/40 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">{item.title}</h2>
              <span className="shrink-0 rounded-full bg-badge px-3 py-1 text-xs font-semibold text-primary-dark">
                {item.meta}
              </span>
            </div>
            <p className="mt-2 text-sm text-steel">{item.detail}</p>
            <button
              type="button"
              onClick={() => setDetailIdx(index)}
              className="mt-4 inline-flex h-9 items-center rounded-lg border border-primary px-4 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
            >
              {item.cta}
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={detail !== null}
        onClose={() => setDetailIdx(null)}
        title={data.detalle.title}
        closeLabel={data.detalle.close}
      >
        {detail ? (
          <>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">{detail.title}</dt>
                <dd className="mt-1 flex items-center gap-3">
                  <span className="rounded-full bg-badge px-3 py-1 text-xs font-semibold text-primary-dark">
                    {detail.meta}
                  </span>
                  <span className="text-xs text-muted">{detail.detail}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                  {data.detalle.descripcion}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink">
                  {detailIdx !== null ? data.descripciones[detailIdx] : ""}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setDetailIdx(null)}
              className="mt-7 h-12 w-full rounded-lg border border-line/60 text-sm font-medium text-ink transition hover:border-primary hover:text-primary"
            >
              {data.detalle.close}
            </button>
          </>
        ) : null}
      </Modal>

      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title={data.publicar.title}
        closeLabel={data.publicar.cancel}
      >
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="pub-titulo" className="mb-2 block text-sm font-medium text-ink">
              {data.publicar.titulo}
            </label>
            <input id="pub-titulo" name="titulo" type="text" required autoFocus placeholder={data.publicar.tituloPh} className={inputClass} />
          </div>
          <div>
            <label htmlFor="pub-categoria" className="mb-2 block text-sm font-medium text-ink">
              {data.publicar.categoria}
            </label>
            <select id="pub-categoria" name="categoria" required defaultValue="" className={`${inputClass} appearance-none`}>
              <option value="" disabled>
                {data.publicar.categoria}
              </option>
              {data.publicar.categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pub-descripcion" className="mb-2 block text-sm font-medium text-ink">
              {data.publicar.descripcion}
            </label>
            <textarea
              id="pub-descripcion"
              name="descripcion"
              rows={4}
              required
              placeholder={data.publicar.descripcionPh}
              className="w-full rounded-lg bg-field p-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label htmlFor="pub-ubicacion" className="mb-2 block text-sm font-medium text-ink">
              {data.publicar.ubicacion}
            </label>
            <input id="pub-ubicacion" name="ubicacion" type="text" required placeholder={data.publicar.ubicacionPh} className={inputClass} />
          </div>
          <div>
            <label htmlFor="pub-presupuesto" className="mb-2 block text-sm font-medium text-ink">
              {data.publicar.presupuesto}
            </label>
            <input id="pub-presupuesto" name="presupuesto" type="number" min="1" placeholder={data.publicar.presupuestoPh} className={inputClass} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="h-12 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">
              {data.publicar.enviar}
            </button>
            <button
              type="button"
              onClick={() => setPublishOpen(false)}
              className="h-12 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink"
            >
              {data.publicar.cancel}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
