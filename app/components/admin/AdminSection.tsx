import type { ReactNode } from "react";

export default function AdminSection({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-10 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </header>
      <div className="mt-8">{children}</div>
    </div>
  );
}
