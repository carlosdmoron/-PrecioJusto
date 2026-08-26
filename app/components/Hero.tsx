import Image from "next/image";
import { getDictionary } from "../[lang]/dictionaries";
import SearchBar from "./SearchBar";

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
        className="object-cover"
      />
      <div className="relative mx-auto flex min-h-[636px] w-full max-w-[1280px] flex-col items-center px-6 pb-24 pt-24 lg:px-20 lg:pt-[180px]">
        <span className="inline-flex h-8 items-center rounded-full bg-primary px-4 text-sm font-medium text-white shadow-lg shadow-primary/40">
          {dict.hero.badge}
        </span>
        <h1 className="mt-8 max-w-3xl text-center font-[family-name:var(--font-figtree)] text-[60px] font-semibold leading-[1.1] tracking-tight text-white drop-shadow-md">
          {dict.hero.title}
        </h1>
        <form action="#" className="mt-12 flex w-full max-w-[768px] items-stretch">
          <SearchBar placeholder={dict.hero.searchPlaceholder} />
          <button
            type="submit"
            className="h-[54px] w-[82px] shrink-0 rounded-r-lg bg-primary text-base font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {dict.hero.searchButton}
          </button>
        </form>
      </div>
    </section>
  );
}
