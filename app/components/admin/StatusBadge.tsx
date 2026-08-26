const colorMap: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  published: "bg-emerald-50 text-emerald-700",
  approved: "bg-emerald-50 text-emerald-700",
  completed: "bg-emerald-50 text-emerald-700",
  resolved: "bg-emerald-50 text-emerald-700",
  conectado: "bg-emerald-50 text-emerald-700",
  open: "bg-blue-50 text-blue-700",
  new: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  review: "bg-amber-50 text-amber-700",
  draft: "bg-gray-100 text-gray-600",
  inactive: "bg-gray-100 text-gray-600",
  paused: "bg-gray-100 text-gray-600",
  archived: "bg-gray-100 text-gray-600",
  suspended: "bg-red-50 text-red-700",
  blocked: "bg-red-50 text-red-700",
  rejected: "bg-red-50 text-red-700",
  removed: "bg-red-50 text-red-700",
  cancelled: "bg-red-50 text-red-700",
  disputed: "bg-red-50 text-red-700",
  flagged: "bg-orange-50 text-orange-700",
  hidden: "bg-orange-50 text-orange-700",
  inProgress: "bg-blue-50 text-blue-700",
  "en progreso": "bg-blue-50 text-blue-700",
  "en curso": "bg-blue-50 text-blue-700",
  sent: "bg-blue-50 text-blue-700",
  enviada: "bg-blue-50 text-blue-700",
  enviado: "bg-blue-50 text-blue-700",
  activa: "bg-emerald-50 text-emerald-700",
  activo: "bg-emerald-50 text-emerald-700",
  publicada: "bg-emerald-50 text-emerald-700",
  low: "bg-gray-100 text-gray-600",
  media: "bg-amber-50 text-amber-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  alta: "bg-orange-50 text-orange-700",
  urgent: "bg-red-50 text-red-700",
  urgente: "bg-red-50 text-red-700",
  "Lo antes posible": "bg-red-50 text-red-700",
  asap: "bg-red-50 text-red-700",
  week: "bg-amber-50 text-amber-700",
  month: "bg-blue-50 text-blue-700",
  none: "bg-gray-100 text-gray-600",
  selected: "bg-emerald-50 text-emerald-700",
  seleccionado: "bg-emerald-50 text-emerald-700",
  started: "bg-blue-50 text-blue-700",
  iniciado: "bg-blue-50 text-blue-700",
  waiting: "bg-amber-50 text-amber-700",
  closed: "bg-gray-100 text-gray-600",
  cerrada: "bg-gray-100 text-gray-600",
  cerrado: "bg-gray-100 text-gray-600",
  searched: "bg-blue-50 text-blue-700",
  offline: "bg-red-50 text-red-700",
  disconnected: "bg-red-50 text-red-700",
  programada: "bg-amber-50 text-amber-700",
};

function normalize(s: string) {
  return s.toLowerCase().trim();
}

export default function StatusBadge({ status }: { status: string }) {
  const key = normalize(status);
  const color = colorMap[key] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${color}`}>
      {status}
    </span>
  );
}
