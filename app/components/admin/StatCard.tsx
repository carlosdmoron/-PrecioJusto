export type StatCardData = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
};

export default function StatCard({ label, value, change, trend }: StatCardData) {
  const isPositive = trend === "up";
  return (
    <div className="rounded-xl border border-line/40 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-figtree)] text-2xl font-bold tracking-tight text-ink">{value}</p>
      <p className={`mt-1 text-xs font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
        {change} {isPositive ? "↑" : "↓"}
      </p>
    </div>
  );
}
