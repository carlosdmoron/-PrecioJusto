import { getDictionary } from "../[lang]/dictionaries";

export default async function HowItWorks() {
  const dict = await getDictionary();
  return (
    <section className="relative overflow-hidden bg-surface-alt py-20 lg:py-28">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden w-full max-w-[427px] bg-gradient-to-b from-primary-dark via-deep to-navy lg:block"
      />
      <div className="relative mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <h2 className="max-w-md text-3xl font-bold tracking-tight text-ink">
          {dict.howItWorks.title}
        </h2>
        <p className="mt-3 max-w-md text-steel">{dict.howItWorks.subtitle}</p>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {dict.howItWorks.steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl bg-white/90 p-8 backdrop-blur-sm transition hover:bg-white"
            >
              <span className="grid size-24 place-items-center rounded-full bg-white text-3xl font-bold text-primary-dark shadow-lg shadow-navy/10 ring-1 ring-line/30">
                {index + 1}
              </span>
              <h3 className="mt-6 text-lg font-semibold text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
