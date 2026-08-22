import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getDictionaryByLocale, locales } from "./dictionaries";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionaryByLocale(lang);
  return {
    title: dict?.meta.title,
    description: dict?.meta.description,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  return (
    <html lang={lang} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Navbar />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
