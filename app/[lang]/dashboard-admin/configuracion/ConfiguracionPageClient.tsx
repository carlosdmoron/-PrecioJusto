"use client";

import { useState } from "react";
import { useToast } from "../../../components/admin/Toast";
import AdminSection from "../../../components/admin/AdminSection";
import DataTable from "../../../components/admin/DataTable";
import StatusBadge from "../../../components/admin/StatusBadge";
import Modal from "../../../components/dashboard/Modal";

export default function ConfiguracionPageClient({ data }: { data: any }) {
  const [tab, setTab] = useState<"users" | "roles" | "security" | "integrations">("users");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [users, setUsers] = useState(data.users.items);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [mfa, setMfa] = useState(true);
  const [sessions, setSessions] = useState(true);
  const [passwordPolicy, setPasswordPolicy] = useState(true);
  const [ipControl, setIpControl] = useState(true);
  const toast = useToast();

  function toColumns(obj: Record<string, string>) {
    return Object.entries(obj).map(([key, label]) => ({ key, label }));
  }

  function handleCreateUser() {
    const newUser = {
      id: `ADM-${String(users.length + 1).padStart(3, "0")}`,
      name,
      email,
      role,
      status: "activo",
      lastLogin: "—",
    };
    setUsers([...users, newUser]);
    toast.show(data.users.modal.created);
    setName("");
    setEmail("");
    setRole("");
    setShowCreateUser(false);
  }

  const securityToggles = [
    { key: "mfa", value: mfa, toggle: () => setMfa(!mfa) },
    { key: "sessions", value: sessions, toggle: () => setSessions(!sessions) },
    { key: "passwordPolicy", value: passwordPolicy, toggle: () => setPasswordPolicy(!passwordPolicy) },
    { key: "ipControl", value: ipControl, toggle: () => setIpControl(!ipControl) },
  ];

  return (
    <AdminSection title={data.title} subtitle={data.subtitle} description={data.description}>
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
              <button type="button" onClick={() => setShowCreateUser(true)} className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark">{data.users.modal.create}</button>
            </div>
            <DataTable
              columns={toColumns(data.users.table)}
              rows={users.map((i: any) => ({ ...i, status: <StatusBadge status={i.status} /> }))}
              actions={[{ label: data.actions.edit, onClick: () => toast.show("Editando usuario") }]}
            />
          </>
        )}
        {tab === "roles" && (
          <DataTable
            columns={toColumns(data.roles.table)}
            rows={data.roles.items.map((i: any, idx: number) => ({ ...i, id: String(idx) }))}
            actions={[{ label: data.actions.edit, onClick: () => toast.show("Editando...") }]}
          />
        )}
        {tab === "security" && (
          <div className="space-y-4">
            {securityToggles.map(({ key, value, toggle }) => (
              <div key={key} className="flex items-center justify-between rounded-xl border border-line/40 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-ink">{data.security[key]}</p>
                  <p className="text-xs text-muted">{data.security[key + "Description"]}</p>
                </div>
                <button type="button" onClick={toggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${value ? "bg-primary" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${value ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        )}
        {tab === "integrations" && (
          <DataTable
            columns={toColumns(data.integrations.table)}
            rows={data.integrations.items.map((i: any) => ({ ...i, status: <StatusBadge status={i.status} /> }))}
            actions={[{ label: data.actions.edit, onClick: () => toast.show("Editando...") }]}
          />
        )}
      </div>

      <Modal open={showCreateUser} onClose={() => setShowCreateUser(false)} title={data.users.modal.title} closeLabel={data.users.modal.cancel}>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">{data.users.modal.name}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={data.users.modal.namePh} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.users.modal.email}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={data.users.modal.emailPh} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">{data.users.modal.role}</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 h-10 w-full rounded-lg bg-field px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-primary/40">
              <option value="">{data.users.modal.rolePlaceholder}</option>
              {data.roles.items.map((r: any) => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleCreateUser} className="h-10 flex-1 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark">{data.users.modal.create}</button>
            <button type="button" onClick={() => setShowCreateUser(false)} className="h-10 flex-1 rounded-lg border border-line/60 text-sm font-medium text-steel transition hover:text-ink">{data.users.modal.cancel}</button>
          </div>
        </div>
      </Modal>
    </AdminSection>
  );
}
