import type { Metadata, Viewport } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { MobileFloatingCta } from "@/components/common/mobile-floating-cta";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteConfig } from "@/lib/data";
import { resolveSiteUrl } from "@/lib/site";

const displayFont = Outfit({
  subsets: ["latin"],
  variable: "--font-display"
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: {
    default: "EcoTech",
    template: "%s"
  },
  description: "Projeto escolar sobre lixo eletrônico, descarte correto e ecopontos em Araçatuba-SP.",
  applicationName: "EcoTech",
  authors: [{ name: getSiteConfig().author }],
  icons: {
    icon: [
      { url: "/assets/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: "/assets/icon-192.png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = getSiteConfig();

  return (
    <html lang={config.language} className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="font-body antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-slate-950"
        >
          Pular para o conteúdo principal
        </a>
        <div className="pb-10">
          <SiteHeader brand={config.siteName} nav={config.nav} />
          <main id="main-content" className="space-y-10 pb-14 pt-2 md:space-y-16 md:pb-16 md:pt-3">
            {children}
          </main>
          <MobileFloatingCta />
          <SiteFooter
            brand={config.siteName}
            description={config.footerDescription}
            note={config.footerNote}
            nav={config.nav}
          />
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
