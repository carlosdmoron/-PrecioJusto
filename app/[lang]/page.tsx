import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";
import FeaturesBand from "../components/FeaturesBand";
import HowItWorks from "../components/HowItWorks";
import CtaBanner from "../components/CtaBanner";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <ProductGrid />
      <FeaturesBand />
      <HowItWorks />
      <CtaBanner />
    </main>
  );
}
