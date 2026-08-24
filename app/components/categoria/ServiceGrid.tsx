import Image from "next/image";
import { getDictionary } from "../../[lang]/dictionaries";

const SERVICE_IMAGES = [
  "/images/categoria/108464-nutricionista.jpeg",
  "/images/categoria/108481-entrenador-personal.jpeg",
  "/images/categoria/108666-psicologo.jpeg",
  "/images/categoria/108470-psicoterapia.jpg",
  "/images/categoria/00692-online-diyetisyen.jpg",
  "/images/categoria/109144-psiquiatra.jpeg",
  "/images/categoria/00515-online-psikolog.jpg",
  "/images/categoria/108465-dietista.jpg",
  "/images/categoria/109162-entrenador-a-domicilio.jpg",
  "/images/categoria/109023-fisioterapia-a-domicilio.jpeg",
  "/images/categoria/108475-fisioterapeuta.jpeg",
  "/images/categoria/109320-entrenador-personal-online.jpeg",
];

export default async function ServiceGrid() {
  const dict = await getDictionary();
  const { popularTitle, services, quoteButton } = dict.categoria;

  return (
    <section className="bg-white py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink md:text-[28px]">
          {popularTitle}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <a
              key={service.name}
              href="#"
              className="group block overflow-hidden rounded-xl border border-surface-alt bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={SERVICE_IMAGES[index]}
                  alt={service.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-ink">{service.name}</h3>
                <div className="mt-3 flex flex-col gap-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"
                        fill="currentColor"
                      />
                    </svg>
                    {service.professionals}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        fill="currentColor"
                      />
                    </svg>
                    {service.rating}
                  </span>
                </div>
                <span className="mt-4 inline-flex text-sm font-semibold text-primary transition group-hover:text-primary-dark">
                  {quoteButton}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
