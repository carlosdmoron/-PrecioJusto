import Image from "next/image";
import { getDictionary } from "../../[lang]/dictionaries";

export default async function CategoriaHero() {
  const dict = await getDictionary();
  const { hero } = dict.categoria;

  return (
    <section className="relative flex h-[480px] items-center justify-center overflow-hidden sm:h-[400px]">
      <Image
        src="/images/categoria/hero-personal-trainer.jpg"
        alt={hero.title}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <h1 className="text-center text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-[40px] md:leading-tight">
          {hero.title}
        </h1>
        <form className="mx-auto mt-8 flex max-w-xl items-center rounded-lg bg-white p-1.5 shadow-xl shadow-black/20">
          <input
            type="search"
            name="service-search"
            autoComplete="off"
            placeholder={hero.searchPlaceholder}
            className="h-11 w-full min-w-0 bg-transparent px-4 text-sm text-ink outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-md bg-primary px-6 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            {hero.searchButton}
          </button>
        </form>
      </div>
    </section>
  );
}
