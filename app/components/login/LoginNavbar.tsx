import Image from "next/image";
import { lang } from "next/root-params";
import { getDictionary } from "../../[lang]/dictionaries";

export default async function LoginNavbar() {
  const dict = await getDictionary();
  const nav = dict.login.nav;
  const current = (await lang()) ?? "es";
  return (
    <header className="sticky top-0 z-50 border-b border-line/20 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-8 px-4 sm:px-6 lg:px-20">
        <a href={`/${current}`} className="flex shrink-0 items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="PrecioJusto"
              width={771}
              height={324}
              className="h-12 w-auto"
            />
        </a>
        <nav aria-label={nav.categories} className="hidden items-center gap-6 text-sm font-medium text-steel lg:flex">
          <button
            type="button"
            className="flex items-center gap-1.5 transition hover:text-primary"
          >
            {nav.categories}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <a href="#" className="transition hover:text-primary">
            {nav.stores}
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-5 sm:gap-6">
          <a
            href="#"
            className="hidden text-sm font-medium text-steel transition hover:text-primary sm:block"
          >
            {nav.signup}
          </a>
          <a
            href="#"
            className="hidden text-sm font-medium text-primary-dark transition hover:text-primary sm:block"
          >
            {nav.signin}
          </a>
          <button
            aria-label={nav.account}
            className="grid size-8 place-items-center rounded-full bg-primary-dark text-white transition hover:bg-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
