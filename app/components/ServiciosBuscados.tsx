import Image from "next/image";
import { cookies } from "next/headers";
import { lang } from "next/root-params";
import { getDictionary } from "../[lang]/dictionaries";
import { getComingSoonServices } from "../actions/services";

export default async function ServiciosBuscados() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const t = dict.serviciosBuscados;
  const store = await cookies();
  const isLoggedIn = store.get("pj-session")?.value === "1";
  const href = isLoggedIn
    ? `/${current}/registro-profesional`
    : `/${current}/iniciar-sesion`;

  const services = await getComingSoonServices();
  if (services.length === 0) return null;

  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-ink">
            {t.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <a
              key={service.id}
              href={href}
              className="group relative overflow-hidden rounded-xl border border-line/40 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={service.image_url || "/images/prof-service-1.jpg"}
                  alt={service.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col items-center gap-1 px-4 pt-4 pb-16">
                <h3 className="text-sm font-semibold leading-snug text-ink">
                  {service.name}
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
