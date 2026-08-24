"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton, { type LogoutLabels } from "../shared/LogoutButton";

export type CustomerNavItem = {
  href: string;
  label: string;
};

export default function CustomerSidebar({
  items,
  promo,
  logoAlt,
  logoutLabels,
  loginHref,
}: {
  items: CustomerNavItem[];
  promo: { title: string; text: string; cta: string };
  logoAlt: string;
  logoutLabels: LogoutLabels;
  loginHref: string;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-sidebar lg:flex">
        <div className="px-6 py-6">
          <Link href="/" aria-label={logoAlt}>
            <Image
              src="/images/logo.png"
              alt={logoAlt}
              width={771}
              height={324}
              className="h-9 w-auto"
              priority
            />
          </Link>
        </div>
        <nav aria-label="Menú principal" className="flex flex-col gap-1 px-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-lg px-5 py-3.5 text-sm transition ${
                isActive(item.href)
                  ? "bg-primary font-semibold text-white"
                  : "font-medium text-steel hover:bg-white/60 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <div className="rounded-xl bg-panel p-5">
            <h3 className="font-[family-name:var(--font-figtree)] text-base font-semibold text-ink">
              {promo.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-steel">{promo.text}</p>
            <Link
              href="/es/profesional"
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary-dark px-4 text-xs font-semibold text-white transition hover:bg-primary"
            >
              {promo.cta}
            </Link>
          </div>
          <LogoutButton loginHref={loginHref} labels={logoutLabels} />
        </div>
      </aside>

      <div className="sticky top-0 z-30 border-b border-line/30 bg-sidebar lg:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <Link href="/" aria-label={logoAlt}>
            <Image
              src="/images/logo.png"
              alt={logoAlt}
              width={771}
              height={324}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <span className="grid size-9 place-items-center rounded-full bg-primary-dark text-sm font-semibold text-white">
            L
          </span>
          <LogoutButton loginHref={loginHref} labels={logoutLabels} compact />
        </div>
        <nav
          aria-label="Menú principal"
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
                  : "bg-white/70 font-medium text-steel hover:text-ink"
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
