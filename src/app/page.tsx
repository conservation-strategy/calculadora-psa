"use client";

import Image from "next/image";
import { LanguageSelector } from "@/components/LanguageSelector";
import LanguageHtmlSync from "@/components/LanguageHtmlSync";
import PSAPerspective from "@/features/psa/PSAPerspective";
import { usePSAControls } from "@/features/psa/usePSAControls";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function PSAStandalonePage() {
  const { t } = useTranslation();
  const psaControls = usePSAControls();

  return (
    <main className="min-h-screen bg-gray-100">
      <LanguageHtmlSync />

      <div className="sticky top-0 z-50">
        <div className="w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-shrink-0">
                <Image
                  src="/LOGO BRAZIL CSF HORIZONTAL 2025.png"
                  alt="Logo Brazil CSF"
                  width={180}
                  height={60}
                  className="object-contain"
                  priority
                />
              </div>

              <h1 className="flex-1 text-center text-xl font-bold tracking-wide text-gray-800">{t.tabs.psa}</h1>

              <div className="flex-shrink-0 flex items-center gap-4">
                <LanguageSelector />
                <Image
                  src="/banco-mundial.jpg"
                  alt="Logo Banco Mundial"
                  width={60}
                  height={60}
                  className="object-contain"
                  priority
                />
                <Image
                  src="/sfb_logo.png"
                  alt="Logo SFB"
                  width={120}
                  height={60}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <PSAPerspective controls={psaControls} />
      </div>
    </main>
  );
}
