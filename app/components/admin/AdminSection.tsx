import type { ReactNode } from "react";

export default function AdminSection({
  title,
  subtitle,
  description,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-pj-ink">{title}</h1>
          <p className="mt-1 text-sm text-pj-steel">{subtitle}</p>
          {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-pj-steel">{description}</p>}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </header>
      <div className="mt-6">{children}</div>
    </div>
  );
}
