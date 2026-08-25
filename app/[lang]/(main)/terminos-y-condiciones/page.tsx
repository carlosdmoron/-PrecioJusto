import type { Metadata } from "next";
import { lang } from "next/root-params";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import LegalDocument from "../../../components/legal/LegalDocument";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/terminos-y-condiciones">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.legalTerminos.meta.title,
    description: dict?.legalTerminos.meta.description,
  };
}

export default async function TerminosPage() {
  const dict = await getDictionary();
  const current = (await lang()) ?? "es";
  return <LegalDocument doc={dict.legalTerminos} lang={current} />;
}
