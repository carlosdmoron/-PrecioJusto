import type { Metadata } from "next";
import { lang } from "next/root-params";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import LegalDocument from "../../../components/legal/LegalDocument";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/privacidad">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.legalPrivacidad.meta.title,
    description: dict?.legalPrivacidad.meta.description,
  };
}

export default async function PrivacidadPage() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  return <LegalDocument doc={dict.legalPrivacidad} lang={current} />;
}
