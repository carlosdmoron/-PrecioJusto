import Image from "next/image";

const CATEGORY_ROUTES: Record<string, string> = {
  bienestar: "categoria",
  renovacion: "renovacion",
};

type NavLink = { key: string; label: string };

export type CategoryHeaderContent = {
  menu: string;
  nav: NavLink[];
  help: string;
  signin: string;
  register: string;
};

export default function CategoryHeader({
  header,
  lang,
}: {
  header: CategoryHeaderContent;
  lang: string;
}) {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent"
      />
      <div className="relative mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-white lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                clipRule="evenodd"
                d="M2.25 5.25h19.5v1.5H2.25v-1.5zm0 6h19.5v1.5H2.25v-1.5zm.75 6h-.75v1.5h19.5v-1.5H3z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
            <span>{header.menu}</span>
          </button>
          <a href={`/${lang}`} className="flex items-center gap-2" aria-label="PrecioJusto - Inicio">
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
        <nav className="hidden items-center gap-6 lg:flex" aria-label={header.menu}>
          {header.nav.map((item) => {
            const route = CATEGORY_ROUTES[item.key];
            return (
              <a
                key={item.key}
                href={route ? `/${lang}/${route}` : "#"}
                className="text-sm font-medium text-white/90 transition hover:text-white"
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-5 lg:flex">
            <a href="#" className="text-sm text-white/90 transition hover:text-white">
              {header.help}
            </a>
            <a
              href={`/${lang}/iniciar-sesion`}
              className="text-sm text-white/90 transition hover:text-white"
            >
              {header.signin}
            </a>
          </div>
          <a
            href={`/${lang}/registro-profesional`}
            className="flex h-9 items-center rounded-full border border-white/80 px-4 text-sm font-medium text-white transition hover:bg-white/10"
          >
            {header.register}
          </a>
        </div>
      </div>
    </header>
  );
}
