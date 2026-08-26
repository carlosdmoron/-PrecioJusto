"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatCard from "../../../components/admin/StatCard";
import Modal from "../../../components/dashboard/Modal";

export default function FacturacionPageClient({ data }: { data: any }) {
  const [showConfig, setShowConfig] = useState(false);

  const columns = [
    { key: "id", label: data.table.id },
    { key: "professional", label: data.table.professional },
    { key: "type", label: data.table.type },
    { key: "amount", label: data.table.amount },
    { key: "description", label: data.table.description },
    { key: "date", label: data.table.date },
  ];

  return (
    <>
      <AdminSection
        title={data.title}
        subtitle={data.subtitle}
        actions={
          <>
            <button type="button" onClick={() => setShowConfig(true)} className="h-10 rounded-lg border border-line/60 px-5 text-sm font-medium text-steel transition hover:text-ink">Configurar</button>
            <button type="button" className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark">{data.actions.export}</button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={data.balance.total} value={data.balance.amount} change="" trend="up" />
          <StatCard label={data.balance.monthIncome} value={data.balance.monthAmount} change="" trend="up" />
          <StatCard label={data.balance.pendingCommission} value={data.balance.pendingAmount} change="" trend="up" />
        </div>
        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={data.items.map((i: any) => ({ ...i }))}
            actions={[
              { label: data.actions.invoice, onClick: () => {} },
              { label: data.actions.refund, onClick: () => {} },
            ]}
          />
        </div>
      </AdminSection>

      <Modal open={showConfig} onClose={() => setShowConfig(false)} title="Configuración de facturación" closeLabel="Cerrar">
        <div className="mt-4 space-y-4">
          {Object.entries(data.config).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs font-medium text-muted">{String(label)}</label>
              <input className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowConfig(false)} className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">Guardar</button>
            <button type="button" onClick={() => setShowConfig(false)} className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">Cancelar</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
