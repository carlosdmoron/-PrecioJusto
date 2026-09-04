import type { Metadata } from "next";
import { getDictionaryByLocale } from "../../dictionaries";
import LoginSection from "../../../components/login/LoginSection";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/iniciar-sesion">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.login.meta.title,
    description: dict?.login.meta.description,
  };
}

export default async function IniciarSesionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginSection next={next} />;
}
