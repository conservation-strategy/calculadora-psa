"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function LanguageHtmlSync() {
  const { locale } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
