import { getDictionary } from "../../[lang]/dictionaries";

export default async function AllServices() {
  const dict = await getDictionary();
  const { allServicesTitle, allServices } = dict.categoria;

  return (
    <section className="bg-white pb-16 pt-2">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink md:text-[28px]">
          {allServicesTitle}
        </h2>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-3">
          {allServices.map((service) => (
            <a
              key={service}
              href="#"
              className="text-[15px] text-steel transition hover:text-primary hover:underline underline-offset-4"
            >
              {service}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
