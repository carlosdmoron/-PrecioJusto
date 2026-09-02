import type { MatchingRuleRow } from "../actions/admin";

export type MatchingCandidate = {
  id: string;
  name: string;
  services: string[];
  zone: string;
  rating: number;
  verified: string;
  jobs: number;
  availability: boolean;
  score: number;
  passed: boolean;
  reasons: string[];
  excludedReasons: string[];
};

// Peso por criterio para el scoring (0-100)
const WEIGHTS: Record<string, number> = {
  service: 40,
  zone: 30,
  availability: 15,
  capacity: 10,
  quality: 5,
};

type CandidateInput = {
  id: string;
  name: string;
  services: string[];
  province?: string | null;
  municipality?: string | null;
  rating: number;
  verification_status: string;
  total_jobs_completed: number;
  available?: boolean;
  contacts_this_month?: number;
};

// Devuelve "excluido" (0) o acumula score según la regla. El objetivo es
// replicar el comportamiento de ProntoPro: filtrado + scoring ponderado.
export function runMatching(
  candidates: CandidateInput[],
  rules: MatchingRuleRow[],
  opts: { serviceName?: string; zone?: string; limit?: number }
): MatchingCandidate[] {
  const activeRules = (rules ?? []).filter((r) => r.status === "active");
  const zone = (opts.zone ?? "").trim().toLowerCase();
  const serviceName = (opts.serviceName ?? "").trim().toLowerCase();
  const limit = opts.limit ?? 5;

  const results = candidates.map((c) => {
    let score = 0;
    const reasons: string[] = [];
    const excludedReasons: string[] = [];

    const serviceMatches =
      c.services.some((s) => s.toLowerCase().includes(serviceName)) ||
      serviceName === "";

    const zoneMatches =
      zone === "" ||
      c.municipality?.toLowerCase().includes(zone) ||
      c.province?.toLowerCase().includes(zone);

    const available = c.available ?? true;
    const capacityOk = (c.contacts_this_month ?? 0) < 20;

    // Criterios base (obligatorios si la regla los pide)
    for (const rule of activeRules) {
      const crit = (rule.criterion ?? "").toLowerCase();
      const weight = WEIGHTS[crit] ?? 10;
      const passed =
        crit.includes("servicio") || crit === "service"
          ? serviceMatches
          : crit.includes("zona") || crit === "zone"
          ? zoneMatches
          : crit.includes("disponibilidad") || crit === "availability"
          ? available
          : crit.includes("capacidad") || crit === "capacity"
          ? capacityOk
          : true; // quality/history → se puntúa, no excluye

      if (passed) {
        score += weight;
        if (!reasons.includes(rule.name)) reasons.push(rule.name);
      } else if (crit.includes("servicio") || crit.includes("zona")) {
        // Servicio y zona son excluyentes si no pasan y están en una regla activa
        excludedReasons.push(
          crit.includes("servicio")
            ? "No ofrece el servicio solicitado"
            : "No cubre la zona"
        );
      }
    }

    // Puntajes por calidad (no excluye)
    if (c.rating >= 4) score += 10;
    if (c.verification_status === "verified") score += 8;
    score += Math.min(c.total_jobs_completed, 10);

    return {
      id: c.id,
      name: c.name,
      services: c.services,
      zone: [c.province, c.municipality].filter(Boolean).join(", ") || "—",
      rating: c.rating,
      verified: c.verification_status,
      jobs: c.total_jobs_completed,
      availability: available,
      score: Math.min(score, 100),
      passed: excludedReasons.length === 0 && serviceMatches,
      reasons,
      excludedReasons,
    };
  });

  const sorted = [...results].sort(
    (a, b) => Number(b.score) - Number(a.score)
  );

  // Los que no pasan se mantienen (para mostrar "excluidos"), pero los
  // incluidos van primero. El límite aplica a los incluidos.
  const included = sorted.filter((r) => r.passed).slice(0, limit);
  const excluded = sorted.filter((r) => !r.passed);
  return [...included, ...excluded];
}
