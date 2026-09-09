"use client";

import { useMemo, useState, useTransition } from "react";
import { submitProfesionalEnrollment } from "../../actions/profesional";
import type { SolicitudQuestion } from "../../actions/solicitud";
import { QuestionField, inputClass, type Answer, type Answers } from "../request/QuestionField";

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
  accountSectionTitle: string;
  firstNameLabel: string;
  firstNamePlaceholder: string;
  lastNameLabel: string;
  lastNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submitButton: string;
  submitPending: string;
  checkAnswersError: string;
  invalidEmail: string;
  passwordTooShort: string;
  emailInUse: string;
  duplicateError: string;
  alreadyTitle: string;
  alreadyText: string;
  goDashboard: string;
  noFormTitle: string;
  noFormText: string;
  backHome: string;
  successTitle: string;
  successText: string;
  submitError: string;
};

type Props = {
  lang: string;
  service: ServiceInfo;
  form: { id: string; version: string } | null;
  questions: SolicitudQuestion[];
  isLoggedIn: boolean;
  isRegistered: boolean;
  labels: Labels;
};

type Step =
  | { kind: "question"; question: SolicitudQuestion }
  | { kind: "account" };

function stepLabel(template: string, current: number, total: number) {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

export default function ProfesionalForm({
  lang,
  service,
  form,
  questions,
  isLoggedIn,
  isRegistered,
  labels,
}: Props) {
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [account, setAccount] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hasForm = Boolean(form && questions.length > 0);

  const steps = useMemo<Step[]>(() => {
    if (!hasForm) return [];
    const questionSteps = questions.map((question) => ({
      kind: "question" as const,
      question,
    }));
    return isLoggedIn ? questionSteps : [...questionSteps, { kind: "account" as const }];
  }, [hasForm, isLoggedIn, questions]);

  const totalSteps = steps.length;
  const currentStep = steps[Math.min(step, Math.max(0, totalSteps - 1))];
  const isLastStep = step === totalSteps - 1;

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

  const setAccountField = (key: keyof typeof account, value: string) => {
    setAccount((prev) => ({ ...prev, [key]: value }));
  };

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

    if (!isLoggedIn) {
      if (!/^\S+@\S+\.\S+$/.test(account.email.trim())) {
        setFormError(labels.invalidEmail);
        return;
      }
      if (account.password.length < 6) {
        setFormError(labels.passwordTooShort);
        return;
      }
    }

    setFormError(null);

    const input = {
      service_id: service.id,
      form_id: form?.id ?? "",
      answers,
      account: isLoggedIn
        ? null
        : {
            firstName: account.firstName,
            lastName: account.lastName,
            phone: account.phone.trim() || undefined,
            email: account.email.trim(),
            password: account.password,
          },
    };

    startTransition(async () => {
      try {
        await submitProfesionalEnrollment(input, {
          required: labels.checkAnswersError,
          invalidOption: labels.checkAnswersError,
          notAuthed: labels.submitError,
          emailInUse: labels.emailInUse,
          duplicate: labels.duplicateError,
          saveError: labels.submitError,
        });
        setPhase("success");
      } catch (err) {
        setFormError(err instanceof Error ? err.message : labels.submitError);
      }
    });
  }

  const backHref = `/${lang}`;

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
            href={backHref}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {labels.backHome}
          </a>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="rounded-xl bg-white p-8 shadow-xl shadow-navy/10 sm:p-12">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">
          {labels.alreadyTitle}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-steel">
          {labels.alreadyText}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <a
            href={`/${lang}/dashboard-profesional`}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {labels.goDashboard}
          </a>
          <a
            href={backHref}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink"
          >
            {labels.backHome}
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
            href={`/${lang}/dashboard-profesional`}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {labels.goDashboard}
          </a>
          <a
            href={backHref}
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
            onChange={(v: Answer) =>
              setAnswers((prev) => ({ ...prev, [currentStep.question.id]: v }))
            }
          />
        ) : (
          <div className="rounded-xl border border-line/40 bg-surface/40 p-5">
            <h2 className="text-sm font-semibold text-ink">
              {labels.accountSectionTitle}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="prof-nombre" className="mb-2 block text-sm font-medium text-ink">
                  {labels.firstNameLabel}
                </label>
                <input
                  id="prof-nombre"
                  type="text"
                  placeholder={labels.firstNamePlaceholder}
                  value={account.firstName}
                  onChange={(e) => setAccountField("firstName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="prof-apellidos" className="mb-2 block text-sm font-medium text-ink">
                  {labels.lastNameLabel}
                </label>
                <input
                  id="prof-apellidos"
                  type="text"
                  placeholder={labels.lastNamePlaceholder}
                  value={account.lastName}
                  onChange={(e) => setAccountField("lastName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="prof-telefono" className="mb-2 block text-sm font-medium text-ink">
                  {labels.phoneLabel}
                </label>
                <input
                  id="prof-telefono"
                  type="tel"
                  placeholder={labels.phonePlaceholder}
                  value={account.phone}
                  onChange={(e) => setAccountField("phone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="prof-email" className="mb-2 block text-sm font-medium text-ink">
                  {labels.emailLabel}
                </label>
                <input
                  id="prof-email"
                  type="email"
                  autoComplete="email"
                  placeholder={labels.emailPlaceholder}
                  value={account.email}
                  onChange={(e) => setAccountField("email", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="prof-password" className="mb-2 block text-sm font-medium text-ink">
                  {labels.passwordLabel}
                </label>
                <input
                  id="prof-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={labels.passwordPlaceholder}
                  value={account.password}
                  onChange={(e) => setAccountField("password", e.target.value)}
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
              ? labels.submitPending
              : isLastStep
              ? labels.submitButton
              : labels.nextButton}
          </button>
        </div>
      </div>
    </div>
  );
}