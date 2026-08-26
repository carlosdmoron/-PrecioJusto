"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";
import { useToast } from "../../../components/admin/Toast";
import type { TableRow } from "../../../components/admin/DataTable";

export default function FormulariosPageClient({ data }: { data: any }) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedForm, setSelectedForm] = useState<TableRow | null>(null);
  const [serviceId, setServiceId] = useState("");

  const columns = [
    { key: "id", label: data.table.id },
    { key: "service", label: data.table.service },
    { key: "version", label: data.table.version },
    { key: "questions", label: data.table.questions },
    { key: "abandonment", label: data.table.abandonment },
    {
      key: "status",
      label: data.table.status,
      render: (row: any) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        description={data.description}
        actions={
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {data.create}
          </button>
        }
      >
        <DataTable
          columns={columns}
          rows={data.items.map((i: any) => ({ ...i }))}
          actions={[
            {
              label: data.actions.edit,
              onClick: (row) => {
                setSelectedForm(row);
                setShowBuilder(true);
              },
            },
            {
              label: data.actions.preview,
              onClick: () => {
                toast.show("Vista previa");
              },
            },
            {
              label: data.actions.duplicate,
              onClick: () => {
                toast.show("Formulario duplicado");
              },
            },
          ]}
        />
      </AdminSection>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={data.create}
        closeLabel={data.modal.cancel}
      >
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">
              {data.modal.service}
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">{data.modal.servicePlaceholder}</option>
              {data.categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setShowBuilder(true);
                toast.show("Formulario creado");
              }}
              className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              {data.modal.save}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink"
            >
              {data.modal.cancel}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showBuilder}
        onClose={() => setShowBuilder(false)}
        title={data.builder.title}
        closeLabel={data.modal.cancel}
      >
        <div className="mt-4 space-y-3">
          {data.builder.questions.map((q: any) => (
            <div
              key={q.id}
              className="rounded-lg border border-line/30 bg-surface p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{q.label}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {data.builder.questionTypes[q.type]}
                    {q.required && (
                      <span className="ml-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        {data.builder.required}
                      </span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-faint">⋮⋮</span>
              </div>
              {q.options && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {q.options.map((opt: string) => (
                    <span
                      key={opt}
                      className="rounded-full bg-chip-blue px-2 py-0.5 text-xs text-primary-dark"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className="w-full rounded-lg border border-dashed border-line/60 py-3 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-primary-dark"
          >
            + {data.builder.addQuestion}
          </button>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowBuilder(false)}
              className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              {data.builder.save}
            </button>
            <button
              type="button"
              onClick={() => setShowBuilder(false)}
              className="h-10 flex-1 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {data.builder.publish}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
