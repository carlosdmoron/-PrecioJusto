"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginInline } from "../../actions/auth";
import { createRequest } from "../../actions/requests";
import PasswordInput from "../login/PasswordInput";

type Labels = {
  badge: string;
  title: string;
  subtitle: string;
  serviceLabel: string;
  servicePlaceholder: string;
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  cityLabel: string;
  cityPlaceholder: string;
  budgetLabel: string;
  budgetPlaceholder: string;
  loginTitle: string;
  loginHint: string;
  noAccount: string;
  registerLink: string;
  loginAndSubmit: string;
  loginAndSubmitPending: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successText: string;
  viewRequests: string;
  backHome: string;
  submitError: string;
};

type Props = {
  lang: string;
  service: { id: string; name: string; slug: string; description: string | null };
  services: { id: string; name: string }[];
  registerHref: string;
  isLoggedIn: boolean;
  labels: Labels;
  loginLabels: {
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
  };
};

const inputClass =
  "h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40";

export default function SolicitarServiceForm({
  lang,
  service,
  services,
  registerHref,
  isLoggedIn,
  labels,
  loginLabels,
}: Props) {
  const router = useRouter();
  const [authed, setAuthed] = useState(isLoggedIn);
  const [created, setCreated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: "",
    service_id:
      service.id && services.some((s) => s.id === service.id)
        ? service.id
        : (services[0]?.id ?? ""),
    description: "",
    city: "",
    budget: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (created || pending) return;
    setLoginError(null);
    setSubmitError(null);

    startTransition(async () => {
      try {
        if (!authed) {
          const loginData = new FormData(e.currentTarget);
          const loginResult = await loginInline(lang, {}, loginData);
          if (loginResult.error) {
            setLoginError(loginResult.error);
            return;
          }
          if (loginResult.role && loginResult.role !== "client") {
            const href =
              loginResult.role === "professional"
                ? `/${lang}/dashboard-profesional`
                : `/${lang}/dashboard-admin`;
            router.push(href);
            return;
          }
          setAuthed(true);
        }

        await createRequest({
          title: form.title,
          service_id: form.service_id,
          description: form.description,
          city: form.city,
          budget: Number(form.budget),
        });
        setCreated(true);
      } catch {
        setSubmitError(labels.submitError);
      }
    });
  }

  if (created) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-xl shadow-navy/10 sm:p-12">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">
          {labels.successTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-steel">
          {labels.successText}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <a
            href={`/${lang}/dashboard-cliente/solicitudes`}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {labels.viewRequests}
          </a>
          <a
            href={`/${lang}`}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink"
          >
            {labels.backHome}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-xl shadow-navy/10">
      <div className="border-b border-line/40 p-6 sm:p-10">
        <span className="inline-flex items-center rounded-full bg-badge px-3.5 py-1 text-xs font-semibold text-primary-dark">
          {labels.badge}
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
          {labels.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-steel">
          {labels.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-10">
        <div className="space-y-5">
          <div>
            <label htmlFor="solicitar-servicio" className="mb-2 block text-sm font-medium text-ink">
              {labels.serviceLabel}
            </label>
            <select
              id="solicitar-servicio"
              name="service_id"
              value={form.service_id}
              onChange={handleChange}
              className={`${inputClass} appearance-none`}
            >
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="solicitar-titulo" className="mb-2 block text-sm font-medium text-ink">
              {labels.titleLabel}
            </label>
            <input
              id="solicitar-titulo"
              name="title"
              type="text"
              required
              placeholder={labels.titlePlaceholder}
              value={form.title}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="solicitar-descripcion" className="mb-2 block text-sm font-medium text-ink">
              {labels.descriptionLabel}
            </label>
            <textarea
              id="solicitar-descripcion"
              name="description"
              rows={4}
              required
              placeholder={labels.descriptionPlaceholder}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-lg bg-field p-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label htmlFor="solicitar-ciudad" className="mb-2 block text-sm font-medium text-ink">
              {labels.cityLabel}
            </label>
            <input
              id="solicitar-ciudad"
              name="city"
              type="text"
              required
              placeholder={labels.cityPlaceholder}
              value={form.city}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="solicitar-presupuesto" className="mb-2 block text-sm font-medium text-ink">
              {labels.budgetLabel}
            </label>
            <input
              id="solicitar-presupuesto"
              name="budget"
              type="number"
              min="1"
              placeholder={labels.budgetPlaceholder}
              value={form.budget}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {!authed ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <h2 className="text-sm font-semibold text-ink">{labels.loginTitle}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-ink">
                  {loginLabels.emailLabel}
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={loginLabels.emailPlaceholder}
                  className={inputClass}
                />
              </div>
              <PasswordInput
                label={loginLabels.passwordLabel}
                placeholder={loginLabels.passwordPlaceholder}
                showLabel={loginLabels.showPassword}
                hideLabel={loginLabels.hidePassword}
              />
            </div>
            {loginError ? (
              <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {loginError}
              </p>
            ) : null}
            <p className="mt-4 text-xs text-steel">{labels.loginHint}</p>
            <p className="mt-2 text-sm text-muted">
              {labels.noAccount}{" "}
              <a href={registerHref} className="font-medium text-primary transition hover:underline">
                {labels.registerLink}
              </a>
            </p>
          </div>
        ) : null}

        {submitError ? (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {submitError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || created}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {pending
            ? authed
              ? labels.submitting
              : labels.loginAndSubmitPending
            : authed
              ? labels.submit
              : labels.loginAndSubmit}
        </button>
      </form>
    </div>
  );
}