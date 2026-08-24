import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import ProfileForm from "../../../components/dashboard/ProfileForm";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/dashboard-cliente/perfil">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.dashboardCliente.nav.perfil,
    description: dict?.dashboardCliente.meta.description,
  };
}

const CLIENTE_DEFAULTS = {
  nombre: "Laura",
  apellido: "Sánchez",
  email: "laura@correo.com",
  ubicacion: "Madrid, España",
  telefono: "+34 600 111 222",
};

export default async function PerfilPage() {
  const dict = await getDictionary();
  const section = dict.dashboard.sections.perfil;
  return (
    <div className="px-6 py-10 lg:px-10">
      <header>
        <h1 className="font-[family-name:var(--font-figtree)] text-3xl font-semibold tracking-tight text-ink">
          {section.title}
        </h1>
        <p className="mt-2 text-sm text-muted">{section.subtitle}</p>
      </header>
      <ProfileForm
        form={section.form}
        storageKey="pj-perfil-cliente"
        defaultValues={CLIENTE_DEFAULTS}
      />
    </div>
  );
}
