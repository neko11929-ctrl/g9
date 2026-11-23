import type { Metadata, Viewport } from "next";
import { Marcellus, Manrope, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/locale";
import { LangProvider } from "@/components/LangProvider";
import { siteUrl } from "@/lib/util";
import { translate } from "@/lib/i18n";

const display = Marcellus({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const arabic = Noto_Kufi_Arabic({ subsets: ["arabic"], variable: "--font-arabic", display: "swap" });

export const viewport: Viewport = { themeColor: "#06040c", width: "device-width", initialScale: 1 };

export function generateMetadata(): Metadata {
  const lang = getLang();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: "NOCTIVA — " + translate(lang, "slogan"), template: "%s | NOCTIVA" },
    description: translate(lang, "metaDescription"),
    openGraph: { siteName: "NOCTIVA", type: "website", title: "NOCTIVA", description: translate(lang, "metaDescription") },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "/" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getLang();
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className={`${display.variable} ${body.variable} ${arabic.variable}`}>
      <body>
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
