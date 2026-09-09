import Hero from "../../components/Hero";
import ProBuscados from "../../components/ProBuscados";
import ServiciosBuscados from "../../components/ServiciosBuscados";
import ProfEnrollment from "../../components/professional/ProfEnrollment";
import FeaturesBand from "../../components/FeaturesBand";
import HowItWorks from "../../components/HowItWorks";
import CtaBanner from "../../components/CtaBanner";

// Renderizado dinámico: los nombres/descripciones de servicios dependen de la
// BD y se traducen on-demand (con caché persistida). Si fuera estático, el HTML
// quedaría horneado en build con el idioma que había en ese momento.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <ProBuscados />
      <ServiciosBuscados />
      <ProfEnrollment />
      <FeaturesBand />
      <HowItWorks />
      <CtaBanner />
    </main>
  );
}
