export default function AllServices({
  title,
  services,
}: {
  title: string;
  services: string[];
}) {
  return (
    <section className="bg-white pb-16 pt-2">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink md:text-[28px]">
          {title}
        </h2>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-3">
          {services.map((service) => (
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
