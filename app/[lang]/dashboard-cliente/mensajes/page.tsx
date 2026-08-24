import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import MessagesSection from "../../../components/customer/MessagesSection";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-cliente/mensajes">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardCliente.sections.mensajes.title,
    description: dict?.dashboardCliente.meta.description,
  };
}

export default async function MensajesPage() {
  const dict = await getDictionary();
  return <MessagesSection data={dict.dashboardCliente.sections.mensajes} />;
}
