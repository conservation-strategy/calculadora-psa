import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/LanguageProvider";
import type { Language } from "@/lib/i18n/translations";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Calculadora PSA",
  description: "Calculadora para análise de custos de regularização ambiental",
};

const SUPPORTED_LANGUAGES: readonly Language[] = ["pt", "en"];
const localeByLanguage: Record<Language, string> = {
  pt: "pt-BR",
  en: "en-US",
};

function toLanguage(value: string | undefined): Language {
  return SUPPORTED_LANGUAGES.includes(value as Language)
    ? (value as Language)
    : "pt";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const language = toLanguage(cookieStore.get("lang")?.value);

  return (
    <html lang={localeByLanguage[language]}>
      <body className={inter.className}>
        <LanguageProvider language={language}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
