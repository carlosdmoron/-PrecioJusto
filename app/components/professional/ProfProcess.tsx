import { getDictionary } from "../../[lang]/dictionaries";

export default async function ProfProcess() {
  const dict = await getDictionary();
  return (
    <section className="border-y border-line/40 bg-white py-24 lg:py-[130px]">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-ink">
          {dict.profesional.process.title}
        </h2>
        <ol className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {dict.profesional.process.steps.map((step, index) => (
            <li
              key={step}
              className="flex flex-col items-center text-center"
            >
              <span className="grid size-16 place-items-center rounded-full bg-white text-xl font-bold text-primary-dark shadow-sm ring-1 ring-line/50">
                {index + 1}
              </span>
              <p className="mt-7 max-w-[190px] text-sm font-medium leading-snug text-ink">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
