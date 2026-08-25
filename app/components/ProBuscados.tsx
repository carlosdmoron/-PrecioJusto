import Image from "next/image";
import { cookies } from "next/headers";
import { lang } from "next/root-params";
import { getDictionary } from "../[lang]/dictionaries";

const professionals = [
  { key: "electricista" as const, image: "/images/prof-electricista.jfif" },
  { key: "carpintero" as const, image: "/images/prof-carpintero.jfif" },
  { key: "fontanero" as const, image: "/images/prof-fontanero.jfif" },
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
          {professionals.map((pro) => (
            <a
              key={pro.key}
              href={href}
              className="group overflow-hidden rounded-xl border border-line/40 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={pro.image}
                  alt={t.items[pro.key]}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col items-center gap-1 p-4">
                <h3 className="text-sm font-semibold leading-snug text-ink">
                  {t.items[pro.key]}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
