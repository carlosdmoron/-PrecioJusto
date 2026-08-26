"use client";

import { useState, useTransition, type FormEvent } from "react";
import Modal from "../dashboard/Modal";
import { createRequest, deleteRequest } from "../../actions/requests";

type RequestItem = {
  id: string;
  title: string;
  description: string;
  city: string;
  budget: number;
  status: string;
  created_at: string;
  services?: { name: string } | null;
};

type ServiceItem = {
  id: string;
  name: string;
};

type RequestsData = {
  title: string;
  subtitle: string;
  publicar: {
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
  detalle: { title: string; estado: string; descripcion: string; close: string };
};

const inputClass =
  "h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40";

const STATUS_LABELS: Record<string, string> = {
  new: "Nueva",
  published: "Publicada",
  inProgress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
  blocked: "Bloqueada",
};

export default function CustomerRequestsReal({
  data,
  requests: initialRequests,
  services,
}: {
  data: RequestsData;
  requests: RequestItem[];
  services: ServiceItem[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const detail = detailIdx === null ? null : requests[detailIdx];

  const [form, setForm] = useState({
    title: "",
    service_id: "",
    description: "",
    city: "",
    budget: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      await createRequest({
        title: form.title,
        service_id: form.service_id,
        description: form.description,
        city: form.city,
        budget: Number(form.budget),
      });
      setPublishOpen(false);
      setForm({ title: "", service_id: "", description: "", city: "", budget: "" });
      window.location.reload();
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    });
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {data.publicar.cta}
        </button>
      </div>

      {requests.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line/40 bg-white p-10 text-center text-sm text-muted">
          No tienes solicitudes publicadas.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {requests.map((req) => (
            <li
              key={req.id}
              className="rounded-xl border border-line/40 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-ink">{req.title}</h2>
                <span className="shrink-0 rounded-full bg-badge px-3 py-1 text-xs font-semibold text-primary-dark">
                  {STATUS_LABELS[req.status] ?? req.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{req.services?.name ?? "Servicio general"} &middot; {req.city}</p>
              <p className="mt-2 line-clamp-2 text-sm text-steel">{req.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailIdx(requests.indexOf(req))}
                  className="inline-flex h-9 items-center rounded-lg border border-primary px-4 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
                >
                  {data.detalle.close === "Cerrar" ? "Ver detalle" : "Ver detalle"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(req.id)}
                  disabled={isPending}
                  className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted transition hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={detail !== null} onClose={() => setDetailIdx(null)} title={data.detalle.title} closeLabel={data.detalle.close}>
        {detail ? (
          <>
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">{data.detalle.estado}</dt>
                <dd className="mt-1">
                  <span className="rounded-full bg-badge px-3 py-1 text-xs font-semibold text-primary-dark">
                    {STATUS_LABELS[detail.status] ?? detail.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">{data.detalle.descripcion}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-ink">{detail.description}</dd>
              </div>
              {detail.budget > 0 && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">Presupuesto</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">&euro;{detail.budget}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Ubicacion</dt>
                <dd className="mt-1 text-sm text-ink">{detail.city}</dd>
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

      <Modal open={publishOpen} onClose={() => setPublishOpen(false)} title={data.publicar.title} closeLabel={data.publicar.cancel}>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="pub-titulo" className="mb-2 block text-sm font-medium text-ink">{data.publicar.titulo}</label>
            <input id="pub-titulo" name="title" type="text" required autoFocus placeholder={data.publicar.tituloPh} value={form.title} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="pub-categoria" className="mb-2 block text-sm font-medium text-ink">{data.publicar.categoria}</label>
            <select id="pub-categoria" name="service_id" required value={form.service_id} onChange={handleChange} className={`${inputClass} appearance-none`}>
              <option value="" disabled>{data.publicar.categoria}</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>{svc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pub-descripcion" className="mb-2 block text-sm font-medium text-ink">{data.publicar.descripcion}</label>
            <textarea id="pub-descripcion" name="description" rows={4} required placeholder={data.publicar.descripcionPh} value={form.description} onChange={handleChange} className="w-full rounded-lg bg-field p-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label htmlFor="pub-ubicacion" className="mb-2 block text-sm font-medium text-ink">{data.publicar.ubicacion}</label>
            <input id="pub-ubicacion" name="city" type="text" required placeholder={data.publicar.ubicacionPh} value={form.city} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label htmlFor="pub-presupuesto" className="mb-2 block text-sm font-medium text-ink">{data.publicar.presupuesto}</label>
            <input id="pub-presupuesto" name="budget" type="number" min="1" placeholder={data.publicar.presupuestoPh} value={form.budget} onChange={handleChange} className={inputClass} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={isPending} className="h-12 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50">
              {isPending ? "Publicando..." : data.publicar.enviar}
            </button>
            <button type="button" onClick={() => setPublishOpen(false)} className="h-12 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">
              {data.publicar.cancel}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
