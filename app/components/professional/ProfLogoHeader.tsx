import Image from "next/image";
import { lang } from "next/root-params";

export default async function ProfLogoHeader() {
  const current = (await lang()) ?? "es";
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-5 lg:px-20">
        <a
          href={`/${current}`}
          className="flex items-center gap-3"
          aria-label="PrecioJusto - Inicio"
        >
          <Image
            src="/images/logo-lg.jpg"
            alt="PrecioJusto"
            width={32}
            height={32}
            className="rounded-lg ring-1 ring-white/40"
          />
          <span className="text-lg font-bold tracking-tight text-white drop-shadow-md">
            PrecioJusto
          </span>
        </a>
      </div>
    </header>
  );
}
