"use client";

import { createContext, useContext } from "react";
import type { Language } from "@/lib/i18n/translations";

const LanguageContext = createContext<Language>("pt");

export function useLanguageContext(): Language {
  return useContext(LanguageContext);
}

export function LanguageProvider({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  );
}
