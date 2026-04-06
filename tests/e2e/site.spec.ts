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

test("filters ecopoints and keeps the map interactive", async ({ page }) => {
  await page.goto("/ecopontos");
  await page.getByLabel("Buscar por endereço, bairro ou material").fill("Aviação");
  await expect(page.getByRole("heading", { name: "PEV da Secretaria Municipal de Meio Ambiente e Sustentabilidade" })).toBeVisible();
  await page.getByRole("button", { name: "Lâmpadas" }).click();
  await expect(page.getByRole("link", { name: "Abrir localização" })).toHaveCount(1);
});

test("serves public data APIs", async ({ request }) => {
  const ecopointsResponse = await request.get("/api/ecopoints");
  expect(ecopointsResponse.ok()).toBeTruthy();
  const resourcesResponse = await request.get("/api/resources");
  expect(resourcesResponse.ok()).toBeTruthy();
});

test("redirects legacy html routes", async ({ page }) => {
  await page.goto("/aracatuba.html");
  await expect(page).toHaveURL(/\/ecopontos$/);
});
