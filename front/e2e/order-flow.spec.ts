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

    await page.getByRole("button", { name: "주문 등록" }).click();

    const createResponse = await createResponsePromise;
    const createPayload = (await createResponse.json()) as {
      code: number;
      data?: { orderId: string };
      message: string;
    };

    test.skip(createPayload.code === 429, createPayload.message);
    expect(createResponse.ok(), JSON.stringify(createPayload)).toBe(true);
    expect(createPayload.code).toBe(200);
    expect(createPayload.data?.orderId).toBeTruthy();

    await expect(page.getByText(createPayload.message)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/orders/${createPayload.data?.orderId}`));
    await expect(page.getByRole("heading", { name: "주문 상세" })).toBeVisible();
    await expect(page.getByText("주문접수").first()).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    const statusResponsePromise = page.waitForResponse(
      (response) => response.url().includes(`/api/orders/${createPayload.data?.orderId}/status`) && response.request().method() === "PATCH"
    );

    await page.getByRole("button", { name: "배송대기로 변경" }).click();

    const statusResponse = await statusResponsePromise;
    const statusPayload = (await statusResponse.json()) as {
      code: number;
      message: string;
    };

    expect(statusResponse.ok(), JSON.stringify(statusPayload)).toBe(true);
    expect(statusPayload.code).toBe(200);
    await expect(page.getByText(statusPayload.message)).toBeVisible();
    await expect(page.getByText("배송대기").first()).toBeVisible();
  });
});
