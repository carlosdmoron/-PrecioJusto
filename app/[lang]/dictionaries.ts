import "server-only";
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import type es from "./dictionaries/es.json";

export type Dictionary = typeof es;

const dictionaries = {
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  it: () => import("./dictionaries/it.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
} as const;

export const locales = Object.keys(dictionaries) as Array<keyof typeof dictionaries>;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export function hasLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export async function getDictionaryByLocale(locale: string): Promise<Dictionary | null> {
  if (!hasLocale(locale)) return null;
  return dictionaries[locale]() as Promise<Dictionary>;
}

export async function getDictionary(): Promise<Dictionary> {
  const dictionary = await getDictionaryByLocale(await lang());
  if (!dictionary) notFound();
  return dictionary;
}
