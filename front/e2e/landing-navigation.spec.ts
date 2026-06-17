import { expect, test, type Page } from "@playwright/test";

async function distanceFromViewportTop(page: Page, sectionId: string) {
  return page.evaluate((id) => {
    const target = document.getElementById(id);

    if (!target) {
      return Number.POSITIVE_INFINITY;
    }

    return Math.abs(target.getBoundingClientRect().top);
  }, sectionId);
}

test.describe("landing navigation", () => {
  test("moves to sections in the same order as the header menu", async ({ page }) => {
    await page.goto("/");

    const expectedAnchors = [
      { href: "/#intro", hash: "#intro", sectionId: "intro" },
      { href: "/#features", hash: "#features", sectionId: "features" },
      { href: "/#pricing", hash: "#pricing", sectionId: "pricing" }
    ];

    for (const anchor of expectedAnchors) {
      await page.locator(`header a[href="${anchor.href}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${anchor.hash}$`));
      await expect.poll(() => distanceFromViewportTop(page, anchor.sectionId)).toBeLessThan(180);
    }

    await expect(page.locator('header a[href="/#workflow"]')).toHaveCount(0);
    await expect(page.locator('header a[href="/#preview"]')).toHaveCount(0);
  });

  test("restores the hash section after returning from another page", async ({ page }) => {
    await page.goto("/");

    await page.locator('header a[href="/#pricing"]').click();
    await expect(page).toHaveURL(/#pricing$/);
    await expect.poll(() => distanceFromViewportTop(page, "pricing")).toBeLessThan(180);

    await page.locator('header a[href="/sign-in"]').first().click();
    await expect(page).toHaveURL(/\/sign-in$/);

    await page.goBack();
    await expect(page).toHaveURL(/#pricing$/);
    await expect.poll(() => distanceFromViewportTop(page, "pricing")).toBeLessThan(180);
  });
});
