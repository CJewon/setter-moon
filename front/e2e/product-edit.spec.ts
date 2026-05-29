import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";
import { cleanupUnorderedE2EProducts, createEditableE2EProduct } from "./helpers/test-data";

test.describe.serial("상품 수정", () => {
  test.beforeAll(async () => {
    await cleanupUnorderedE2EProducts();
  });

  test.afterAll(async () => {
    await cleanupUnorderedE2EProducts();
  });

  test("상품 수정 화면에서 입력값 오류를 확인한다", async ({ page }) => {
    const fixture = await createEditableE2EProduct();

    if (!fixture) {
      test.skip(true, "상품 수정 E2E에 사용할 테스트 상품을 준비하지 못했습니다.");
      return;
    }

    await signInAndEnsureStore(page);
    await page.goto(`/products/${fixture.productId}/edit`);

    await expect(page.getByRole("heading", { name: "상품 수정" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "옵션과 재고는 이력과 함께 관리해요" })).toBeVisible();
    await expect(page.getByRole("link", { name: "재고 목록에서 조정" })).toBeVisible();
    await page.getByLabel("상품명").fill("   ");
    await page.getByLabel("기본 판매가").fill("-1");
    await page.getByRole("button", { name: "상품 정보 저장" }).click();

    await expect(page.getByRole("main").getByText("상품 정보를 다시 확인해 주세요.")).toBeVisible();
    await expect(page.getByText("상품명을 입력해 주세요.")).toBeVisible();
    await expect(page.getByText("판매가는 0원 이상이어야 합니다.")).toBeVisible();
  });

  test("상품 수정 화면에서 저장하고 상세와 목록에서 결과를 확인한다", async ({ page }) => {
    const fixture = await createEditableE2EProduct();

    if (!fixture) {
      test.skip(true, "상품 수정 E2E에 사용할 테스트 상품을 준비하지 못했습니다.");
      return;
    }

    await signInAndEnsureStore(page);
    await page.goto(`/products/${fixture.productId}`);
    await expect(page.getByRole("heading", { name: fixture.productName })).toBeVisible();

    await page.getByRole("link", { name: "상품 수정" }).click();
    await expect(page.getByRole("heading", { name: "상품 수정" })).toBeVisible();
    await expect(page.getByLabel("상품명")).toHaveValue(fixture.productName);
    await expect(page.getByRole("link", { name: "상품 상세에서 옵션 확인" })).toBeVisible();
    await expect(page.getByRole("link", { name: "새 상품으로 등록" })).toBeVisible();

    const updatedName = `${fixture.productName} 완료`;

    await page.getByLabel("상품명").fill(updatedName);
    await page.getByLabel("기본 판매가").fill("21000");
    await page.getByLabel("상품 메모").fill("상품 수정 E2E 저장 확인");

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
    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
    await expect(page.getByText("21,000원").first()).toBeVisible();

    await page.getByRole("link", { name: "상품 목록으로" }).click();
    await expect(page).toHaveURL(/\/products$/);
    await page.getByPlaceholder("상품명 검색").fill(updatedName);
    await page.getByRole("button", { name: "검색" }).click();
    await expect(page.getByRole("row").filter({ hasText: updatedName })).toBeVisible();
  });
});
