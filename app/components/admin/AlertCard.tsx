import { AlertTriangle, Info, OctagonAlert } from "lucide-react";

const toneClasses: Record<string, string> = {
  warning: "bg-pj-warning-bg text-pj-warning",
  danger: "bg-pj-danger-bg text-pj-danger",
  info: "bg-pj-info-bg text-pj-info",
};

const toneIcons: Record<string, React.ReactNode> = {
  warning: <AlertTriangle size={18} strokeWidth={2} />,
  danger: <OctagonAlert size={18} strokeWidth={2} />,
  info: <Info size={18} strokeWidth={2} />,
};

export type AlertCardData = {
  type: "warning" | "danger" | "info";
  title: string;
  description: string;
};

export default function AlertCard({ type, title, description }: AlertCardData) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-pj-border bg-white p-4 shadow-pj-card transition-all duration-150 hover:shadow-pj-pop">
      <span
        className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${toneClasses[type]}`}
      >
        {toneIcons[type]}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-pj-ink">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-pj-steel">{description}</p>
      </div>
    </div>
  );
}
