"use client";

import { useState, useTransition } from "react";
import Modal from "./Modal";
import { setProfessionalPassword } from "../../actions/profesional";

type Labels = {
  title: string;
  subtitle: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmLabel: string;
  confirmPlaceholder: string;
  mismatch: string;
  tooShort: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  closeLabel: string;
};

export default function SetPasswordModal({ labels }: { labels: Labels }) {
  const [open, setOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    if (password.length < 6) {
      setError(labels.tooShort);
      return;
    }
    if (password !== confirm) {
      setError(labels.mismatch);
      return;
    }
    startTransition(async () => {
      const res = await setProfessionalPassword(password);
      if (!res?.ok) {
        setError(labels.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <Modal
      open={open && !saved}
      onClose={() => setOpen(false)}
      title={labels.title}
      closeLabel={labels.closeLabel}
    >
      {saved ? (
        <SetPasswordSuccess labels={labels} />
      ) : (
        <SetPasswordForm
          labels={labels}
          password={password}
          confirm={confirm}
          onPassword={setPassword}
          onConfirm={setConfirm}
          error={error}
          pending={pending}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  );
}

function SetPasswordForm({
  labels,
  password,
  confirm,
  onPassword,
  onConfirm,
  error,
  pending,
  onSubmit,
}: {
  labels: Labels;
  password: string;
  confirm: string;
  onPassword: (v: string) => void;
  onConfirm: (v: string) => void;
  error: string | null;
  pending: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-5">
      <p className="text-sm leading-relaxed text-steel">{labels.subtitle}</p>
      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="spp-password" className="mb-2 block text-sm font-medium text-ink">
            {labels.passwordLabel}
          </label>
          <input
            id="spp-password"
            type="password"
            autoComplete="new-password"
            placeholder={labels.passwordPlaceholder}
            value={password}
            onChange={(e) => onPassword(e.target.value)}
            className="h-12 w-full rounded-lg border border-line/70 bg-white px-4 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="spp-confirm" className="mb-2 block text-sm font-medium text-ink">
            {labels.confirmLabel}
          </label>
          <input
            id="spp-confirm"
            type="password"
            autoComplete="new-password"
            placeholder={labels.confirmPlaceholder}
            value={confirm}
            onChange={(e) => onConfirm(e.target.value)}
            className="h-12 w-full rounded-lg border border-line/70 bg-white px-4 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        disabled={pending}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </div>
  );
}

function SetPasswordSuccess({ labels }: { labels: Labels }) {
  return (
    <div className="mt-5">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="pt-2 text-sm font-medium text-ink">{labels.success}</p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
      >
        {labels.submit}
      </button>
    </div>
  );
}