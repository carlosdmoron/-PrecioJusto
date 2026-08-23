import Image from "next/image";
import { lang } from "next/root-params";
import { getDictionary } from "../../[lang]/dictionaries";

export default async function ProfHero() {
  const dict = await getDictionary();
  const { hero } = dict.profesional;
  const current = (await lang()) ?? "es";
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/prof-hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
      <div className="relative mx-auto flex min-h-[626px] w-full max-w-[1280px] flex-col justify-between px-6 pb-12 pt-12 lg:px-20 lg:pt-[88px]">
        <div className="ml-auto w-full max-w-md rounded-xl bg-white p-8 shadow-2xl shadow-black/30">
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl md:leading-tight">
            {hero.cardTitle}
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-steel">{hero.cardText}</p>
          <form action="#" className="mt-9">
            <input
              type="email"
              placeholder={hero.emailPlaceholder}
              className="h-12 w-full rounded-lg bg-field px-4 text-sm text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              className="mt-4 h-12 w-full rounded-lg bg-primary-dark text-sm font-medium text-white transition hover:bg-primary"
            >
              {hero.submitButton}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-steel">
            {hero.haveAccount}{" "}
            <a
              href={`/${current}/registro-profesional`}
              className="font-medium text-primary-dark hover:text-primary"
            >
              {hero.loginLink}
            </a>
          </p>
        </div>
        <div className="mt-16 grid gap-10 text-center sm:grid-cols-3 lg:mt-0 lg:pb-10">
          {hero.highlights.map((highlight) => (
            <div key={highlight.title} className="mx-auto max-w-[220px]">
              <h3 className="text-xl font-bold leading-snug text-white">
                {highlight.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                {highlight.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
