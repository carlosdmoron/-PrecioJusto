"use client";

import { useState } from "react";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import Modal from "../../../components/dashboard/Modal";

export default function ConfiguracionPageClient({ data }: { data: any }) {
  const [tab, setTab] = useState<"users" | "roles" | "security" | "integrations">("users");
  const [showCreateUser, setShowCreateUser] = useState(false);

  function toColumns(obj: Record<string, string>) {
    return Object.entries(obj).map(([key, label]) => ({ key, label }));
  }

  return (
    <AdminSection title={data.title} subtitle={data.subtitle}>
      <div className="flex gap-1 rounded-lg bg-surface p-1">
        {(["users", "roles", "security", "integrations"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {data.tabs[t]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "users" && (
          <>
            <div className="mb-4 flex justify-end">
              <button type="button" onClick={() => setShowCreateUser(true)} className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark">Crear usuario</button>
            </div>
            <DataTable
              columns={toColumns(data.users.table)}
              rows={data.users.items.map((i: any) => ({ ...i }))}
              actions={[{ label: "Editar", onClick: () => {} }]}
            />
          </>
        )}
        {tab === "roles" && (
          <DataTable
            columns={toColumns(data.roles.table)}
            rows={data.roles.items.map((i: any, idx: number) => ({ ...i, id: String(idx) }))}
            actions={[{ label: "Editar permisos", onClick: () => {} }]}
          />
        )}
        {tab === "security" && (
          <div className="space-y-4">
            {Object.entries(data.security).filter(([k]) => !k.endsWith("Description")).map(([key]) => (
              <div key={key} className="flex items-center justify-between rounded-xl border border-line/40 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-ink">{data.security[key]}</p>
                  <p className="text-xs text-muted">{data.security[key + "Description"]}</p>
                </div>
                <button type="button" className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition">
                  <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === "integrations" && (
          <DataTable
            columns={toColumns(data.integrations.table)}
            rows={data.integrations.items.map((i: any) => ({ ...i }))}
            actions={[{ label: "Configurar", onClick: () => {} }]}
          />
        )}
      </div>

      <Modal open={showCreateUser} onClose={() => setShowCreateUser(false)} title="Crear usuario administrador" closeLabel="Cancelar">
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">Nombre</label>
            <input className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Email</label>
            <input type="email" className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Rol</label>
            <select className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              {data.roles.items.map((r: any) => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateUser(false)} className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">Crear</button>
            <button type="button" onClick={() => setShowCreateUser(false)} className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">Cancelar</button>
          </div>
        </div>
      </Modal>
    </AdminSection>
  );
}
