import Image from "next/image";
import { lang } from "next/root-params";
import { getDictionary } from "../[lang]/dictionaries";

export default async function CtaBanner() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <div className="flex flex-col gap-10 overflow-hidden rounded-3xl bg-chip-blue p-8 md:p-14 lg:h-[344px] lg:flex-row lg:items-center lg:justify-between lg:p-0">
          <div className="max-w-md lg:pl-14">
            <h2 className="text-3xl font-bold tracking-tight text-navy">
              {dict.cta.title}
            </h2>
            <p className="mt-4 text-steel">{dict.cta.text}</p>
            <a
              href={`/${current}/profesional`}
              className="mt-8 inline-flex h-14 items-center rounded-lg bg-primary-dark px-8 text-sm font-semibold text-white transition hover:bg-primary"
            >
              {dict.cta.button}
            </a>
          </div>
          <Image
            src="/images/cta-photo.jpg"
            alt={dict.cta.imageAlt}
            width={448}
            height={300}
            className="hidden rounded-l-3xl object-cover md:block"
          />
        </div>
      </div>
    </section>
  );
}
