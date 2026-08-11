import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page presents the brand and has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /wear the sparkle/i })).toBeVisible();
  await expect(page.getByText("Created by")).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
});

test("mobile menu opens, traps a usable navigation and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation menu" });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeHidden();
  await expect(toggle).toBeFocused();

  await toggle.click();
  await page.locator(".mobile-menu-layer").click({ position: { x: 2, y: 500 } });
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("mobile navigation handles anchors and desktop resize transitions", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation menu" });
  await toggle.click();
  await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator("#about")).toBeInViewport();
  await toggle.click();
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

for (const width of [320, 375, 430, 768, 1024, 1440]) {
  test(`layout has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 700 ? 800 : 900 });
    await page.goto("/shop");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    if (width <= 430) {
      const cards = page.locator(".product-card");
      await expect(cards.first()).toBeVisible();
      expect(await cards.first().boundingBox()).toMatchObject({ width: expect.any(Number) });
      const cardWidth = (await cards.first().boundingBox())!.width;
      expect(cardWidth).toBeLessThan(width * 0.58);
    }
  });
}

test("customer can filter, view a product and send a structured basket enquiry", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "open", {
      value: () => ({
        opener: null,
        close: () => undefined,
        location: {
          get href() { return "about:blank"; },
          set href(value: string) { (window as Window & { __lastOpened?: string }).__lastOpened = value; },
        },
      }),
    });
  });
  await page.goto("/shop");
  await page.getByRole("button", { name: "Earrings" }).click();
  await expect(page.getByText(/2 products/)).toBeVisible();
  const card = page.getByRole("article").filter({ hasText: "Gold-Tone Drop Earrings" });
  await card.getByRole("button", { name: /add to basket/i }).click();
  await expect(page.getByRole("dialog", { name: "WhatsApp basket" })).toBeVisible();
  await page.getByLabel("Your name").fill("Tariro");
  await page.getByLabel("Collection").check();
  await page.getByLabel("Optional note").fill("Gift packaging please");
  await page.getByRole("button", { name: /send order enquiry/i }).click();
  const opened = await page.evaluate(() => (window as Window & { __lastOpened?: string }).__lastOpened || "");
  expect(opened).toContain("https://wa.me/");
  expect(decodeURIComponent(opened)).toContain("Gold-Tone Drop Earrings");
  expect(decodeURIComponent(opened)).toContain("Tariro");
});

test("product options are required and out-of-stock variants cannot be ordered", async ({ page }) => {
  await page.goto("/products/minimal-fashion-ring");
  await expect(page.getByRole("heading", { name: "Minimal Fashion Ring" })).toBeVisible();
  await expect(page.getByLabel("Size 8")).toBeDisabled();
  await page.getByLabel("Size 7").check();
  await page.getByRole("button", { name: /add to basket/i }).click();
  await expect(page.getByRole("dialog", { name: "WhatsApp basket" })).toContainText("Size 7");
});

test("unconfigured owner route provides honest setup guidance", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: "Connect the owner studio." })).toBeVisible();
});
