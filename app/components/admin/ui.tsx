import type { ReactNode } from "react";

/* ── Card ─────────────────────────────────────────────────────────── */

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-pj-border bg-white shadow-pj-card ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-pj-border px-5 py-4">
      <div>
        <h3 className="text-base font-semibold text-pj-ink">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-pj-steel">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ── Button ───────────────────────────────────────────────────────── */

const buttonVariants = {
  primary:
    "bg-pj-primary text-white hover:bg-pj-primary-hover shadow-sm shadow-pj-primary/25",
  secondary:
    "border border-pj-border bg-white text-slate-700 hover:bg-pj-bg",
  danger: "bg-pj-danger text-white hover:bg-red-700 shadow-sm shadow-pj-danger/25",
  ghost: "text-pj-steel hover:bg-pj-bg hover:text-pj-ink",
} as const;

export function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all duration-150 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${buttonVariants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Badges / status ──────────────────────────────────────────────── */

const badgeVariants = {
  success: "bg-pj-success-bg text-pj-success",
  warning: "bg-pj-warning-bg text-pj-warning",
  danger: "bg-pj-danger-bg text-pj-danger",
  info: "bg-pj-info-bg text-pj-info",
  neutral: "bg-pj-neutral-bg text-pj-steel",
} as const;

export type BadgeVariant = keyof typeof badgeVariants;

export function Badge({
  children,
  variant = "neutral",
  dot = false,
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${badgeVariants[variant]} ${className}`}
    >
      {dot ? (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}

const STATUS_MAP: Record<string, BadgeVariant> = {
  activo: "success",
  active: "success",
  published: "success",
  publicado: "success",
  pagado: "success",
  pagada: "success",
  completado: "success",
  completada: "success",
  completed: "success",
  aceptado: "success",
  resuelto: "success",
  pending: "warning",
  pendiente: "warning",
  waiting: "warning",
  en_progreso: "info",
  in_progress: "info",
  programado: "info",
  scheduled: "info",
  draft: "neutral",
  borrador: "neutral",
  inactivo: "neutral",
  inactive: "neutral",
  paused: "neutral",
  pausado: "neutral",
  suspended: "warning",
  suspendido: "warning",
  blocked: "danger",
  bloqueado: "danger",
  banned: "danger",
  coming_soon: "info",
  proximamente: "info",
  cancelado: "danger",
  cancelled: "danger",
  rejected: "danger",
  rechazado: "danger",
  vencido: "danger",
  archived: "neutral",
  archivado: "neutral",
  selected: "info",
  seleccionado: "info",
  started: "info",
  iniciado: "info",
  inProgress: "info",
  en_curso: "info",
  Iniciado: "info",
  disputed: "danger",
  disputado: "danger",
};

export function statusToVariant(status: string | null | undefined): BadgeVariant {
  if (!status) return "neutral";
  return STATUS_MAP[status.toLowerCase()] ?? "neutral";
}

export function StatusBadge({ status, label }: { status: string | null | undefined; label?: string }) {
  if (!status) return null;
  const text = label ?? (status.charAt(0).toUpperCase() + status.slice(1));
  return (
    <Badge variant={statusToVariant(status)} dot>
      {text}
    </Badge>
  );
}

/* ── Empty state ──────────────────────────────────────────────────── */

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {icon ? <div className="text-pj-faint">{icon}</div> : null}
      <p className="text-sm font-semibold text-pj-ink">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs leading-relaxed text-pj-steel">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────── */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-pj-neutral-bg ${className}`}
      aria-hidden="true"
    />
  );
}

/* ── Sparkline (SVG puro, sin dependencias) ───────────────────────── */

export function Sparkline({
  points,
  width = 120,
  height = 36,
  color = "#2563EB",
  className = "",
}: {
  points: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - 3 - ((p - min) / range) * (height - 6);
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  const gid = `pj-spark-${color.replace("#", "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[coords.length - 1][0]}
        cy={coords[coords.length - 1][1]}
        r="2.2"
        fill={color}
      />
    </svg>
  );
}
