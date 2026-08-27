import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import { getConversations } from "../../../actions/messages";
import { getSession } from "../../../actions/auth";
import MessagesReal from "../../../components/customer/MessagesReal";

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
  const conversations = await getConversations();
  const user = await getSession();
  const data = dict.dashboardCliente.sections.mensajes;

  return <MessagesReal data={data} conversations={conversations} currentUserId={user?.id ?? null} />;
}
