import { expect, test } from "@playwright/test";

test("navigates through the main pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("EcoTech");

  const menuButton = page.getByRole("button", { name: /menu principal/i });

  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
  }

  await page.getByRole("banner").getByRole("link", { name: "Sobre" }).click();
  await expect(page).toHaveURL(/\/sobre$/);

  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
  }

  await page.getByRole("banner").getByRole("link", { name: "Soluções" }).click();
  await expect(page).toHaveURL(/\/solucoes$/);
});

test("closes the mobile menu after route navigation", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation behavior only applies to the mobile project.");

  await page.goto("/");
  const menuButton = page.locator('button[aria-controls="site-menu"]');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");

  await page.getByRole("banner").getByRole("link", { name: "Projeto" }).click();
  await expect(page).toHaveURL(/\/projeto$/);
  await expect(page.getByRole("button", { name: /menu principal/i })).toHaveAttribute("aria-expanded", "false");
});

test("filters ecopoints and keeps the map interactive", async ({ page }) => {
  await page.goto("/ecopontos");
  await page.getByRole("searchbox", { name: /buscar por endereço/i }).fill("Aviacao");
  await expect(page.getByRole("heading", { name: "PEV da Secretaria Municipal de Meio Ambiente e Sustentabilidade" })).toBeVisible();
  await page.getByRole("button", { name: "Lâmpadas" }).click();
  await expect(page.getByRole("link", { name: "Abrir localização" })).toHaveCount(1);
});

test("filters ecopoints by city without losing the visible result", async ({ page }) => {
  await page.goto("/ecopontos");
  await page.getByRole("combobox", { name: "Cidade" }).selectOption("Birigui-SP");
  await expect(page.locator("article span", { hasText: "Birigui-SP" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir localização" })).toHaveCount(1);
});

test("renders the QR panel on the home page and the sources page content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /EcoTech: tecnologia consciente/i })).toBeVisible();
  await expect(page.getByLabel("QR code do site")).toBeVisible();

  await page.goto("/fontes");
  await expect(page.getByRole("heading", { name: /informação, prática e conscientização ambiental/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /assistir vídeo/i }).first()).toBeVisible();
});

test("serves public data APIs", async ({ request }) => {
  const ecopointsResponse = await request.get("/api/ecopoints");
  expect(ecopointsResponse.ok()).toBeTruthy();
  const ecopointsJson = await ecopointsResponse.json();
  expect(ecopointsJson.points.length).toBeGreaterThan(0);
  expect(ecopointsJson.materialsCatalog.length).toBeGreaterThan(0);

  const resourcesResponse = await request.get("/api/resources");
  expect(resourcesResponse.ok()).toBeTruthy();
  const resourcesJson = await resourcesResponse.json();
  expect(resourcesJson.items.length).toBeGreaterThan(0);
  expect(resourcesJson.sourcesVideoIds.length).toBeGreaterThan(0);
});

test("redirects legacy html routes", async ({ page }) => {
  await page.goto("/aracatuba.html");
  await expect(page).toHaveURL(/\/ecopontos$/);
});
