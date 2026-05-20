"use client";

import { useLanguageStore } from "@/lib/state/languageStore";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <button
        onClick={() => setLanguage("pt")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          language === "pt"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="Português"
      >
        PT
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          language === "en"
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
