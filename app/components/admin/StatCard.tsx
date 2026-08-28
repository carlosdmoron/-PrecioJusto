import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export type StatCardData = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
};

export default function StatCard({ label, value, change, trend }: StatCardData) {
  const isPositive = trend === "up";
  return (
    <div className="rounded-xl border border-pj-border bg-white p-5 shadow-pj-card transition-all duration-150 hover:shadow-pj-pop">
      <p className="text-sm font-medium text-pj-steel">{label}</p>
      <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-pj-ink">
        {value}
      </p>
      <p
        className={`mt-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
          isPositive
            ? "bg-pj-success-bg text-pj-success"
            : "bg-pj-danger-bg text-pj-danger"
        }`}
      >
        {isPositive ? (
          <ArrowUpRight size={12} strokeWidth={2.5} />
        ) : (
          <ArrowDownRight size={12} strokeWidth={2.5} />
        )}
        {change}
      </p>
    </div>
  );
}
