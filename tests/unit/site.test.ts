import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPageJsonLd, buildPageMetadata, resolveSiteUrl } from "@/lib/site";

const originalSiteUrl = process.env.SITE_URL;
const originalVercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const originalVercelUrl = process.env.VERCEL_URL;

afterEach(() => {
  process.env.SITE_URL = originalSiteUrl;
  process.env.VERCEL_PROJECT_PRODUCTION_URL = originalVercelProductionUrl;
  process.env.VERCEL_URL = originalVercelUrl;
  vi.unstubAllEnvs();
});

describe("site helpers", () => {
  it("prefers SITE_URL when resolving the canonical base URL", () => {
    vi.stubEnv("SITE_URL", "https://example.org");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "project.vercel.app");

    expect(resolveSiteUrl().toString()).toBe("https://example.org/");
  });

  it("adds https when Vercel style hostnames do not include a protocol", () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "eco-tech.vercel.app");
    vi.stubEnv("VERCEL_URL", "");

    expect(resolveSiteUrl().toString()).toBe("https://eco-tech.vercel.app/");
  });

  it("builds canonical metadata for nested pages", () => {
    const metadata = buildPageMetadata("/ecopontos");

    expect(metadata.alternates?.canonical).toBe("/ecopontos");
    expect(metadata.openGraph?.url).toContain("/ecopontos");
    expect(metadata.twitter).toEqual(
      expect.objectContaining({
        card: "summary_large_image"
      })
    );
  });

  it("includes the page url and publisher in JSON-LD payloads", () => {
    const payload = buildPageJsonLd("/fontes");

    expect(payload.url).toContain("/fontes");
    expect(payload.publisher).toMatchObject({
      "@type": "Organization",
      name: "EcoTech"
    });
  });
});
