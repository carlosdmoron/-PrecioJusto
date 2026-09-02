"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { sweetSuccess, sweetError, sweetConfirmDelete } from "../../../components/admin/sweetAlert";
import {
  toggleMatchingRule,
  createMatchingRule,
  updateMatchingRule,
  deleteMatchingRule,
  duplicateMatchingRule,
} from "../../../actions/admin";
import { runMatching } from "../../../lib/matching";

export default function MatchingPageClient({ data }: { data: any }) {
  const router = useRouter();
  const [showSimulator, setShowSimulator] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [items, setItems] = useState(
    (data.items ?? []).map((i: any) => ({
      id: i.id,
      name: i.name,
      criterion: i.criterion,
      priority: String(i.priority ?? ""),
      professionals: i.professionals_count ?? 0,
      status: i.status ?? "active",
    }))
  );

  useEffect(() => {
    const mapItems = (rows: any[]) =>
      (rows ?? []).map((i: any) => ({
        id: i.id,
        name: i.name,
        criterion: i.criterion,
        priority: String(i.priority ?? ""),
        professionals: i.professionals_count ?? 0,
        status: i.status ?? "active",
      }));
    setItems((prev: any[]) => {
      const next = mapItems(data.items);
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      return next;
    });
  }, [data.items]);

  const [simService, setSimService] = useState("");
  const [simZone, setSimZone] = useState("");
  const services = data.services ?? [];
  const candidates = data.candidates ?? [];

  // El simulador ejecuta el motor real de matching sobre los profesionales cargados
  const simResults = useMemo(() => {
    const service = services.find((s: any) => s.id === simService);
    return runMatching(candidates, data.items ?? [], {
      serviceName: simService ? (service?.name ?? simService) : "",
      zone: simZone,
      limit: 5,
    });
  }, [simService, simZone, services, candidates, data.items]);

  const [ruleName, setRuleName] = useState("");
  const [ruleCriterion, setRuleCriterion] = useState("");
  const [ruleZone, setRuleZone] = useState("");
  const [rulePriority, setRulePriority] = useState("");
  const [editingRule, setEditingRule] = useState<any | null>(null);

  const openEdit = (row: any) => {
    setEditingRule(row);
    setRuleName(row.name ?? "");
    setRuleCriterion(row.criterion ?? "");
    setRuleZone(row.zone ?? "");
    setRulePriority(row.priority ?? "");
    setShowCreate(true);
  };

  const resetForm = () => {
    setEditingRule(null);
    setRuleName("");
    setRuleCriterion("");
    setRuleZone("");
    setRulePriority("");
  };

  const columns = [
    { key: "id", label: data.table.id },
    { key: "name", label: data.table.name },
    { key: "criterion", label: data.table.criterion },
    { key: "priority", label: data.table.priority },
    { key: "professionals", label: data.table.professionals },
    { key: "status", label: data.table.status, render: (row: any) => <StatusBadge status={row.status} /> },
  ];

  async function handleCreate() {
    if (!ruleName.trim()) return;
    try {
      const payload = {
        name: ruleName,
        criterion: ruleCriterion || "zone",
        zone_postal_code: ruleZone,
        priority: Number(rulePriority) || 1,
      };
      if (editingRule) {
        await updateMatchingRule(String(editingRule.id), payload);
        setItems((prev: any[]) =>
          prev.map((i: any) =>
            i.id === editingRule.id
              ? {
                  ...i,
                  name: payload.name,
                  criterion: payload.criterion,
                  priority: String(payload.priority),
                  zone: ruleZone,
                }
              : i
          )
        );
        await sweetSuccess(data.feedback.updated, data.feedback.verified);
      } else {
        await createMatchingRule(payload);
        const newItem = {
          id: String(Date.now()),
          name: ruleName,
          criterion: ruleCriterion || "zone",
          priority: rulePriority || "1",
          professionals: "0",
          status: "active",
        };
        setItems((prev: any[]) => [...prev, newItem]);
        await sweetSuccess(data.feedback.ruleCreated, data.feedback.verified);
      }
      resetForm();
      setShowCreate(false);
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.createVerifyError);
    }
  }

  async function handleToggle(row: any) {
    const next = row.status === "active" ? "inactive" : "active";
    try {
      await toggleMatchingRule(String(row.id), next);
      setItems((prev: any[]) =>
        prev.map((i: any) =>
          i.id === row.id ? { ...i, status: next } : i
        )
      );
      await sweetSuccess(
        next === "active" ? data.feedback.ruleActivated : data.feedback.ruleDeactivated,
        data.feedback.verified
      );
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    }
  }

  async function handleDuplicate(row: any) {
    try {
      await duplicateMatchingRule(String(row.id));
      await sweetSuccess(data.feedback.ruleDuplicated ?? "Regla duplicada", data.feedback.verified);
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    }
  }

  async function handleDelete(row: any) {
    const confirmed = await sweetConfirmDelete(
      data.feedback.confirmDeleteTitle,
      data.feedback.confirmDeleteText,
      data.feedback.confirmYes,
      data.feedback.confirmCancel
    );
    if (!confirmed) return;
    try {
      await deleteMatchingRule(String(row.id));
      setItems((prev: any[]) => prev.filter((i: any) => i.id !== row.id));
      await sweetSuccess(data.feedback.deleted, data.feedback.verified);
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.deleteVerifyError);
    }
  }

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
        actions={
          <>
            <button type="button" onClick={() => setShowSimulator(true)} className="h-10 rounded-lg border border-line/60 px-5 text-sm font-medium text-steel transition hover:text-ink">{data.simulate}</button>
            <button type="button" onClick={() => setShowCreate(true)} className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark">{data.create}</button>
          </>
        }
      >
        <DataTable
          columns={columns}
          rows={items}
          actions={[
            { label: data.actions.edit, onClick: (row: any) => openEdit(row) },
            { label: data.actions.duplicate, onClick: (row: any) => handleDuplicate(row) },
            {
              label: data.actions.toggle,
              onClick: (row: any) => handleToggle(row),
            },
            { label: data.actions.delete, onClick: (row: any) => handleDelete(row) },
          ]}
        />
      </AdminSection>

      <Modal open={showSimulator} onClose={() => setShowSimulator(false)} title={data.simulator.title} closeLabel={data.feedback.close}>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">{data.simulator.serviceLabel}</label>
            <select value={simService} onChange={(e) => setSimService(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">—</option>
              {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.simulator.zoneLabel}</label>
            <input value={simZone} onChange={(e) => setSimZone(e.target.value)} placeholder="Ej: Madrid, Sevilla, 28001..." className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted">
              {data.simulator.results} ({candidates.length} profesionales evaluados)
            </p>
            <div className="mt-2 space-y-2">
              {simResults.length === 0 && (
                <p className="rounded-lg bg-surface p-3 text-xs text-muted">
                  No hay suficientes datos de profesionales/servicios cargados en la plataforma.
                </p>
              )}
              {simResults.map((r: any, i: number) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-surface p-3">
                  <span className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold ${r.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {r.passed ? "Incluido" : "Excluido"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{r.name}</p>
                    <p className="text-xs text-muted">
                      {r.excludedReasons.length > 0
                        ? r.excludedReasons.join(", ")
                        : r.reasons.join(", ") || r.services.slice(0, 3).join(", ") || "—"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primary">{r.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title={editingRule ? data.actions.edit : data.createModal.title} closeLabel={data.createModal.cancel}>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">{data.createModal.name}</label>
            <input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder={data.createModal.namePh} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.createModal.criterion}</label>
            <select value={ruleCriterion} onChange={(e) => setRuleCriterion(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">{data.createModal.criterionPlaceholder}</option>
              {Object.entries(data.criterions).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.createModal.zone}</label>
            <input value={ruleZone} onChange={(e) => setRuleZone(e.target.value)} placeholder={data.createModal.zonePh} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.createModal.priority}</label>
            <select value={rulePriority} onChange={(e) => setRulePriority(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">{data.createModal.priorityPlaceholder}</option>
              {Object.entries(data.createModal.priorities).map(([k, v]) => <option key={k} value={k}>{String(v)}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleCreate} className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">{editingRule ? data.actions.edit : data.createModal.create}</button>
            <button type="button" onClick={() => { setShowCreate(false); resetForm(); }} className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">{data.createModal.cancel}</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
