import { expect, test, type Page } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

async function selectFirstAvailableVariant(page: Page) {
  const productSelect = page.locator("#product-select");
  const productValues = await productSelect.locator("option").evaluateAll((options) =>
    options.map((option) => (option as HTMLOptionElement).value).filter(Boolean)
  );

  for (const productValue of productValues) {
    await productSelect.selectOption(productValue);

    const variantOption = await page.locator("#variant-select option").evaluateAll((options) => {
      const match = options
        .map((option) => ({
          text: (option as HTMLOptionElement).textContent ?? "",
          value: (option as HTMLOptionElement).value
        }))
        .find((option) => option.value && !option.text.includes("가용 0개"));

      return match?.value ?? "";
    });

    if (variantOption) {
      await page.locator("#variant-select").selectOption(variantOption);
      return;
    }
  }
}

test.describe.serial("주문 등록과 상태 변경", () => {
  test("작성 중인 주문 등록을 취소하면 목록으로 돌아간다", async ({ page }) => {
    await signInAndEnsureStore(page);
    await page.goto("/orders/new");

    test.skip(await page.getByText("주문할 상품이 없습니다").isVisible(), "주문 E2E에 사용할 상품이 없습니다.");

    const customerName = `취소 주문 ${Date.now().toString().slice(-6)}`;

    await page.getByLabel("고객명").fill(customerName);
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("link", { name: "취소" }).click();

    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByText(customerName)).toHaveCount(0);
  });

  test("주문접수 등록 후 배송대기로 변경한다", async ({ page }) => {
    await signInAndEnsureStore(page);
    await page.goto("/orders/new");

    test.skip(await page.getByText("주문할 상품이 없습니다").isVisible(), "주문 E2E에 사용할 상품이 없습니다.");

    await selectFirstAvailableVariant(page);
    test.skip((await page.locator("#variant-select").inputValue()) === "", "가용 재고가 있는 옵션 조합이 없습니다.");

    const suffix = Date.now().toString().slice(-6);

    await page.getByLabel("고객명").fill(`주문 테스트 ${suffix}`);
    await page.getByLabel("연락처").fill("010-0000-0000");
    await page.getByLabel("수량").fill("1");

    const createResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/orders") && response.request().method() === "POST"
    );

    await page.getByRole("button", { name: "주문접수로 등록" }).click();

    const createResponse = await createResponsePromise;
    const createPayload = (await createResponse.json()) as {
      code: number;
      data?: { orderId: string; orderNo: string };
      message: string;
    };

    test.skip(createPayload.code === 429, createPayload.message);
    expect(createResponse.ok(), JSON.stringify(createPayload)).toBe(true);
    expect(createPayload.code).toBe(200);
    expect(createPayload.data?.orderId).toBeTruthy();

    await expect(page.getByText(createPayload.message)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/orders/${createPayload.data?.orderId}`));
    await expect(page.getByRole("heading", { name: "주문 상세" })).toBeVisible();
    await expect(page.getByRole("link", { name: "주문 목록으로" })).toBeVisible();
    await expect(page.getByRole("link", { name: "주문 수정" })).toBeVisible();
    await expect(page.getByText("주문접수").first()).toBeVisible();

    const editedCustomerName = `수정 주문 ${suffix}`;

    await page.getByRole("link", { name: "주문 수정" }).click();
    await expect(page.getByRole("heading", { name: "주문 수정" })).toBeVisible();
    await page.getByLabel("고객명").fill(editedCustomerName);
    await page.getByLabel("메모").fill(`주문 수정 E2E ${suffix}`);

    const updateResponsePromise = page.waitForResponse((response) =>
      response.url().includes(`/api/orders/${createPayload.data?.orderId}`) && response.request().method() === "PATCH"
    );
    await page.getByRole("button", { name: "주문 정보 저장" }).click();

    const updateResponse = await updateResponsePromise;
    const updatePayload = (await updateResponse.json()) as {
      code: number;
      data?: { orderId: string };
      message: string;
    };

    expect(updateResponse.ok(), JSON.stringify(updatePayload)).toBe(true);
    expect(updatePayload).toMatchObject({
      code: 200,
      message: "주문 정보를 저장했습니다."
    });
    await expect(page.getByText(updatePayload.message).first()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/orders/${createPayload.data?.orderId}`));
    await expect(page.getByText(editedCustomerName)).toBeVisible();

    await page.getByRole("link", { name: "주문 목록으로" }).click();
    await expect(page).toHaveURL(/\/orders$/);

    await page.getByPlaceholder("고객명 또는 주문번호").fill(editedCustomerName);
    await page.getByRole("button", { name: "검색" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/customerKeyword=/);
    await expect(page.getByText(editedCustomerName)).toBeVisible();

    await page.getByLabel(`${createPayload.data?.orderNo ?? ""} 선택`).click();
    await expect(page.getByText("선택 1건")).toBeVisible();
    await expect(page.getByRole("button", { name: "배송대기" })).toBeEnabled();
    page.once("dialog", (dialog) => dialog.accept());
    const statusResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/orders/bulk-status") && response.request().method() === "PATCH"
    );

    await page.getByRole("button", { name: "배송대기" }).click();

    const statusResponse = await statusResponsePromise;
    const statusPayload = (await statusResponse.json()) as {
      code: number;
      message: string;
    };

    expect(statusResponse.ok(), JSON.stringify(statusPayload)).toBe(true);
    expect(statusPayload.code).toBe(200);
    await expect(page.getByText(statusPayload.message)).toBeVisible();
    await expect(page.getByText("배송대기").first()).toBeVisible();

    await page.goto("/inventory/movements");
    await expect(page.getByRole("heading", { name: "재고 이력" })).toBeVisible();
    await expect(page.getByText("판매 차감").first()).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible();
    await expect(page.getByText(editedCustomerName).first()).toBeVisible();
    await expect(page.getByText("배송대기").first()).toBeVisible();

    await page.goto(`/orders/${createPayload.data?.orderId}`);
    await expect(page.getByRole("heading", { name: "주문 상세" })).toBeVisible();
    await expect(page.getByText("취소는 SellerRoom 안에서 주문 상태만 바꾸는 기능입니다.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "상태 변경 이력" })).toBeVisible();
    await expect(page.getByText("주문접수").first()).toBeVisible();
    await expect(page.getByText("배송대기").first()).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    const cancelResponsePromise = page.waitForResponse((response) =>
      response.url().includes(`/api/orders/${createPayload.data?.orderId}/status`) && response.request().method() === "PATCH"
    );
    await page.getByRole("button", { name: "취소" }).click();

    const cancelResponse = await cancelResponsePromise;
    const cancelPayload = (await cancelResponse.json()) as {
      code: number;
      message: string;
    };

    expect(cancelResponse.ok(), JSON.stringify(cancelPayload)).toBe(true);
    expect(cancelPayload.code).toBe(200);
    await expect(page.getByText(cancelPayload.message)).toBeVisible();
    await expect(page.getByText("취소").first()).toBeVisible();

    await page.goto("/inventory/movements");
    await expect(page.getByText("취소 복구").first()).toBeVisible();
  });
});
