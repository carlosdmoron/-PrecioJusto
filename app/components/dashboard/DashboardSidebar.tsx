"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Shuffle,
  FileText,
  Briefcase,
  Users,
  MessageCircle,
  UserCheck,
  Wrench,
  ListChecks,
  Star,
  CreditCard,
  Megaphone,
  Bell,
  LifeBuoy,
  BarChart3,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import LogoutButton, { type LogoutLabels } from "../shared/LogoutButton";

export type DashboardNavItem = {
  href: string;
  label: string;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

const ICONS: Record<string, LucideIcon> = {
  resumen: LayoutDashboard,
  solicitudes: ClipboardList,
  matching: Shuffle,
  presupuestos: FileText,
  trabajos: Briefcase,
  clientes: Users,
  conversaciones: MessageCircle,
  profesionales: UserCheck,
  servicios: Wrench,
  formularios: ListChecks,
  resenas: Star,
  facturacion: CreditCard,
  marketing: Megaphone,
  notificaciones: Bell,
  soporte: LifeBuoy,
  analitica: BarChart3,
  configuracion: Settings,
};

function iconFor(href: string): LucideIcon | null {
  const segments = href.split("/");
  const last = segments[segments.length - 1];
  return ICONS[last] ?? null;
}

export default function DashboardSidebar({
  items,
  groups,
  accountLabel,
  profileHref,
  logoutLabels,
  loginHref,
}: {
  items: DashboardNavItem[];
  groups?: DashboardNavGroup[];
  accountLabel: string;
  profileHref: string;
  logoutLabels: LogoutLabels;
  loginHref: string;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sections: DashboardNavGroup[] =
    groups && groups.length > 0 ? groups : [{ label: "", items }];

  function renderNavLinks(onNavigate?: () => void) {
    return (
      <nav aria-label={accountLabel} className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        {sections.map((section, idx) => (
          <div key={section.label || idx} className="flex flex-col gap-1">
            {section.label ? (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-pj-faint">
                {section.label}
              </p>
            ) : null}
            {section.items.map((item) => {
              const Icon = iconFor(item.href);
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-all duration-150 ${
                    active
                      ? "bg-pj-active-bg font-semibold text-pj-primary"
                      : "font-medium text-pj-steel hover:bg-pj-bg hover:text-pj-ink"
                  }`}
                >
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-pj-primary"
                    />
                  ) : null}
                  {Icon ? (
                    <Icon
                      size={18}
                      strokeWidth={2}
                      className={active ? "text-pj-primary" : "text-pj-faint"}
                    />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    );
  }

  function renderBrand() {
    return (
      <Link href="/" aria-label="PrecioJusto - Inicio">
        <Image
          src="/images/logo.png"
          alt="PrecioJusto"
          width={771}
          height={324}
          className="h-10 w-auto"
          priority
        />
      </Link>
    );
  }

  function renderFooterCard() {
    return (
      <div className="border-t border-pj-border p-4">
        <Link
          href={profileHref}
          className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 transition hover:bg-pj-bg"
          aria-current={isActive(profileHref) ? "page" : undefined}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pj-primary text-sm font-semibold text-white">
            PJ
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-pj-ink">
              PrecioJusto Pro
            </span>
            <span className="block truncate text-xs text-pj-steel">{accountLabel}</span>
          </span>
        </Link>
        <LogoutButton loginHref={loginHref} labels={logoutLabels} />
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-pj-border bg-white lg:flex">
        <div className="px-6 pb-4 pt-5">
          {renderBrand()}
        </div>
        {renderNavLinks()}
        {renderFooterCard()}
      </aside>

      {/* Mobile: barra superior + drawer */}
      <div className="sticky top-0 z-40 border-b border-pj-border bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="flex size-10 items-center justify-center rounded-lg text-pj-steel transition hover:bg-pj-bg hover:text-pj-ink"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
          {renderBrand()}
          <LogoutButton loginHref={loginHref} labels={logoutLabels} compact />
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-pj-ink/45 backdrop-blur-[4px] transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-white shadow-pj-pop">
            <div className="flex items-center justify-between px-5 pb-3 pt-4">
              {renderBrand()}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="flex size-9 items-center justify-center rounded-lg text-pj-steel transition hover:bg-pj-bg"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            {renderNavLinks(() => setDrawerOpen(false))}
            {renderFooterCard()}
          </aside>
        </div>
      ) : null}
    </>
  );
}
