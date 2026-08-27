"use client";

import { useState, useTransition } from "react";
import Modal from "../dashboard/Modal";
import { logout } from "../../actions/auth";

export type LogoutLabels = {
  cerrar: string;
  titulo: string;
  texto: string;
  cancelar: string;
  salir: string;
};

const iconPaths = (
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </>
);

export default function LogoutButton({
  loginHref,
  labels,
  compact = false,
}: {
  loginHref: string;
  labels: LogoutLabels;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    const parts = loginHref.split("/").filter(Boolean);
    const lang = parts[0] ?? "es";
    startTransition(async () => {
      await logout(lang);
    });
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={labels.cerrar}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/70 text-steel transition hover:text-primary-dark"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {iconPaths}
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-steel transition hover:bg-surface-alt hover:text-primary-dark"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {iconPaths}
          </svg>
          {labels.cerrar}
        </button>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={labels.titulo} closeLabel={labels.cancelar}>
        <p className="mt-4 text-sm text-muted">{labels.texto}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="h-12 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {isPending ? labels.cerrar : labels.salir}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-12 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink"
          >
            {labels.cancelar}
          </button>
        </div>
      </Modal>
    </>
  );
}
