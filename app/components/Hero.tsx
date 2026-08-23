import Image from "next/image";
import { getDictionary } from "../[lang]/dictionaries";

export default async function Hero() {
  const dict = await getDictionary();
  return (
    <section className="relative overflow-hidden bg-[#d9dadc]">
      <Image
        src="/images/hero-landing.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-60 mix-blend-overlay"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-surface" />
      <div className="relative mx-auto flex min-h-[636px] w-full max-w-[1280px] flex-col items-center px-6 pb-24 pt-24 lg:px-20 lg:pt-[180px]">
        <span className="inline-flex h-8 items-center rounded-full bg-primary px-4 text-sm font-medium text-white shadow-lg shadow-primary/40">
          {dict.hero.badge}
        </span>
        <h1 className="mt-8 max-w-3xl text-center text-4xl font-bold tracking-tight text-navy md:text-5xl">
          {dict.hero.title}
        </h1>
        <p className="mt-4 max-w-xl text-center text-base text-steel md:text-lg">
          {dict.hero.subtitle}
        </p>
        <form
          action="#"
          className="mt-12 flex w-full max-w-[768px] flex-col gap-2 rounded-xl bg-white p-2 shadow-xl shadow-navy/10 md:flex-row"
        >
          <input
            type="text"
            placeholder={dict.hero.searchPlaceholder}
            className="h-12 min-w-0 flex-1 rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="text"
            placeholder={dict.hero.categoryPlaceholder}
            className="h-12 min-w-0 flex-1 rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            className="h-12 shrink-0 rounded-lg bg-primary-dark px-6 text-sm font-medium text-white transition hover:bg-primary"
          >
            {dict.hero.searchButton}
          </button>
        </form>
      </div>
    </section>
  );
}
