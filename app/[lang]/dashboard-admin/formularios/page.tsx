import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import FormulariosPageClient from "./FormulariosPageClient";
import { listForms } from "../../../actions/forms";
import { listServices } from "../../../actions/admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-admin/formularios">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardAdmin.formularios.title + " — PrecioJusto",
    description: dict?.dashboardAdmin.meta.description,
  };
}

export default async function FormulariosPage() {
  const dict = await getDictionary();
  let forms: any[] = [];
  let services: any[] = [];
  try {
    [forms, services] = await Promise.all([listForms(), listServices()]);
  } catch (e) {
    console.error("Error cargando formularios:", e);
  }

  const items = forms.map((f) => ({
    id: f.id,
    service: f.service_name ?? "—",
    version: f.version,
    questions: String(f.question_count),
    abandonment: `${f.abandonment_rate}%`,
    status: f.status,
  }));

  return (
    <FormulariosPageClient
      data={{
        ...dict.dashboardAdmin.formularios,
        feedback: dict.dashboardAdmin.feedback,
        items,
        services,
      }}
    />
  );
}
