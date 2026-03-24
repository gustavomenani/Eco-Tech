const fs = require("fs/promises");
const path = require("path");
const { chromium } = require("playwright");

const baseUrl = (process.env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const outputDir = process.env.VISUAL_OUTPUT_DIR || path.join("artifacts", "visual");

const pages = [
  { slug: "home", url: "index.html", waitFor: ".hero-home-panel" },
  { slug: "sobre", url: "sobre.html", waitFor: ".page-hero-panel" },
  { slug: "solucoes", url: "solucoes.html", waitFor: ".page-hero-panel" },
  { slug: "ecopontos", url: "aracatuba.html", waitFor: "#ecopontos-map", readySelector: ".map-focus-card, .schematic-map" },
  { slug: "fontes", url: "contato-ou-fontes.html", waitFor: ".resource-grid" }
];

const viewports = [
  { slug: "desktop", width: 1440, height: 1200 },
  { slug: "mobile", width: 390, height: 844 }
];

async function capturePage(browser, pageConfig, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: "light",
    locale: "pt-BR",
    reducedMotion: "reduce"
  });

  const page = await context.newPage();
  const targetUrl = `${baseUrl}/${pageConfig.url}`;
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForSelector("main", { state: "visible", timeout: 15000 });
  await page.waitForSelector(pageConfig.waitFor, { state: "visible", timeout: 15000 });

  if (pageConfig.readySelector) {
    await page.waitForSelector(pageConfig.readySelector, { state: "visible", timeout: 15000 });
  }

  await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;}"
  });

  const outputPath = path.join(outputDir, `${pageConfig.slug}-${viewport.slug}.png`);
  await page.screenshot({ path: outputPath, fullPage: true, animations: "disabled" });
  await context.close();
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    for (const viewport of viewports) {
      for (const pageConfig of pages) {
        await capturePage(browser, pageConfig, viewport);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
