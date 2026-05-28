import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

const breakpoints = [
  { name: "mobile", width: 375, height: 812, minMainWidth: 320 },
  { name: "tablet", width: 768, height: 1024, minMainWidth: 700 },
  { name: "laptop", width: 1366, height: 768, minMainWidth: 1000 },
  { name: "desktop", width: 1920, height: 1080, minMainWidth: 1450 }
];

const dashboardScreens = ["/dashboard", "/products", "/inventory", "/orders"] as const;

test.describe("dashboard responsive layout", () => {
  test("keeps dashboard, products, inventory, and orders usable across core breakpoints", async ({ page }) => {
    await signInAndEnsureStore(page);

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });

      for (const screen of dashboardScreens) {
        await page.goto(screen);
        await expect(page.locator("main")).toBeVisible();

        const layout = await page.evaluate(() => {
          const main = document.querySelector("main");
          const mainRect = main?.getBoundingClientRect();

          return {
            documentWidth: document.documentElement.scrollWidth,
            mainWidth: mainRect?.width ?? 0,
            viewportWidth: window.innerWidth
          };
        });

        expect(layout.documentWidth, `${breakpoint.name} ${screen} should not create page-level horizontal overflow`).toBeLessThanOrEqual(
          layout.viewportWidth + 2
        );
        expect(layout.mainWidth, `${breakpoint.name} ${screen} should use enough usable width`).toBeGreaterThanOrEqual(
          breakpoint.minMainWidth
        );
      }
    }
  });
});
