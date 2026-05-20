import { NextRequest, NextResponse } from "next/server";

type Language = "pt" | "en";
const DEFAULT_LANGUAGE: Language = "pt";
const LANG_COOKIE = "lang";

function detectLanguage(acceptLanguage: string | null): Language {
  if (!acceptLanguage) return DEFAULT_LANGUAGE;

  for (const entry of acceptLanguage.split(",")) {
    const lang = entry.split(";")[0].trim().toLowerCase();
    if (lang.startsWith("en")) return "en";
    if (lang.startsWith("pt")) return "pt";
  }

  return DEFAULT_LANGUAGE;
}

export function middleware(request: NextRequest) {
  if (request.cookies.has(LANG_COOKIE)) {
    return NextResponse.next();
  }

  const language = detectLanguage(request.headers.get("accept-language"));
  const response = NextResponse.next();
  response.cookies.set(LANG_COOKIE, language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
