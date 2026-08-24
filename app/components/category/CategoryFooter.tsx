import Image from "next/image";

export type CategoryFooterContent = {
  blog: string;
  contact: string;
  nearMe: string;
  prices: string;
  priceLinks: string[];
  mostSearched: string;
  searchedLinks: string[];
  register: string;
  legal: string[];
  rights: string;
};

export default function CategoryFooter({
  footer,
  lang,
}: {
  footer: CategoryFooterContent;
  lang: string;
}) {
  return (
    <footer className="bg-surface-alt">
      <div className="mx-auto w-full max-w-[1280px] px-6 pb-8 pt-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <a href={`/${lang}`} className="flex items-center gap-2" aria-label="PrecioJusto - Inicio">
              <Image
                src="/images/logo-lg.jpg"
                alt="PrecioJusto"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-lg font-bold tracking-tight text-primary">PrecioJusto</span>
            </a>
            <ul className="mt-6 flex flex-col gap-3 text-sm text-steel">
              <li>
                <a href="#" className="transition hover:text-primary">
                  {footer.blog}
                </a>
              </li>
              <li>
                <a href="#" className="transition hover:text-primary">
                  {footer.contact}
                </a>
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-4">
              <a href="#" aria-label="Facebook" className="text-muted transition hover:text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="text-muted transition hover:text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-muted transition hover:text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.71h.05c.53-1 1.83-2.06 3.77-2.06C20.6 8.65 21 11 21 13.9V21h-4v-6.34c0-1.51-.03-3.46-2.11-3.46-2.11 0-2.44 1.65-2.44 3.35V21H9z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-muted transition hover:text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 5.92a8.2 8.2 0 0 1-2.36.65 4.1 4.1 0 0 0 1.8-2.27 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.74A11.65 11.65 0 0 1 3.4 4.75a4.1 4.1 0 0 0 1.27 5.48A4.07 4.07 0 0 1 2.8 9.7v.05a4.1 4.1 0 0 0 3.3 4.03 4.09 4.09 0 0 1-1.85.07 4.11 4.11 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.4a11.62 11.62 0 0 0 6.29 1.84c7.55 0 11.68-6.25 11.68-11.67v-.53A8.35 8.35 0 0 0 22 5.92z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="md:col-span-3">
            <ul className="flex flex-col gap-3 text-sm text-steel">
              <li>
                <a href="#" className="font-medium text-ink transition hover:text-primary">
                  {footer.nearMe}
                </a>
              </li>
            </ul>
            <h3 className="mt-6 text-sm font-semibold text-ink">{footer.prices}</h3>
            <ul className="mt-3 flex flex-col gap-3 text-sm text-steel">
              {footer.priceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="transition hover:text-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-ink">{footer.mostSearched}</h3>
            <ul className="mt-3 flex flex-col gap-3 text-sm text-steel">
              {footer.searchedLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="transition hover:text-primary">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2 md:text-right">
            <a
              href={`/${lang}/registro-profesional`}
              className="inline-flex h-10 items-center rounded-full border border-primary px-5 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
            >
              {footer.register}
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-6 text-xs text-muted md:flex-row">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footer.legal.map((item) => (
              <li key={item}>
                <a href="#" className="transition hover:text-primary">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <p>{footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
