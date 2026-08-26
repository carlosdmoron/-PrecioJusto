import { cookies } from "next/headers";
import { lang } from "next/root-params";
import { getDictionary } from "../[lang]/dictionaries";

const services = [
  { key: "limpieza" as const, emoji: "🧹", bg: "bg-blue-100" },
  { key: "construccion" as const, emoji: "🏗️", bg: "bg-orange-100" },
  { key: "carpintero" as const, emoji: "🪚", bg: "bg-green-100" },
];

export default async function ProBuscados() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const t = dict.profBuscados;
  const store = await cookies();
  const isLoggedIn = store.get("pj-session")?.value === "1";
  const href = isLoggedIn
    ? `/${current}/registro-profesional`
    : `/${current}/iniciar-sesion`;

  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-ink">
            {t.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <a
              key={svc.key}
              href={href}
              className="group relative overflow-hidden rounded-xl border border-line/40 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`relative flex h-48 items-center justify-center ${svc.bg} overflow-hidden`}>
                <span className="text-6xl transition duration-300 group-hover:scale-110">{svc.emoji}</span>
              </div>
              <div className="flex flex-col items-center gap-1 px-4 pt-4 pb-16">
                <h3 className="text-sm font-semibold leading-snug text-ink">
                  {t.items[svc.key]}
                </h3>
              </div>
              <div className="absolute bottom-0 left-0 right-0 translate-y-full px-3 pb-3 transition-transform duration-300 ease-out group-hover:translate-y-0">
                <span className="flex w-full items-center justify-center rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-dark">
                  {t.presupuestar}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
