"use client";

import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import type { DashboardSectionItem } from "./DashboardSection";

type FormLabels = Record<string, string | string[]>;

function str(form: FormLabels, key: string): string {
  const v = form[key];
  return typeof v === "string" ? v : "";
}

export type SectionVariant =
  | "quote"
  | "detail"
  | "status"
  | "edit"
  | "withdraw"
  | null;

type Props = {
  items: DashboardSectionItem[];
  variant: SectionVariant;
  form: FormLabels;
  balance?: { label: string; amount: string; action: string };
};

const inputClass =
  "h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40";

export default function SectionGrid({ items, variant, form, balance }: Props) {
  const [selected, setSelected] = useState<DashboardSectionItem | null>(null);
  const [open, setOpen] = useState(false);

  function openModal(item?: DashboardSectionItem) {
    setSelected(item ?? null);
    setOpen(true);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOpen(false);
  }

  const accounts =
    variant === "withdraw" && Array.isArray(form.accounts) ? form.accounts : [];

  return (
    <>
      {balance ? (
        <section
          aria-label={balance.label}
          className="mt-8 rounded-xl bg-gradient-to-r from-primary-dark to-primary p-6 text-white shadow-lg shadow-primary/30"
        >
          <p className="text-sm font-medium text-white/80">{balance.label}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <p className="text-4xl font-bold tracking-tight">{balance.amount}</p>
            <button
              type="button"
              onClick={() => openModal()}
              className="inline-flex h-11 items-center rounded-lg bg-white px-5 text-sm font-semibold text-primary-dark transition hover:bg-surface"
            >
              {balance.action}
            </button>
          </div>
        </section>
      ) : null}

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={`${item.title}-${item.meta}`}
            className="rounded-xl border border-line/40 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">{item.title}</h2>
              <span className="shrink-0 text-xs text-muted">{item.meta}</span>
            </div>
            <p className="mt-2 text-sm text-steel">{item.detail}</p>
            {variant && item.cta ? (
              <button
                type="button"
                onClick={() => openModal(item)}
                className="mt-4 inline-flex h-9 items-center rounded-lg border border-primary px-4 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
              >
                {item.cta}
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {variant === "quote" ? (
        <Modal open={open} onClose={() => setOpen(false)} title={str(form, "title")} closeLabel={str(form, "cancel")}>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="q-amount" className="mb-2 block text-sm font-medium text-ink">
                {str(form, "amount")}
              </label>
              <input id="q-amount" name="amount" type="number" min="1" required autoFocus placeholder={str(form, "amountPh")} className={inputClass} />
            </div>
            <div>
              <label htmlFor="q-days" className="mb-2 block text-sm font-medium text-ink">
                {str(form, "days")}
              </label>
              <input id="q-days" name="days" type="text" required placeholder={str(form, "daysPh")} className={inputClass} />
            </div>
            <div>
              <label htmlFor="q-message" className="mb-2 block text-sm font-medium text-ink">
                {str(form, "message")}
              </label>
              <textarea id="q-message" name="message" rows={4} required placeholder={str(form, "messagePh")} className="w-full rounded-lg bg-field p-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="h-12 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">
                {str(form, "submit")}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="h-12 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">
                {str(form, "cancel")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {variant === "detail" ? (
        <Modal open={open} onClose={() => setOpen(false)} title={str(form, "title")} closeLabel={str(form, "close")}>
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">{str(form, "service")}</dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{selected?.title}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">{str(form, "status")}</dt>
              <dd className="mt-1 text-sm text-ink">{selected?.meta}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted">{str(form, "detail")}</dt>
              <dd className="mt-1 text-sm text-ink">{selected?.detail}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-7 h-12 w-full rounded-lg border border-line/60 text-sm font-medium text-ink transition hover:border-primary hover:text-primary"
          >
            {str(form, "close")}
          </button>
        </Modal>
      ) : null}

      {variant === "status" ? (
        <Modal open={open} onClose={() => setOpen(false)} title={str(form, "title")} closeLabel={str(form, "cancel")}>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-ink">{str(form, "current")}</legend>
              <div className="space-y-2">
                {[str(form, "inProgress"), str(form, "completed"), str(form, "cancelled")].map((opt) => (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-line/50 px-4 py-3 text-sm text-ink transition has-checked:border-primary has-checked:bg-primary/5"
                  >
                    <input type="radio" name="status" value={opt} defaultChecked={opt === str(form, "inProgress")} className="accent-primary" />
                    {opt}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="h-12 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">
                {str(form, "save")}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="h-12 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">
                {str(form, "cancel")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {variant === "edit" ? (
        <Modal open={open} onClose={() => setOpen(false)} title={str(form, "title")} closeLabel={str(form, "cancel")}>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="e-name" className="mb-2 block text-sm font-medium text-ink">
                {str(form, "name")}
              </label>
              <input id="e-name" name="name" type="text" required defaultValue={selected?.title} placeholder={str(form, "namePh")} className={inputClass} />
            </div>
            <div>
              <label htmlFor="e-desc" className="mb-2 block text-sm font-medium text-ink">
                {str(form, "description")}
              </label>
              <textarea id="e-desc" name="description" rows={4} required placeholder={str(form, "descriptionPh")} className="w-full rounded-lg bg-field p-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label htmlFor="e-price" className="mb-2 block text-sm font-medium text-ink">
                {str(form, "price")}
              </label>
              <input id="e-price" name="price" type="number" min="0" step="0.01" placeholder={str(form, "pricePh")} className={inputClass} />
            </div>
            <div>
              <label htmlFor="e-state" className="mb-2 block text-sm font-medium text-ink">
                {str(form, "state")}
              </label>
              <select id="e-state" name="state" className={`${inputClass} appearance-none`} defaultValue="">
                <option value="">{str(form, "stateActive")}</option>
                <option value="paused">{str(form, "statePaused")}</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="h-12 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">
                {str(form, "save")}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="h-12 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">
                {str(form, "cancel")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {variant === "withdraw" ? (
        <Modal open={open} onClose={() => setOpen(false)} title={str(form, "title")} closeLabel={str(form, "cancel")}>
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="w-amount" className="mb-2 block text-sm font-medium text-ink">
                {str(form, "amount")}
              </label>
              <input id="w-amount" name="amount" type="number" min="1" required autoFocus placeholder={str(form, "amountPh")} className={inputClass} />
            </div>
            <div>
              <label htmlFor="w-account" className="mb-2 block text-sm font-medium text-ink">
                {str(form, "account")}
              </label>
              <select id="w-account" name="account" required className={`${inputClass} appearance-none`}>
                {accounts.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="h-12 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">
                {str(form, "confirm")}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="h-12 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">
                {str(form, "cancel")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}
