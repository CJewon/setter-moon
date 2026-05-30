import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

const protectedRoutes = ["/dashboard", "/products", "/inventory", "/orders", "/my-page", "/settings"] as const;

const jsonApiRoutes = [
  "/api/auth/session",
  "/api/dashboard",
  "/api/products?page=1&pageSize=10",
  "/api/inventory?page=1&pageSize=10",
  "/api/orders?page=1&pageSize=10",
  "/api/my-page",
  "/api/settings"
] as const;

test.describe("deploy smoke", () => {
  test("checks landing, auth, core pages, JSON APIs, and sign-out", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("link", { name: "SellerRoom" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /주문과 재고를/ })).toBeVisible();
    await expect(page.locator("body")).not.toContainText("404: This page could not be found.");

    await signInAndEnsureStore(page);

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("body"), route).not.toContainText("404: This page could not be found.");
    }

    const apiResults = await page.evaluate(async (urls) => {
      return Promise.all(
        urls.map(async (url) => {
          const response = await fetch(url);
          const contentType = response.headers.get("content-type") ?? "";
          const body = await response.json().catch(() => null);

          return {
            body,
            contentType,
            status: response.status,
            url
          };
        })
      );
    }, jsonApiRoutes);

    for (const result of apiResults) {
      expect(result.status, result.url).toBe(200);
      expect(result.contentType, result.url).toContain("application/json");
      expect(result.body, result.url).toEqual(
        expect.objectContaining({
          code: 200,
          data: expect.anything(),
          message: expect.any(String)
        })
      );
    }

    await page.goto("/dashboard");
    await page.locator('header button[aria-haspopup="menu"]').last().click();
    await page.getByRole("menuitem").last().click();
    await page.waitForURL("/");
    await expect(page.locator("main")).toBeVisible();
  });
});
