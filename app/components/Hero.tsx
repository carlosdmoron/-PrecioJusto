import Image from "next/image";
import { lang } from "next/root-params";
import { getDictionary } from "../[lang]/dictionaries";
import { getPublishedServices } from "../actions/services";
import SearchBar from "./SearchBar";

export default async function Hero() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const services = await getPublishedServices(current as "es" | "it" | "en");
  const options = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
  }));

  return (
    <section className="relative overflow-hidden bg-[#d9dadc]">
      <Image
        src="/images/imagen-inicio.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="relative mx-auto flex min-h-[636px] w-full max-w-[1280px] flex-col items-center px-6 pb-24 pt-16 lg:px-20 lg:pt-36">
        <h1 className="mt-0 max-w-3xl text-center font-[family-name:var(--font-figtree)] text-[60px] font-semibold leading-[1.1] tracking-tight text-white drop-shadow-md">
          {dict.hero.title}
        </h1>
        <SearchBar
          placeholder={dict.hero.searchPlaceholder}
          searchButton={dict.hero.searchButton}
          lang={current}
          services={options}
        />
      </div>
    </section>
  );
}
