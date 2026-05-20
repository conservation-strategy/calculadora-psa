"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/lib/state/languageStore";

const localeByLanguage = {
  pt: "pt-BR",
  en: "en-US",
} as const;

export default function LanguageHtmlSync() {
  const language = useLanguageStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = localeByLanguage[language] ?? "pt-BR";
  }, [language]);

  return null;
}
