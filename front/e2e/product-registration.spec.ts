import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

test.describe("상품 등록 화면", () => {
  test("필수값 누락과 옵션 조합 미리보기를 확인한다", async ({ page }) => {
    await signInAndEnsureStore(page);
    await page.goto("/products/new");

    await page.getByRole("button", { name: "상품 등록하기" }).click();
    await expect(page.getByRole("main").getByText("상품 정보를 다시 확인해 주세요.")).toBeVisible();
    await expect(page.getByText("상품명을 입력하세요.")).toBeVisible();

    await page.getByRole("button", { name: "옵션을 나눠 등록" }).click();
    await expect(page.getByText("등록 예정 2개")).toBeVisible();
    await expect(page.getByText(/블랙/).first()).toBeVisible();
    await expect(page.getByText(/아이보리/).first()).toBeVisible();
  });
});
