import { useLanguageStore } from "../state/languageStore";
import { useLanguageContext } from "@/components/LanguageProvider";
import { useMemo, useCallback } from "react";
import {
  translations,
  type Language,
  type TranslationKey,
  type TranslationKeys,
} from "./translations";

const DEFAULT_LANGUAGE: Language = "pt";
const intlLocaleMap: Record<Language, "pt-BR" | "en-US"> = {
  pt: "pt-BR",
  en: "en-US",
};

export type TranslationParams = Record<string, string | number>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mergeWithFallback<T extends Record<string, unknown>>(
  fallback: T,
  active: Partial<T> | undefined
): T {
  const result: Record<string, unknown> = { ...fallback };

  if (!active) {
    return result as T;
  }

  for (const key of Object.keys(fallback)) {
    const fallbackValue = fallback[key];
    const activeValue = (active as Record<string, unknown>)[key];

    if (isObject(fallbackValue)) {
      result[key] = mergeWithFallback(
        fallbackValue,
        isObject(activeValue) ? (activeValue as Partial<typeof fallbackValue>) : undefined
      );
      continue;
    }

    result[key] = activeValue ?? fallbackValue;
  }

  return result as T;
}

export function useTranslation() {
  const contextLanguage = useLanguageContext();
  const storeLanguage = useLanguageStore((state) => state.language);
  const hasUserOverride = useLanguageStore((state) => state.hasUserOverride);

  const language = hasUserOverride ? storeLanguage : contextLanguage;
  const safeLanguage = language in translations ? language : DEFAULT_LANGUAGE;

  const t = useMemo(
    () => mergeWithFallback(translations[DEFAULT_LANGUAGE], translations[safeLanguage]),
    [safeLanguage]
  );

  const tr = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      const template = getNestedTranslation(t, key) ?? key;
      return interpolateTranslation(template, params);
    },
    [t]
  );

  return {
    t: t as TranslationKeys,
    tr,
    language: safeLanguage,
    locale: intlLocaleMap[safeLanguage],
  };
}

export function getNestedTranslation(
  obj: Record<string, unknown>,
  path: string
): string | undefined {
  const value = path
    .split(".")
    .reduce<unknown>((current, key) => (isObject(current) ? current[key] : undefined), obj);

  return typeof value === "string" ? value : undefined;
}

export function interpolateTranslation(
  template: string,
  params?: TranslationParams
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{([^}]+)\}/g, (_, token: string) => {
    const trimmedToken = token.trim();
    const value = params[trimmedToken];
    return value === undefined ? `{${trimmedToken}}` : String(value);
  });
}
