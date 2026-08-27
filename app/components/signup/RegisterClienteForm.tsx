"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerCliente, type RegisterState } from "../../actions/register";

type Props = {
  lang: string;
  labels: {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    submit: string;
    submitting: string;
    registerOk: string;
    needsConfirmation: string;
    login: string;
    loginLink: string;
  };
};

export default function RegisterClienteForm({ lang, labels }: Props) {
  const bound = registerCliente.bind(null, lang);
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    bound,
    {}
  );

  return (
    <form action={formAction} className="mt-10 space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-ink">
            {labels.firstName}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            className="h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-ink">
            {labels.lastName}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            className="h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
          {labels.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-ink">
          {labels.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      {state?.ok ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.needsConfirmation ? labels.needsConfirmation : labels.registerOk}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-lg bg-primary-dark text-sm font-medium text-white transition hover:bg-primary disabled:opacity-60"
      >
        {pending ? labels.submitting : labels.submit}
      </button>

      <p className="text-center text-sm text-muted">
        {labels.login}{" "}
        <Link href={`/${lang}/iniciar-sesion`} className="font-medium text-primary hover:underline">
          {labels.loginLink}
        </Link>
      </p>
    </form>
  );
}
