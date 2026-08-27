"use client";

import { useActionState } from "react";
import { login } from "../../actions/auth";
import PasswordInput from "./PasswordInput";

type Props = {
  lang: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  submitButton: string;
  submitPending?: string;
};

export default function LoginForm({
  lang,
  emailLabel,
  emailPlaceholder,
  passwordLabel,
  passwordPlaceholder,
  showPassword,
  hidePassword,
  submitButton,
  submitPending,
}: Props) {
  const boundLogin = login.bind(null, lang);
  const [state, formAction, pending] = useActionState(boundLogin, {});
  const initialState: { error?: string } = state ?? {};

  return (
    <form action={formAction} className="mt-10 space-y-6">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-ink"
        >
          {emailLabel}
        </label>
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={emailPlaceholder}
            className="h-12 w-full rounded-lg bg-field pl-11 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>
      <PasswordInput
        label={passwordLabel}
        placeholder={passwordPlaceholder}
        showLabel={showPassword}
        hideLabel={hidePassword}
      />
      {initialState.error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {initialState.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-lg bg-primary-dark text-sm font-medium text-white transition hover:bg-primary disabled:opacity-60"
      >
        {pending ? (submitPending ?? submitButton) : submitButton}
      </button>
    </form>
  );
}
