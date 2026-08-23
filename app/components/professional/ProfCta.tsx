import { lang } from "next/root-params";
import { getDictionary } from "../../[lang]/dictionaries";

export default async function ProfCta() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  return (
    <section className="bg-primary-dark py-20 lg:py-[108px]">
      <div className="mx-auto w-full max-w-[1280px] px-6 text-center lg:px-20">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl md:leading-tight">
          {dict.profesional.cta.titleLine1}
          <span className="mt-2 block">{dict.profesional.cta.titleLine2}</span>
        </h2>
        <a
          href={`/${current}/registro-profesional`}
          className="mt-11 inline-flex h-14 items-center justify-center rounded-lg bg-white px-10 text-sm font-semibold text-primary-dark transition hover:bg-chip-blue"
        >
          {dict.profesional.cta.button}
        </a>
      </div>
    </section>
  );
}
