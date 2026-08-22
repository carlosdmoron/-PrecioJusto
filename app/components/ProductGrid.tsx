import Image from "next/image";
import { getDictionary } from "../[lang]/dictionaries";

type Product = {
  name: string;
  store: string;
  price: string;
  oldPrice: string;
};

function ProductCard({ product, id }: { product: Product; id: number }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-line/40 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-40 overflow-hidden">
        <Image
          src={`/images/product-${id}.jpg`}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex h-[122px] flex-col gap-1 p-4">
        <span className="text-xs text-muted">{product.store}</span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-bold text-accent">{product.price}</span>
          <span className="text-xs text-faint line-through">{product.oldPrice}</span>
        </div>
      </div>
    </article>
  );
}

export default async function ProductGrid() {
  const dict = await getDictionary();
  return (
    <section className="py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink">
              {dict.products.title}
            </h2>
            <p className="mt-2 text-steel">{dict.products.subtitle}</p>
          </div>
          <a
            href="#"
            className="hidden shrink-0 text-sm font-medium text-primary-dark hover:text-primary sm:block"
          >
            {dict.products.viewAll}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {dict.products.items.map((product, index) => (
            <ProductCard key={product.name} product={product} id={index + 1} />
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <a
            href="#"
            className="inline-flex h-12 w-[227px] items-center justify-center rounded-lg border border-line/60 bg-white text-sm font-medium text-ink shadow-sm transition hover:border-primary hover:text-primary"
          >
            {dict.products.viewAllOffers}
          </a>
        </div>
      </div>
    </section>
  );
}
