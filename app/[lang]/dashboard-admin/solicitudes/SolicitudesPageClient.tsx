"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import FilterBar from "../../../components/admin/FilterBar";
import Modal from "../../../components/dashboard/Modal";
import { sweetSuccess, sweetError } from "../../../components/admin/sweetAlert";
import type { TableRow } from "../../../components/admin/DataTable";
import type { FilterField } from "../../../components/admin/FilterBar";
import {
  getRequestDetails,
  setRequestStatus,
  updateRequest,
  listServices,
} from "../../../actions/admin";

export default function SolicitudesPageClient({ data }: { data: any }) {
  const router = useRouter();
  const [items, setItems] = useState(data.items ?? []);

  const filterFields: FilterField[] = data.filters.fields;
  const [filtered, setFiltered] = useState<Record<string, string> | null>(null);
  const [filterKey, setFilterKey] = useState(0);

  function applyFilters(values: Record<string, string>) {
    setFiltered(values);
    setFilterKey((k) => k + 1);
  }

  const visibleItems = filtered
    ? items.filter((item: any) =>
        filterFields.every((field) => {
          const v = (filtered[field.key] ?? "").trim().toLowerCase();
          if (!v) return true;
          let cell = String(item[field.key] ?? "").toLowerCase();
          if (field.key === "client") {
            cell = `${cell} ${(item.clientEmail ?? "").toLowerCase()}`;
          }
          if (field.type === "select") return cell === v;
          return cell.includes(v);
        })
      )
    : items;

  const columns = [
    { key: "code", label: data.table.id },
    { key: "service", label: data.table.service },
    { key: "client", label: data.table.client },
    { key: "city", label: data.table.city },
    {
      key: "status",
      label: data.table.status,
      render: (row: any) => (
        <StatusBadge status={row.status} label={data.statuses[row.status] ?? row.status} />
      ),
    },
    { key: "urgency", label: data.table.urgency },
    { key: "quotes", label: data.table.quotes },
    { key: "date", label: data.table.date },
  ];

  // ==== Detalle ====
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function openDetail(row: TableRow) {
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await getRequestDetails(String(row.id));
      setDetail(d);
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", "No se pudo cargar el detalle");
    } finally {
      setDetailLoading(false);
    }
  }

  // ==== Editar ====
  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<TableRow | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    service_id: "",
    description: "",
    city: "",
    urgency: "",
  });

  async function openEdit(row: TableRow) {
    setEditTarget(row);
    try {
      const [d, svc] = await Promise.all([
        getRequestDetails(String(row.id)),
        listServices().catch(() => []),
      ]);
      setServices(svc);
      setForm({
        service_id: d?.service_id ?? "",
        description: d?.description ?? "",
        city: d?.city ?? "",
        urgency: d?.urgency ?? "",
      });
      setShowEdit(true);
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", "No se pudo cargar la solicitud");
    }
  }

  async function handleSaveEdit() {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateRequest(String(editTarget.id), {
        service_id: form.service_id || undefined,
        description: form.description,
        city: form.city || undefined,
        urgency: form.urgency || undefined,
      });
      setItems((prev: any[]) =>
        prev.map((i: any) =>
          i.id === editTarget.id
            ? {
                ...i,
                service:
                  services.find((s) => s.id === form.service_id)?.name ?? i.service,
                city: form.city || i.city,
                urgency: form.urgency || i.urgency,
              }
            : i
        )
      );
      setShowEdit(false);
      setEditTarget(null);
      await sweetSuccess(data.feedback.requestUpdated, data.feedback.verified);
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    } finally {
      setSaving(false);
    }
  }

  // ==== Pausar / Reanudar ====
  async function handleTogglePause(row: TableRow) {
    const isPaused = row.status === "paused";
    const next = isPaused ? "published" : "paused";
    try {
      await setRequestStatus(String(row.id), next);
      setItems((prev: any[]) =>
        prev.map((i: any) => (i.id === row.id ? { ...i, status: next } : i))
      );
      if (detail && detail.id === row.id) setDetail({ ...detail, status: next });
      await sweetSuccess(
        isPaused ? data.feedback.requestResumed : data.feedback.requestPaused,
        data.feedback.verified
      );
      router.refresh();
    } catch (e: any) {
      await sweetError(e?.message ?? "Error", data.feedback.verifyError);
    }
  }

  // ==== Acciones de la tabla ====
  const tableActions: {
    label: string | ((row: TableRow) => string);
    onClick: (row: TableRow) => void;
  }[] = [
    { label: data.actions.edit, onClick: openEdit },
    {
      label: (row) =>
        row.status === "paused" ? data.actions.resume : data.actions.pause,
      onClick: handleTogglePause,
    },
    { label: data.actions.detail, onClick: openDetail },
  ];

  function urgencyLabel(u: string) {
    return data.urgency?.[u] ?? u ?? "—";
  }

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
      >
        <div className="mb-6 rounded-xl border border-pj-border bg-white p-4 shadow-pj-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-pj-faint">
            {data.howItWorks.title}
          </p>
          <ul className="mt-2 grid gap-2 text-sm text-pj-steel md:grid-cols-3">
            <li className="rounded-lg bg-pj-bg px-3 py-2">
              <span className="font-semibold text-pj-ink">{data.actions.detail}: </span>
              {data.howItWorks.detail}
            </li>
            <li className="rounded-lg bg-pj-bg px-3 py-2">
              <span className="font-semibold text-pj-ink">{data.actions.edit}: </span>
              {data.howItWorks.edit}
            </li>
            <li className="rounded-lg bg-pj-bg px-3 py-2">
              <span className="font-semibold text-pj-ink">
                {data.actions.pause} / {data.actions.resume}:{" "}
              </span>
              {data.howItWorks.pause}
            </li>
          </ul>
        </div>
        <div className="mb-6">
          <FilterBar
            fields={filterFields}
            labels={data.filters.labels}
            onApply={applyFilters}
          />
        </div>
        <DataTable
          key={filterKey}
          columns={columns}
          rows={visibleItems}
          actions={tableActions}
        />
      </AdminSection>

      {/* Panel de detalle */}
      <Modal
        open={!!detail || detailLoading}
        onClose={() => {
          setDetail(null);
          setDetailLoading(false);
        }}
        title={data.detail.title}
        closeLabel={data.detail.close}
        wide
      >
        <div className="mt-4 space-y-6">
          {detailLoading && (
            <p className="text-sm text-pj-steel">
              {data.feedback.openingReport ?? "Cargando..."}
            </p>
          )}

          {detail && (
            <>
              {/* Cabecera */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-pj-faint">{detail.code}</p>
                  <h3 className="text-base font-semibold text-pj-ink">{detail.title}</h3>
                </div>
                <StatusBadge
                  status={detail.status}
                  label={data.statuses[detail.status] ?? detail.status}
                />
              </div>

              {/* Datos básicos */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-pj-bg p-3">
                  <p className="text-xs text-pj-faint">{data.detail.service}</p>
                  <p className="text-sm font-semibold text-pj-ink">{detail.service}</p>
                </div>
                <div className="rounded-lg bg-pj-bg p-3">
                  <p className="text-xs text-pj-faint">{data.detail.city}</p>
                  <p className="text-sm font-semibold text-pj-ink">{detail.city || "—"}</p>
                </div>
                <div className="rounded-lg bg-pj-bg p-3">
                  <p className="text-xs text-pj-faint">{data.detail.budget}</p>
                  <p className="text-sm font-semibold text-pj-ink">{detail.budget || "—"}</p>
                </div>
                <div className="rounded-lg bg-pj-bg p-3">
                  <p className="text-xs text-pj-faint">{data.detail.urgency}</p>
                  <p className="text-sm font-semibold text-pj-ink">
                    {urgencyLabel(detail.urgency)}
                  </p>
                </div>
                <div className="rounded-lg bg-pj-bg p-3">
                  <p className="text-xs text-pj-faint">{data.detail.creationDate}</p>
                  <p className="text-sm font-semibold text-pj-ink">{detail.created_at || "—"}</p>
                </div>
                <div className="rounded-lg bg-pj-bg p-3">
                  <p className="text-xs text-pj-faint">{data.detail.updatedDate}</p>
                  <p className="text-sm font-semibold text-pj-ink">{detail.updated_at || "—"}</p>
                </div>
              </div>

              {/* Descripción */}
              {detail.description && (
                <div>
                  <p className="text-xs font-semibold text-pj-faint">
                    {data.detail.description}
                  </p>
                  <p className="mt-1 rounded-lg bg-pj-bg p-3 text-sm text-pj-ink">
                    {detail.description}
                  </p>
                </div>
              )}

              {/* Datos del cliente */}
              <div>
                <p className="text-xs font-semibold text-pj-faint">
                  {data.detail.clientInfo}
                </p>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-pj-bg p-3">
                    <p className="text-xs text-pj-faint">{data.detail.client}</p>
                    <p className="text-sm font-semibold text-pj-ink">{detail.client.name}</p>
                  </div>
                  <div className="rounded-lg bg-pj-bg p-3">
                    <p className="text-xs text-pj-faint">{data.detail.contactEmail}</p>
                    <p className="text-sm font-semibold text-pj-ink">{detail.client.email}</p>
                  </div>
                </div>
              </div>

              {/* Respuestas del formulario */}
              <div>
                <p className="text-xs font-semibold text-pj-faint">{data.detail.answers}</p>
                {detail.answers.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {detail.answers.map((a: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between gap-4 rounded-lg bg-pj-bg px-3 py-2"
                      >
                        <span className="text-xs text-pj-steel">{a.question}</span>
                        <span className="text-xs font-medium text-pj-ink">{a.answer}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-pj-faint">{data.detail.noAnswers}</p>
                )}
              </div>

              {/* Presupuestos recibidos */}
              <div>
                <p className="text-xs font-semibold text-pj-faint">
                  {data.detail.quotesList}
                </p>
                {detail.quotes.length > 0 ? (
                  <div className="mt-2 overflow-x-auto rounded-lg border border-pj-border">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-pj-border bg-pj-bg">
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-pj-faint">
                            {data.detail.professionals}
                          </th>
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-pj-faint">
                            {data.detail.budget}
                          </th>
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-pj-faint">
                            {data.detail.status}
                          </th>
                          <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-pj-faint">
                            {data.table.date}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.quotes.map((q: any) => (
                          <tr
                            key={q.id}
                            className="border-b border-pj-border/60 last:border-0"
                          >
                            <td className="px-3 py-2 text-pj-ink">{q.professional}</td>
                            <td className="px-3 py-2 text-pj-ink">
                              {q.amount_min && q.amount_max
                                ? `${q.amount_min} – ${q.amount_max}`
                                : q.amount_min || "—"}
                            </td>
                            <td className="px-3 py-2">
                              <StatusBadge status={q.status} />
                            </td>
                            <td className="px-3 py-2 text-pj-steel">{q.created_at || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-pj-faint">{data.detail.noQuotes}</p>
                )}
              </div>

              {/* Historial de cambios */}
              <div>
                <p className="text-xs font-semibold text-pj-faint">{data.detail.history}</p>
                {detail.history.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {detail.history.map((h: any, i: number) => (
                      <div key={i} className="rounded-lg bg-pj-bg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-pj-ink">{h.action}</span>
                          <span className="text-[11px] text-pj-faint">{h.created_at}</span>
                        </div>
                        {h.details && h.details !== "{}" && (
                          <p className="mt-1 text-[11px] text-pj-steel">{h.details}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-pj-faint">{data.detail.noHistory}</p>
                )}
              </div>

              {/* Conversaciones */}
              <div>
                <p className="text-xs font-semibold text-pj-faint">
                  {data.detail.conversations}
                </p>
                {detail.conversations.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {detail.conversations.map((c: any) => (
                      <div
                        key={c.id}
                        className="flex items-start justify-between gap-4 rounded-lg bg-pj-bg px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-pj-ink">
                            {c.last_message || "—"}
                          </p>
                          <p className="text-[11px] text-pj-faint">{c.last_message_at || ""}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-pj-faint">{data.detail.noConversations}</p>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de edición */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title={data.edit.title}
        closeLabel={data.edit.cancel}
      >
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-pj-steel">
              {data.edit.service}
            </label>
            <select
              value={form.service_id}
              onChange={(e) => setForm({ ...form, service_id: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg border border-pj-border bg-white px-3 text-sm text-pj-ink outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">{data.edit.servicePlaceholder}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-pj-steel">
              {data.edit.description}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={data.edit.descriptionPh}
              rows={3}
              className="mt-1 w-full rounded-lg border border-pj-border bg-white px-3 py-2 text-sm text-pj-ink outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-pj-steel">{data.edit.city}</label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder={data.edit.cityPh}
              className="mt-1 h-10 w-full rounded-lg border border-pj-border bg-white px-3 text-sm text-pj-ink outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-pj-steel">
              {data.edit.urgency}
            </label>
            <select
              value={form.urgency}
              onChange={(e) => setForm({ ...form, urgency: e.target.value })}
              className="mt-1 h-10 w-full rounded-lg border border-pj-border bg-white px-3 text-sm text-pj-ink outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">{data.edit.urgencyPlaceholder}</option>
              {Object.entries(data.urgency).map(([k, v]) => (
                <option key={k} value={k}>
                  {String(v)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveEdit}
              className="h-10 flex-1 rounded-lg bg-pj-primary text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {data.edit.save}
            </button>
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="h-10 flex-1 rounded-lg border border-pj-border text-sm font-medium text-pj-steel transition hover:text-pj-ink"
            >
              {data.edit.cancel}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
