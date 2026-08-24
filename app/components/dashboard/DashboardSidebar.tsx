"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type DashboardNavItem = {
  href: string;
  label: string;
};

export default function DashboardSidebar({
  items,
  accountLabel,
  profileHref,
}: {
  items: DashboardNavItem[];
  accountLabel: string;
  profileHref: string;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line/30 bg-white lg:flex">
        <div className="border-b border-line/30 px-6 py-5">
          <Link href="/" aria-label="PrecioJusto - Inicio">
            <Image
              src="/images/logo.png"
              alt="PrecioJusto"
              width={771}
              height={324}
              className="h-12 w-auto"
              priority
            />
          </Link>
        </div>
        <nav aria-label={accountLabel} className="flex flex-1 flex-col gap-1 p-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-lg px-4 py-2.5 text-sm transition ${
                isActive(item.href)
                  ? "bg-primary/10 font-semibold text-primary-dark"
                  : "font-medium text-steel hover:bg-surface-alt hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line/30 p-4">
          <Link
            href={profileHref}
            className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2.5 transition hover:bg-surface-alt"
            aria-current={isActive(profileHref) ? "page" : undefined}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-dark text-sm font-semibold text-white">
              PJ
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">
                PrecioJusto Pro
              </span>
              <span className="block truncate text-xs text-muted">{accountLabel}</span>
            </span>
          </Link>
        </div>
      </aside>

      <div className="sticky top-0 z-30 border-b border-line/30 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <Link href="/" aria-label="PrecioJusto - Inicio">
            <Image
              src="/images/logo.png"
              alt="PrecioJusto"
              width={771}
              height={324}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <Link
            href={profileHref}
            className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-steel transition hover:text-ink"
          >
            PrecioJusto Pro
          </Link>
        </div>
        <nav
          aria-label={accountLabel}
          className="flex gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                isActive(item.href)
                  ? "bg-primary font-semibold text-white"
                  : "bg-surface font-medium text-steel hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
