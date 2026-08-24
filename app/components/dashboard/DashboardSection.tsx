import SectionGrid, { type SectionVariant } from "./SectionGrid";

export type DashboardSectionItem = {
  title: string;
  meta: string;
  detail: string;
  cta: string;
};

export default function DashboardSection({
  title,
  subtitle,
  items,
  variant = null,
  form,
  balance,
}: {
  title: string;
  subtitle: string;
  items: DashboardSectionItem[];
  variant?: SectionVariant;
  form?: Record<string, string | string[]>;
  balance?: { label: string; amount: string; action: string };
}) {
  return (
    <div className="mx-auto w-full max-w-[1024px] px-6 py-10 lg:px-10">
      <header>
        <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </header>
      <SectionGrid
        items={items}
        variant={variant}
        form={form ?? {}}
        balance={balance}
      />
    </div>
  );
}
