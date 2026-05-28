import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

test.describe("상품 수정", () => {
  test("목록의 상품을 수정 화면에서 저장하고 상세로 돌아간다", async ({ page }) => {
    await signInAndEnsureStore(page);
    await page.goto("/products");

    const firstProductLink = page.locator('tbody a[href^="/products/"]').first();

    test.skip((await firstProductLink.count()) === 0, "상품 수정 E2E에 사용할 상품이 없습니다.");

    const productName = (await firstProductLink.textContent())?.trim() ?? "";
    await firstProductLink.click();
    await expect(page.getByRole("heading", { name: productName })).toBeVisible();

    await page.getByRole("link", { name: "상품 수정" }).click();
    await expect(page.getByRole("heading", { name: "상품 수정" })).toBeVisible();
    await expect(page.getByLabel("상품명")).toHaveValue(productName);

    const updateResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/products/") && response.request().method() === "PATCH"
    );

    await page.getByRole("button", { name: "상품 정보 저장" }).click();

    const updateResponse = await updateResponsePromise;
    const payload = (await updateResponse.json()) as {
      code: number;
      data?: { productId: string };
      message: string;
    };

    expect(updateResponse.ok(), JSON.stringify(payload)).toBe(true);
    expect(payload).toMatchObject({
      code: 200,
      message: "상품 정보를 저장했습니다."
    });
    await expect(page.getByText(payload.message).first()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/products/${payload.data?.productId}`));
  });
});
