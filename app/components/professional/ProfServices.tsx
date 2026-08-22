import Image from "next/image";
import { getDictionary } from "../../[lang]/dictionaries";

export default async function ProfServices() {
  const dict = await getDictionary();
  return (
    <section className="bg-[#EDEEF0] py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <h2 className="mx-auto max-w-xl text-center text-3xl font-bold tracking-tight text-ink">
          {dict.profesional.services.title}
        </h2>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dict.profesional.services.items.map((item, index) => (
            <article
              key={item.name}
              className="group overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={`/images/prof-service-${index + 1}.jpg`}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between gap-4 p-6">
                <h3 className="text-sm font-semibold leading-snug text-ink">
                  {item.name}
                </h3>
                <span className="shrink-0 text-base font-bold text-primary-dark">
                  {item.price}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
