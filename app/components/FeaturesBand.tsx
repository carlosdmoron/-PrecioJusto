import { getDictionary } from "../[lang]/dictionaries";
import FeaturesBandInteractive from "./FeaturesBandInteractive";

const icons = [
  {
    label: "shield-check",
    path: "M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z",
  },
  {
    label: "zap",
    path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  },
  {
    label: "home",
    path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  },
  {
    label: "users",
    path: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  },
];

export default async function FeaturesBand() {
  const dict = await getDictionary();
  const features = dict.features.map((f, i) => ({
    ...f,
    icon: icons[i],
  }));
  return <FeaturesBandInteractive sectionTitle={dict.featuresSection.title} features={features} />;
}
