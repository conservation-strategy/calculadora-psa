import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "@/lib/i18n/translations";

const DEFAULT_LANGUAGE: Language = "pt";
const STORAGE_KEY = "language-storage";
const supportedLanguages: readonly Language[] = ["pt", "en"];

function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" &&
    supportedLanguages.includes(value as Language)
  );
}

function detectLanguageFromBrowser(): Language {
  if (typeof navigator === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const primary = navigator.language?.toLowerCase() ?? "";
  if (primary.startsWith("en")) return "en";
  if (primary.startsWith("pt")) return "pt";

  const candidates =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];

  for (const candidate of candidates) {
    const normalized = candidate.toLowerCase();
    if (normalized.startsWith("en")) return "en";
    if (normalized.startsWith("pt")) return "pt";
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Synchronously reads persisted language state from localStorage.
 * This runs at module load time (before any render) to ensure the
 * first paint already has the resolved language.
 */
function resolveInitialLanguage(): { language: Language; hasUserOverride: boolean } {
  if (typeof window === "undefined") {
    return { language: DEFAULT_LANGUAGE, hasUserOverride: false };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: Partial<LanguageState> };
      const persistedLang = parsed?.state?.language;
      const persistedOverride = parsed?.state?.hasUserOverride;

      if (isLanguage(persistedLang)) {
        const hasUserOverride =
          typeof persistedOverride === "boolean" ? persistedOverride : true;

        if (hasUserOverride) {
          return { language: persistedLang, hasUserOverride: true };
        }
      }
    }
  } catch {
    // Corrupted storage — fall through to browser detection.
  }

  return { language: detectLanguageFromBrowser(), hasUserOverride: false };
}

interface LanguageState {
  language: Language;
  hasUserOverride: boolean;
  setLanguage: (lang: Language) => void;
  clearLanguageOverride: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      ...resolveInitialLanguage(),
      setLanguage: (lang) =>
        set({
          language: isLanguage(lang) ? lang : DEFAULT_LANGUAGE,
          hasUserOverride: true,
        }),
      clearLanguageOverride: () =>
        set({
          language: detectLanguageFromBrowser(),
          hasUserOverride: false,
        }),
    }),
    {
      name: STORAGE_KEY,
      // Prevent async rehydration from overriding the synchronously
      // resolved initial state. We already read localStorage in
      // resolveInitialLanguage() at store creation time, so persist
      // only needs to *write* state changes — never re-read.
      skipHydration: true,
    }
  )
);
