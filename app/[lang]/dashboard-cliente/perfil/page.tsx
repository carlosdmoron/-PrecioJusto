import type { Metadata } from "next";
import { getDictionary, getDictionaryByLocale } from "../../dictionaries";
import ProfileForm from "../../../components/dashboard/ProfileForm";
import { getProfile, updateProfile } from "../../../actions/profile";

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

export default async function PerfilPage() {
  const dict = await getDictionary();
  const section = dict.dashboard.sections.perfil;
  const profile = await getProfile();

  const defaultValues = {
    nombre: profile?.first_name ?? "",
    apellido: profile?.last_name ?? "",
    email: profile?.email ?? "",
    ubicacion: profile?.municipality ?? "",
    telefono: profile?.phone ?? "",
  };

  async function handleSave(values: {
    nombre: string;
    apellido: string;
    email: string;
    ubicacion: string;
    telefono: string;
  }) {
    "use server";
    await updateProfile({
      first_name: values.nombre,
      last_name: values.apellido,
      email: values.email,
      phone: values.telefono,
    });
  }

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
        defaultValues={defaultValues}
        onSave={handleSave}
      />
    </div>
  );
}
