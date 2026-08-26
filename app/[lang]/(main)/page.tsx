import Hero from "../../components/Hero";
import ProBuscados from "../../components/ProBuscados";
import ServiciosBuscados from "../../components/ServiciosBuscados";
import FeaturesBand from "../../components/FeaturesBand";
import HowItWorks from "../../components/HowItWorks";
import CtaBanner from "../../components/CtaBanner";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <ProBuscados />
      <ServiciosBuscados />
      <FeaturesBand />
      <HowItWorks />
      <CtaBanner />
    </main>
  );
}
