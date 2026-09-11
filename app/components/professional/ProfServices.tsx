import Image from "next/image";
import { lang } from "next/root-params";
import { getDictionary } from "../../[lang]/dictionaries";
import { getPublishedServicesWithForm } from "../../actions/profesional";

export default async function ProfServices() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const services = await getPublishedServicesWithForm(
    current as "es" | "it" | "en"
  );

  if (services.length === 0) return null;

  return (
    <section className="bg-[#EDEEF0] py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <h2 className="mx-auto max-w-xl text-center text-3xl font-bold tracking-tight text-ink">
          {dict.profesional.services.title}
        </h2>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <a
              key={service.id}
              href={`/${current}/profesional/${service.slug}`}
              className="group overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={
                    service.image_url ||
                    `/images/prof-service-${index + 1}.jpg`
                  }
                  alt={service.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-sm font-semibold leading-snug text-ink">
                  {service.name}
                </h3>
                {service.description ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {service.description}
                  </p>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
