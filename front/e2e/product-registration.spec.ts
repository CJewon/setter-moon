import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

test.describe.serial("상품 등록 화면", () => {
  test("작성 중인 상품 등록을 취소하면 목록으로 돌아간다", async ({ page }) => {
    await signInAndEnsureStore(page);
    await page.goto("/products/new");

    const productName = `취소 상품 ${Date.now().toString().slice(-6)}`;

    await page.getByLabel("상품명").fill(productName);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("link", { name: "취소" }).click();

    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByText(productName)).toHaveCount(0);
  });

  test("필수값 누락과 옵션 조합 미리보기를 확인한다", async ({ page }) => {
    await signInAndEnsureStore(page);
    await page.goto("/products/new");

    const submitButton = page.getByRole("button", { name: "상품 등록" });

    test.skip(await submitButton.isDisabled(), "테스트 계정이 무료 플랜 상품 또는 옵션 조합 한도에 도달했습니다.");

    await submitButton.click();
    await expect(page.getByRole("main").getByText("상품 정보를 다시 확인해 주세요.")).toBeVisible();
    await expect(page.getByText("상품명을 입력하세요.")).toBeVisible();

    await page.getByRole("button", { name: "옵션을 나눠 등록" }).click();
    await expect(page.getByText("등록할 옵션 조합 2개")).toBeVisible();
    await expect(page.getByText(/블랙/).first()).toBeVisible();
    await expect(page.getByText(/아이보리/).first()).toBeVisible();
  });

  test("옵션 상품 등록 후 상세와 목록에서 저장 결과를 확인한다", async ({ page }) => {
    await signInAndEnsureStore(page);
    await page.goto("/products/new");

    await expect(page.getByRole("heading", { name: "상품 등록" })).toBeVisible();

    const suffix = Date.now().toString().slice(-6);
    const productName = `E2E 옵션 상품 ${suffix}`;

    await page.getByLabel("상품명").fill(productName);
    await page.getByLabel("기본 판매가").fill("29000");
    await page.getByLabel("기본 원가").fill("12000");
    await page.getByLabel("상품 메모").fill(`상품 등록 E2E 확인 ${suffix}`);
    await page.getByRole("button", { name: "옵션을 나눠 등록" }).click();

    await expect(page.getByText("등록할 옵션 조합 2개")).toBeVisible();
    await expect(page.getByText("블랙").first()).toBeVisible();
    await expect(page.getByText("아이보리").first()).toBeVisible();

    await page.getByLabel("현재 재고").nth(0).fill("7");
    await page.getByLabel("안전 재고").nth(0).fill("2");
    await page.getByLabel("현재 재고").nth(1).fill("3");
    await page.getByLabel("안전 재고").nth(1).fill("1");

    const submitButton = page.getByRole("button", { name: "상품 등록" });

    test.skip(await submitButton.isDisabled(), "테스트 계정이 무료 플랜 상품 또는 옵션 조합 한도에 도달했습니다.");

    const createResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/products") && response.request().method() === "POST"
    );

    await submitButton.click();

    const createResponse = await createResponsePromise;
    const createPayload = (await createResponse.json()) as {
      code: number;
      data?: { productId: string };
      message: string;
    };

    test.skip(createPayload.code === 429, createPayload.message);
    expect(createResponse.ok(), JSON.stringify(createPayload)).toBe(true);
    expect(createPayload).toMatchObject({
      code: 200,
      message: "상품을 등록했습니다."
    });
    expect(createPayload.data?.productId).toBeTruthy();

    await expect(page.getByText("상품을 등록했습니다.")).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/products/${createPayload.data?.productId}`));
    await expect(page.getByRole("heading", { name: productName })).toBeVisible();
    await expect(page.getByRole("link", { name: "상품 목록으로" })).toBeVisible();
    await expect(page.getByRole("link", { name: "상품 수정" })).toBeVisible();

    await expect(page.getByRole("columnheader", { name: "옵션 조합" })).toBeVisible();
    await expect(page.getByText("2개").first()).toBeVisible();
    await expect(page.getByRole("cell", { name: "블랙" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "아이보리" })).toBeVisible();
    await expect(page.getByRole("row", { name: /블랙.*29,000원.*7개.*0개.*7개.*2개/ })).toBeVisible();
    await expect(page.getByRole("row", { name: /아이보리.*29,000원.*3개.*0개.*3개.*1개/ })).toBeVisible();

    await page.getByLabel("판매상태").selectOption("sold_out");
    const statusResponsePromise = page.waitForResponse((response) =>
      response.url().includes(`/api/products/${createPayload.data?.productId}`) && response.request().method() === "PATCH"
    );
    await page.getByRole("button", { name: "판매상태 변경" }).click();
    const statusResponse = await statusResponsePromise;
    const statusPayload = (await statusResponse.json()) as {
      code: number;
      message: string;
    };

    expect(statusResponse.ok(), JSON.stringify(statusPayload)).toBe(true);
    expect(statusPayload).toMatchObject({
      code: 200,
      message: "상품 정보를 저장했습니다."
    });
    await expect(page.getByText("품절").first()).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    const hideResponsePromise = page.waitForResponse((response) =>
      response.url().includes(`/api/products/${createPayload.data?.productId}`) && response.request().method() === "PATCH"
    );
    await page.getByRole("button", { name: "상품 숨김 처리" }).click();
    const hideResponse = await hideResponsePromise;
    const hidePayload = (await hideResponse.json()) as {
      code: number;
      message: string;
    };

    expect(hideResponse.ok(), JSON.stringify(hidePayload)).toBe(true);
    expect(hidePayload).toMatchObject({
      code: 200,
      message: "상품 정보를 저장했습니다."
    });
    await expect(page.getByText("숨김").first()).toBeVisible();

    await page.getByRole("link", { name: "상품 목록으로" }).click();
    await expect(page).toHaveURL(/\/products$/);

    const productRow = page.getByRole("row").filter({ hasText: productName });

    await expect(productRow.getByRole("link", { name: productName })).toBeVisible();
    await expect(productRow).toContainText("숨김");
    await expect(productRow).toContainText("2개");
    await expect(productRow).toContainText("10개");
    await expect(productRow).toContainText("29,000원");
  });
});
