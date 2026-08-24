import type { Metadata } from "next";
import { lang } from "next/root-params";
import { getDictionary, getDictionaryByLocale } from "../dictionaries";
import ExploreTabs from "../../components/customer/ExploreTabs";
import FeaturedRequest from "../../components/customer/FeaturedRequest";
import ServiceGallery from "../../components/customer/ServiceGallery";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-cliente">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardCliente.meta.title,
    description: dict?.dashboardCliente.meta.description,
  };
}

const SERVICE_IMAGES = [
  "/images/prof-service-2.jpg",
  "/images/prof-service-3.jpg",
  "/images/prof-service-4.jpg",
];

export default async function CustomerDashboardPage() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  const cliente = dict.dashboardCliente;
  const services = cliente.services.map((service, index) => ({
    ...service,
    image: SERVICE_IMAGES[index % SERVICE_IMAGES.length],
  }));

  return (
    <div className="mx-auto w-full max-w-[992px] px-6 py-8 lg:px-16">
      <ExploreTabs
        tabs={cliente.tabs}
        empty={cliente.emptySolicitudes}
        ctaHref={`/${current}/dashboard-cliente/solicitudes`}
      >
        <FeaturedRequest
          badge={cliente.featured.badge}
          title={cliente.featured.title}
          meta={cliente.featured.meta}
          detail={cliente.featured.detail}
          cta={cliente.featured.cta}
        />
      </ExploreTabs>

      <section aria-label={cliente.sectionTitle} className="mt-14">
        <ServiceGallery
          title={cliente.sectionTitle}
          services={services}
          prevLabel={cliente.prevLabel}
          nextLabel={cliente.nextLabel}
        />
      </section>
    </div>
  );
}
