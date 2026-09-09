import Image from "next/image";
import { lang } from "next/root-params";
import { getDictionary } from "../../[lang]/dictionaries";
import { getProfesionalServices } from "../../actions/profesional";

// Sección "¿Eres profesional?" de la landing: lista los servicios que tienen un
// formulario de inscripción de profesionales activo. Cada tarjeta lleva a la
// página de registro del servicio ({lang}/profesional/{slug}).
export default async function ProfEnrollment() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const t = dict.profEnrollment;

  const services = await getProfesionalServices(current as "es" | "it" | "en");
  if (services.length === 0) return null;

  return (
    <section className="border-t border-line/40 bg-surface/40 py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <div className="mb-12 max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-badge px-3.5 py-1 text-xs font-semibold text-primary-dark">
            {t.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink">
            {t.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-steel">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <a
              key={service.id}
              href={`/${current}/profesional/${service.slug}`}
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
                  {t.cta}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}