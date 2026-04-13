import type { Metadata } from "next";
import { getPageSeo, getSiteConfig } from "@/lib/data";

export function resolveSiteUrl(): URL {
  const config = getSiteConfig();
  const envValue =
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    config.siteUrl;
  const withProtocol = /^https?:\/\//.test(envValue) ? envValue : `https://${envValue}`;

  return new URL(withProtocol.endsWith("/") ? withProtocol : `${withProtocol}/`);
}

export function absoluteAssetUrl(assetPath: string): string {
  return new URL(assetPath.replace(/^\//, ""), resolveSiteUrl()).toString();
}

export function buildPageMetadata(path: string): Metadata {
  const config = getSiteConfig();
  const page = getPageSeo(path);
  const canonical =
    path === "/" ? resolveSiteUrl().toString() : new URL(path.replace(/^\//, ""), resolveSiteUrl()).toString();
  const socialImage = absoluteAssetUrl(config.socialImage);

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: path
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website",
      url: canonical,
      siteName: config.siteName,
      locale: "pt_BR",
      images: [
        {
          url: socialImage,
          alt: config.socialImageAlt
        }
      ]
    },
    twitter: {
      card: config.twitterCard,
      title: page.title,
      description: page.description,
      images: [
        {
          url: socialImage,
          alt: config.socialImageAlt
        }
      ]
    }
  };
}

export function buildPageJsonLd(path: string, extra: Record<string, unknown> = {}) {
  const config = getSiteConfig();
  const page = getPageSeo(path);
  const pageUrl = path === "/" ? resolveSiteUrl().toString() : new URL(path.replace(/^\//, ""), resolveSiteUrl()).toString();

  return {
    "@context": "https://schema.org",
    "@type": page.schemaType,
    name: page.title,
    description: page.description,
    url: pageUrl,
    inLanguage: config.language,
    isPartOf: {
      "@type": "WebSite",
      name: config.siteName,
      url: resolveSiteUrl().toString()
    },
    publisher: {
      "@type": "Organization",
      name: config.organizationName
    },
    ...extra
  };
}
