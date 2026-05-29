import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

const breakpoints = [
  { name: "mobile", width: 375, height: 812, minMainWidth: 320 },
  { name: "tablet", width: 768, height: 1024, minMainWidth: 700 },
  { name: "laptop", width: 1366, height: 768, minMainWidth: 1000 },
  { name: "desktop", width: 1920, height: 1080, minMainWidth: 1450 }
];

const dashboardScreens = ["/dashboard", "/products", "/inventory", "/orders"] as const;
const filterTestIds: Partial<Record<(typeof dashboardScreens)[number], string>> = {
  "/inventory": "inventory-list-filters",
  "/orders": "order-list-filters",
  "/products": "product-list-filters"
};

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

        const filterTestId = filterTestIds[screen];

        if (filterTestId) {
          const filter = page.getByTestId(filterTestId);
          await expect(filter).toBeVisible();

          const filterBox = await filter.boundingBox();
          expect(filterBox, `${breakpoint.name} ${screen} filter box should be measurable`).not.toBeNull();

          const controls = filter.locator("input, select, button, a");
          const controlCount = await controls.count();

          for (let index = 0; index < controlCount; index += 1) {
            const controlBox = await controls.nth(index).boundingBox();

            if (!controlBox || !filterBox) {
              continue;
            }

            expect(controlBox.x, `${breakpoint.name} ${screen} filter control should stay inside the left edge`).toBeGreaterThanOrEqual(
              filterBox.x - 1
            );
            expect(
              controlBox.x + controlBox.width,
              `${breakpoint.name} ${screen} filter control should stay inside the right edge`
            ).toBeLessThanOrEqual(filterBox.x + filterBox.width + 1);
          }
        }
      }
    }
  });
});
