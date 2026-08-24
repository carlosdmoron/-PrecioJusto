import Image from "next/image";
import { getDictionary } from "../[lang]/dictionaries";

export default async function SiteFooter() {
  const dict = await getDictionary();
  return (
    <footer className="border-t border-line/30 bg-surface">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-x-6 gap-y-10 px-6 py-16 md:grid-cols-4 lg:px-20">
        {dict.footer.columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="text-sm font-semibold text-ink">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted transition hover:text-primary"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line/30">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row lg:px-20">
          <a href="#" className="flex items-center gap-2.5">
            <Image
              src="/images/logo.webp"
              alt="PrecioJusto"
              width={473}
              height={1024}
              className="h-7 w-auto rounded-md"
            />
            <span className="font-bold tracking-tight text-navy">
              PrecioJusto
            </span>
          </a>
          <p className="text-xs text-muted">
            {dict.footer.rights.replace("{year}", String(new Date().getFullYear()))}
          </p>
        </div>
      </div>
    </footer>
  );
}
