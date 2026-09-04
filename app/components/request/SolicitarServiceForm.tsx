"use client";

import { useEffect, useMemo, useState, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginInline } from "../../actions/auth";
import {
  createSolicitud,
  createDraftRequest,
  claimDraftRequest,
  type SolicitudQuestion,
} from "../../actions/solicitud";
import PasswordInput from "../login/PasswordInput";

type ServiceInfo = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type Labels = {
  badge: string;
  title: string;
  subtitle: string;
  requiredMark: string;
  stepOf: string;
  nextButton: string;
  backButton: string;
  optionalSectionTitle: string;
  cityLabel: string;
  cityPlaceholder: string;
  budgetLabel: string;
  budgetPlaceholder: string;
  sendButton: string;
  sendPending: string;
  savingDraft: string;
  checkAnswersError: string;
  loginTitle: string;
  loginHint: string;
  noAccount: string;
  registerLink: string;
  loginButton: string;
  loginPending: string;
  formLostError: string;
  successTitle: string;
  successText: string;
  viewRequests: string;
  backHome: string;
  submitError: string;
  noFormTitle: string;
  noFormText: string;
  backServices: string;
};

type Props = {
  lang: string;
  service: ServiceInfo;
  form: { id: string; version: string } | null;
  questions: SolicitudQuestion[];
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

type Answer = string | string[] | number;
type Answers = Record<string, Answer>;

type Draft = {
  anon_code?: string;
  answers?: Answers;
  description?: string;
  city?: string;
  budget?: string;
};

type Step =
  | { kind: "question"; question: SolicitudQuestion }
  | { kind: "extra" };

const inputClass =
  "h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40";

function draftKey(serviceSlug: string) {
  return `pj-draft-${serviceSlug}`;
}

function readDraft(serviceSlug: string): Draft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(serviceSlug));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function writeDraft(serviceSlug: string, draft: Draft) {
  try {
    window.localStorage.setItem(draftKey(serviceSlug), JSON.stringify(draft));
  } catch {
    /* almacenamiento no disponible */
  }
}

function clearDraft(serviceSlug: string) {
  try {
    window.localStorage.removeItem(draftKey(serviceSlug));
  } catch {
    /* ignorar */
  }
}

function generateAnonCode(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function deriveTitle(serviceName: string, answers: Answers) {
  for (const value of Object.values(answers ?? {})) {
    const val = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    const clean = val.replace(/\s+/g, " ").trim();
    if (clean) return `${serviceName}: ${clean.slice(0, 80)}`;
  }
  return serviceName;
}

function buildDescription(questions: SolicitudQuestion[], answers: Answers) {
  return questions
    .map((q) => {
      const v = answers[q.id];
      if (v == null || (Array.isArray(v) && v.length === 0)) return null;
      const val = Array.isArray(v) ? v.join(", ") : String(v);
      return `${q.label}: ${val}`;
    })
    .filter(Boolean)
    .join("\n");
}

function stepLabel(template: string, current: number, total: number) {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

export default function SolicitarServiceForm({
  lang,
  service,
  form,
  questions,
  registerHref,
  isLoggedIn,
  labels,
  loginLabels,
}: Props) {
  const router = useRouter();

  const [phase, setPhase] = useState<"form" | "login" | "success">("form");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [draftCode, setDraftCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const boundLogin = loginInline.bind(null, lang);
  const [loginState, loginAction, loginPending] = useActionState(boundLogin, {});
  const loginError = loginState?.error ?? null;

  const authed = isLoggedIn || loginState?.ok === true;

  const hasForm = Boolean(form && questions.length > 0);

  const steps = useMemo<Step[]>(() => {
    if (!hasForm) return [];
    return [
      ...questions.map((question) => ({ kind: "question" as const, question })),
      { kind: "extra" as const },
    ];
  }, [hasForm, questions]);

  const totalSteps = steps.length;
  const currentStep = steps[Math.min(step, Math.max(0, totalSteps - 1))];

  // Restaura un borrador previo (caso C: abandono del login o recarga).
  // El borrador vive en localStorage, que solo existe en el cliente tras
  // montar: se lee en un efecto a propósito (no se puede hidratar desde el SSR).
  useEffect(() => {
    if (!hasForm) return;
    const saved = readDraft(service.slug);
    if (!saved) return;
    if (saved.answers && Object.keys(saved.answers).length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(saved.answers);
    }
    setCity(saved.city ?? "");
    setBudget(saved.budget ?? "");
    if (saved.anon_code) setDraftCode(saved.anon_code);
  }, [service.slug, hasForm]);

  // Si el usuario ya tiene sesión y existe un borrador sin vincular, lo vincula
  // automáticamente (caso A: el formulario ya estaba completo antes del login).
  useEffect(() => {
    if (!authed || !hasForm) return;
    if (loginState?.role && loginState.role !== "client") return;
    const saved = readDraft(service.slug);
    if (!saved?.anon_code) return;
    const code = saved.anon_code;
    startTransition(async () => {
      try {
        await claimDraftRequest(code);
        clearDraft(service.slug);
        setPhase("success");
      } catch {
        clearDraft(service.slug);
      }
    });
  }, [authed, hasForm, service.slug, loginState?.role]);

  // Si el login inline termina bien y es profesional/admin, no puede crear
  // solicitudes: redirigimos a su panel. Los clientes continúan en el flujo
  // (el borrador se vincula en el efecto anterior al pasar authed a true).
  useEffect(() => {
    if (!loginState?.ok) return;
    if (loginState.role && loginState.role !== "client") {
      const href =
        loginState.role === "professional"
          ? `/${lang}/dashboard-profesional`
          : `/${lang}/dashboard-admin`;
      router.push(href);
    }
  }, [loginState, lang, router]);

  function handleAnswer(questionId: string, value: Answer) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  const questionAnswered = (q: SolicitudQuestion) => {
    const v = answers[q.id];
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    return String(v).trim().length > 0;
  };

  const allAnswered = useMemo(() => {
    if (!hasForm) return true;
    return questions.every((q) => {
      if (!q.required) return true;
      const v = answers[q.id];
      if (v == null) return false;
      if (Array.isArray(v)) return v.length > 0;
      return String(v).trim().length > 0;
    });
  }, [answers, questions, hasForm]);

  function handleNext() {
    if (
      currentStep.kind === "question" &&
      currentStep.question.required &&
      !questionAnswered(currentStep.question)
    ) {
      setFormError(labels.checkAnswersError);
      return;
    }
    setFormError(null);
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      return;
    }
    doSubmit();
  }

  function handleBack() {
    setFormError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function doSubmit() {
    if (!hasForm) return;
    if (!allAnswered) {
      setFormError(labels.checkAnswersError);
      return;
    }
    setSubmitError(null);

    const payload = {
      service_id: service.id,
      form_id: form?.id ?? "",
      answers,
      title: deriveTitle(service.name, answers),
      description: buildDescription(questions, answers),
      city: city.trim() || undefined,
      budget: budget ? Number(budget) : undefined,
    };

    startTransition(async () => {
      try {
        if (authed) {
          await createSolicitud(payload);
          clearDraft(service.slug);
          setPhase("success");
          return;
        }

        // Invitado: guardamos primero un borrador y luego pedimos login/registro.
        const code = draftCode ?? generateAnonCode();
        setDraftCode(code);
        writeDraft(service.slug, {
          anon_code: code,
          answers,
          description: payload.description,
          city: payload.city,
          budget,
        });
        await createDraftRequest({ ...payload, anon_code: code });
        setPhase("login");
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : labels.submitError
        );
      }
    });
  }

  // Caso E: servicio sin formulario activo.
  if (!hasForm) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-xl shadow-navy/10 sm:p-12">
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          {labels.noFormTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-steel">
          {labels.noFormText}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <a
            href={`/${lang}`}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {labels.backServices}
          </a>
        </div>
      </div>
    );
  }

  if (phase === "success") {
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

  if (phase === "login" && !authed) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-xl shadow-navy/10 sm:p-12">
        <span className="inline-flex items-center rounded-full bg-badge px-3.5 py-1 text-xs font-semibold text-primary-dark">
          {labels.badge}
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink">
          {labels.loginTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-steel">
          {labels.loginHint}
        </p>
        <div className="mt-6 space-y-4">
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
        <button
          type="button"
          onClick={() => {
            const emailEl = document.getElementById("login-email") as HTMLInputElement | null;
            const passwordEl = document.getElementById("password") as HTMLInputElement | null;
            if (!emailEl || !passwordEl) return;
            const fd = new FormData();
            fd.set("email", emailEl.value);
            fd.set("password", passwordEl.value);
            loginAction(fd);
          }}
          disabled={loginPending || pending}
          className="mt-6 h-12 w-full rounded-lg bg-primary-dark text-sm font-medium text-white transition hover:bg-primary disabled:opacity-60"
        >
          {loginPending ? labels.loginPending : labels.loginButton}
        </button>
        <p className="mt-4 text-xs text-steel">{labels.loginHint}</p>
        <p className="mt-2 text-sm text-muted">
          {labels.noAccount}{" "}
          <a href={registerHref} className="font-medium text-primary transition hover:underline">
            {labels.registerLink}
          </a>
        </p>
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
        <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-ink">{service.name}</p>
            {service.description ? (
              <p className="mt-0.5 text-xs text-steel">{service.description}</p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full bg-badge px-3 py-1 text-xs font-semibold text-primary-dark">
            v{form?.version ?? "1.0"}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-ink">
            {stepLabel(labels.stepOf, step + 1, totalSteps)}
          </p>
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-primary"
                    : i < step
                    ? "w-1.5 bg-primary/50"
                    : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
        </div>

        {currentStep?.kind === "question" ? (
          <QuestionField
            question={currentStep.question}
            value={answers[currentStep.question.id]}
            requiredMark={labels.requiredMark}
            onChange={(v) => handleAnswer(currentStep.question.id, v)}
          />
        ) : (
          <div className="rounded-xl border border-line/40 bg-surface/40 p-5">
            <h2 className="text-sm font-semibold text-ink">
              {labels.optionalSectionTitle}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="solicitar-ciudad" className="mb-2 block text-sm font-medium text-ink">
                  {labels.cityLabel}
                </label>
                <input
                  id="solicitar-ciudad"
                  name="city"
                  type="text"
                  placeholder={labels.cityPlaceholder}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
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
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {formError ? (
          <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {formError}
          </p>
        ) : null}
        {submitError ? (
          <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {submitError}
          </p>
        ) : null}

        <div className="mt-6 flex gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={pending}
              className="inline-flex h-12 items-center justify-center rounded-lg border border-line/60 px-6 text-sm font-medium text-steel transition hover:text-ink disabled:opacity-60"
            >
              {labels.backButton}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleNext}
            disabled={pending || totalSteps === 0}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {pending
              ? authed
                ? labels.sendPending
                : labels.savingDraft
              : currentStep?.kind === "extra"
              ? labels.sendButton
              : labels.nextButton}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionField({
  question,
  value,
  requiredMark,
  onChange,
}: {
  question: SolicitudQuestion;
  value: Answer;
  requiredMark: string;
  onChange: (v: Answer) => void;
}) {
  const { id, label, type, required, options } = question;

  return (
    <div>
      <label
        className="mb-2 block text-sm font-medium text-ink"
        htmlFor={type === "radio" || type === "checkbox" || type === "scale" ? undefined : id}
      >
        {label}
        {required ? (
          <span className="ml-1 text-primary" aria-hidden="true">
            {requiredMark}
          </span>
        ) : null}
      </label>

      {type === "textarea" ? (
        <textarea
          id={id}
          rows={4}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-field p-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
        />

      ) : type === "select" ? (
        <SelectField
          id={id}
          options={Array.isArray(options) ? options : []}
          value={value}
          onChange={onChange}
        />

      ) : type === "radio" ? (
        <RadioGroup
          name={id}
          options={Array.isArray(options) ? options : []}
          value={value}
          onChange={onChange}
        />

      ) : type === "checkbox" ? (
        <CheckboxGroup
          name={id}
          options={Array.isArray(options) ? options : []}
          value={value}
          onChange={onChange}
        />

      ) : type === "scale" ? (
        <ScaleField value={value} required={required} onChange={onChange} />

      ) : (
        <input
          type="text"
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={type === "number" ? "0" : ""}
          className="h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
        />
      )}
    </div>
  );
}

function SelectField({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: string[];
  value: Answer;
  onChange: (v: Answer) => void;
}) {
  return (
    <select
      id={id}
      value={Array.isArray(value) ? "" : String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40"
    >
      <option value="">—</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: Answer;
  onChange: (v: Answer) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
            value === opt
              ? "border-primary/60 bg-primary/5"
              : "border-line/60 bg-white hover:border-primary/30"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-ink">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: Answer;
  onChange: (v: Answer) => void;
}) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((o) => o !== opt)
      : [...selected, opt];
    onChange(next);
  };

  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
            selected.includes(opt)
              ? "border-primary/60 bg-primary/5"
              : "border-line/60 bg-white hover:border-primary/30"
          }`}
        >
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="size-4 accent-primary"
          />
          <span className="text-sm text-ink">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function ScaleField({
  value,
  required,
  onChange,
}: {
  value: Answer;
  required: boolean;
  onChange: (v: Answer) => void;
}) {
  const scale = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div className="flex flex-wrap gap-1.5">
      {scale.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-9 w-9 rounded-lg border text-sm font-semibold transition ${
            value === n
              ? "border-primary bg-primary text-white"
              : "border-line/60 bg-white text-ink hover:border-primary/40"
          }`}
          aria-pressed={value === n}
          aria-label={required ? `${n} (obligatorio)` : String(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}