"use client";

import { useState, type FormEvent } from "react";
import Modal from "../dashboard/Modal";

export type MessagesData = {
  title: string;
  subtitle: string;
  conversaciones: {
    iniciales: string;
    nombre: string;
    servicio: string;
    ultimo: string;
    hora: string;
  }[];
  hilo: {
    placeholder: string;
    enviar: string;
    mensajes: { de: string; texto: string }[];
  };
};

const inputClass =
  "h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40";

export default function MessagesSection({ data }: { data: MessagesData }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [thread, setThread] = useState<MessagesData["hilo"]["mensajes"]>([]);
  const [draft, setDraft] = useState("");
  const conv = openIdx === null ? null : data.conversaciones[openIdx];

  function openThread(index: number) {
    setOpenIdx(index);
    setThread(data.hilo.mensajes);
    setDraft("");
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setThread((prev) => [...prev, { de: "yo", texto: text }]);
    setDraft("");
  }

  return (
    <div className="px-6 py-10 lg:px-10">
      <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">
        {data.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{data.subtitle}</p>

      <ul className="mt-8 space-y-3">
        {data.conversaciones.map((c, index) => (
          <li key={c.nombre}>
            <button
              type="button"
              onClick={() => openThread(index)}
              className="flex w-full items-center gap-4 rounded-xl border border-line/40 bg-white p-5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-badge text-sm font-semibold text-primary-dark">
                {c.iniciales}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-semibold text-ink">{c.nombre}</span>
                  <span className="shrink-0 text-xs text-muted">{c.hora}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs font-medium text-primary-dark">
                  {c.servicio}
                </span>
                <span className="mt-1 block truncate text-sm text-muted">{c.ultimo}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Modal open={conv !== null} onClose={() => setOpenIdx(null)} title={conv?.nombre ?? ""} closeLabel={data.title}>
        {conv ? (
          <>
            <div className="mt-6 max-h-80 space-y-3 overflow-y-auto">
              {thread.map((m, i) => (
                <div key={i} className={`flex ${m.de === "yo" ? "justify-end" : "justify-start"}`}>
                  <p
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.de === "yo"
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm bg-panel text-ink"
                    }`}
                  >
                    {m.texto}
                  </p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="mt-6 flex gap-3 border-t border-line/30 pt-5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={data.hilo.placeholder}
                aria-label={data.hilo.placeholder}
                className={`${inputClass} flex-1`}
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                {data.hilo.enviar}
              </button>
            </form>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
