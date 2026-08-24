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
            src="/images/logo.png"
            alt="PrecioJusto"
            width={771}
            height={324}
            className="h-12 w-auto"
          />
        </a>
      </div>
    </header>
  );
}
