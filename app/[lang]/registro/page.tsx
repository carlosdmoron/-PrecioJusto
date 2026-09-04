import type { Metadata } from "next";
import { lang } from "next/root-params";
import { getDictionaryByLocale } from "../dictionaries";
import RegisterClienteForm from "../../components/signup/RegisterClienteForm";

export async function generateMetadata(): Promise<Metadata> {
  const current = (await lang()) ?? "es";
  const dict = await getDictionaryByLocale(current);
  return {
    title: dict?.login?.meta?.title ?? "Registro",
  };
}

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const current = (await lang()) ?? "es";
  const { next } = await searchParams;
  const labels = {
    title: "Crea tu cuenta de cliente",
    firstName: "Nombre",
    lastName: "Apellidos",
    email: "Email",
    password: "Contraseña",
    submit: "Registrarme",
    submitting: "Creando tu cuenta…",
    registerOk: "Cuenta creada. Puedes iniciar sesión.",
    needsConfirmation: "Revisa tu email para confirmar tu cuenta antes de iniciar sesión.",
    login: "¿Ya tienes cuenta?",
    loginLink: "Inicia sesión",
  };

  return (
    <main className="relative flex-1 overflow-hidden bg-field">
      <div className="relative mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-xl shadow-navy/10 sm:p-10 md:p-12">
        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-ink">
          {labels.title}
        </h1>
        <RegisterClienteForm lang={current} next={next} labels={labels} />
      </div>
    </main>
  );
}
