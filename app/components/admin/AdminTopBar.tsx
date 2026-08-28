"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Bell, CircleHelp, ChevronDown, Settings2, LogOut } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import Modal from "../dashboard/Modal";
import { logout } from "../../actions/auth";
import type { DashboardNavGroup } from "../dashboard/DashboardSidebar";
import type { LogoutLabels } from "../shared/LogoutButton";

export type TopBarTexts = {
  help: string;
  notifications: string;
  notificationsEmpty: string;
  account: string;
  settings: string;
  logout: string;
};

export default function AdminTopBar({
  groups,
  rootLabel,
  helpHref,
  profileHref,
  userName,
  userEmail,
  notifications,
  texts,
  logoutLabels,
  loginHref,
}: {
  groups: DashboardNavGroup[];
  rootLabel: string;
  helpHref: string;
  profileHref: string;
  userName?: string | null;
  userEmail?: string | null;
  notifications: { title: string; time: string }[];
  texts: TopBarTexts;
  logoutLabels: LogoutLabels;
  loginHref: string;
}) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"none" | "bell" | "user">("none");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    const parts = loginHref.split("/").filter(Boolean);
    const locale = parts[0] ?? "es";
    startTransition(async () => {
      await logout(locale);
    });
  }

  const current = groups
    .flatMap((g) => g.items)
    .find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));

  const displayName =
    userName || userEmail?.split("@")[0] || "Admin";
  const initials = displayName
    .split(/[\s._@-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("")
    .toUpperCase();

  function close() {
    setOpenMenu("none");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-pj-border bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
          <span className="truncate font-medium text-pj-steel">{rootLabel}</span>
          {current ? (
            <>
              <span className="text-pj-faint" aria-hidden="true">/</span>
              <span className="truncate font-semibold text-pj-ink">
                {current.label}
              </span>
            </>
          ) : null}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href={helpHref}
            title={texts.help}
            aria-label={texts.help}
            className="flex size-9 items-center justify-center rounded-lg text-pj-steel transition hover:bg-pj-bg hover:text-pj-ink"
          >
            <CircleHelp size={18} strokeWidth={2} />
          </Link>

          {/* Notificaciones */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "bell" ? "none" : "bell")}
              aria-label={texts.notifications}
              aria-expanded={openMenu === "bell"}
              className="relative flex size-9 items-center justify-center rounded-lg text-pj-steel transition hover:bg-pj-bg hover:text-pj-ink"
            >
              <Bell size={18} strokeWidth={2} />
              {notifications.length > 0 ? (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-pj-danger ring-2 ring-white" />
              ) : null}
            </button>
            {openMenu === "bell" ? (
              <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />
            ) : null}
            {openMenu === "bell" ? (
              <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-pj-border bg-white shadow-pj-pop">
                <p className="border-b border-pj-border px-4 py-3 text-sm font-semibold text-pj-ink">
                  {texts.notifications}
                </p>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-pj-steel">
                    {texts.notificationsEmpty}
                  </p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 border-b border-pj-border/60 px-4 py-3 transition hover:bg-pj-bg"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pj-primary" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-pj-ink">{n.title}</p>
                          <p className="mt-0.5 text-[11px] text-pj-faint">{n.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          <LanguageSwitcher />

          {/* Usuario */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "user" ? "none" : "user")}
              aria-label={texts.account}
              aria-expanded={openMenu === "user"}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-pj-bg"
            >
              <span className="grid size-8 place-items-center rounded-full bg-pj-primary text-xs font-bold text-white">
                {initials}
              </span>
              <ChevronDown size={14} className="text-pj-steel" aria-hidden="true" />
            </button>
            {openMenu === "user" ? (
              <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />
            ) : null}
            {openMenu === "user" ? (
              <div className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-xl border border-pj-border bg-white shadow-pj-pop">
                <div className="border-b border-pj-border px-4 py-3">
                  <p className="truncate text-sm font-semibold text-pj-ink">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs text-pj-steel">{userEmail}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href={profileHref}
                    onClick={close}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-pj-steel transition hover:bg-pj-bg hover:text-pj-ink"
                  >
                    <Settings2 size={16} strokeWidth={2} />
                    {texts.settings}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      setLogoutOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-pj-danger transition hover:bg-pj-danger-bg"
                  >
                    <LogOut size={16} strokeWidth={2} />
                    {logoutLabels.salir}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title={logoutLabels.titulo}
        closeLabel={logoutLabels.cancelar}
      >
        <p className="mt-4 text-sm text-pj-steel">{logoutLabels.texto}</p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="h-11 flex-1 rounded-lg bg-pj-danger text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {logoutLabels.salir}
          </button>
          <button
            type="button"
            onClick={() => setLogoutOpen(false)}
            className="h-11 flex-1 rounded-lg border border-pj-border text-sm font-medium text-pj-steel transition hover:bg-pj-bg"
          >
            {logoutLabels.cancelar}
          </button>
        </div>
      </Modal>
    </header>
  );
}
