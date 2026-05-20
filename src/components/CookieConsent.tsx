"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const CONSENT_KEY = "cookie-consent-accepted";

export default function CookieConsent() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function accept() {
    localStorage.setItem(CONSENT_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] flex items-end justify-center p-4 sm:items-center">
      {/* backdrop */}
      {/* <div className="absolute inset-0 bg-black/30" aria-hidden="true" /> */}

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.cookie.message}
        className="relative w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-black/5 p-6 flex flex-col gap-4"
      >
        {/* cookie icon */}
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🍪</span>
          <p className="text-sm text-gray-700 leading-relaxed">
            {t.cookie.message}
          </p>
        </div>

        <button
          onClick={accept}
          className="w-full self-end px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          {t.cookie.accept}
        </button>
      </div>
    </div>
  );
}
