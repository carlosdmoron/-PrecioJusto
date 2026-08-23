import type { Metadata } from "next";
import { getDictionaryByLocale } from "../dictionaries";
import SignProfesionalSection from "../../components/signup/SignProfesionalSection";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/registro-profesional">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.signProfesional.meta.title,
    description: dict?.signProfesional.meta.description,
  };
}

export default function RegistroProfesionalPage() {
  return <SignProfesionalSection />;
}
