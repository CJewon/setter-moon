import { expect, test } from "@playwright/test";

test.describe("landing navigation", () => {
  test("moves to sections in the same order as the header menu", async ({ page }) => {
    await page.goto("/");

    const expectedAnchors = [
      { label: "소개", hash: "#intro" },
      { label: "기능", hash: "#features" },
      { label: "운영 흐름", hash: "#workflow" },
      { label: "요금", hash: "#pricing" }
    ];

    for (const anchor of expectedAnchors) {
      await page.getByRole("link", { name: anchor.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${anchor.hash}$`));
    }

    await expect(page.getByRole("link", { name: "화면", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "가격", exact: true })).toHaveCount(0);
  });
});
