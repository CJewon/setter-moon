import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

test.describe("마이페이지", () => {
  test("계정 정보를 저장하고 새로고침 후 유지한다", async ({ page }) => {
    await signInAndEnsureStore(page);
    await page.goto("/my-page");

    await expect(page.getByRole("heading", { name: "마이페이지" })).toBeVisible();
    await expect(page.getByText("현재 접속 계정")).toBeVisible();
    await expect(page.getByRole("heading", { name: "계정 정보" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "스토어 정보" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "플랜 설정" })).toHaveCount(0);

    const saveButton = page.getByRole("button", { name: "변경사항 저장" });
    await expect(saveButton).toBeDisabled();
    await expect(page.getByText("변경사항 없음")).toHaveCount(0);

    const suffix = Date.now().toString().slice(-5);
    const displayName = `테스터 ${suffix}`;

    await page.getByLabel("이름").fill(displayName);

    await expect(page.getByText("변경사항 있음")).toBeVisible();
    await expect(saveButton).toBeEnabled();

    const saveResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/my-page") && response.request().method() === "PATCH"
    );
    await saveButton.click();
    const saveResponse = await saveResponsePromise;
    const savePayload = (await saveResponse.json()) as { code: number; message: string };

    expect(saveResponse.ok(), JSON.stringify(savePayload)).toBe(true);
    expect(savePayload.code).toBe(200);
    await expect(page.getByText(savePayload.message)).toBeVisible();
    await expect(page.locator("#my-page-form").getByText("저장 완료")).toBeVisible();
    await expect(saveButton).toBeDisabled();

    await page.reload();
    await expect(page.getByLabel("이름")).toHaveValue(displayName);
    await expect(saveButton).toBeDisabled();
  });
});

test.describe("설정", () => {
  test("스토어 설정을 저장하고 새로고침 후 유지한다", async ({ page }) => {
    await signInAndEnsureStore(page);
    await page.goto("/settings");

    await expect(page.getByRole("heading", { name: "설정" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "스토어 정보" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "무료 한도 사용량" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "플랜 설정" })).toBeVisible();

    const saveButton = page.getByRole("button", { name: "변경사항 저장" });
    await expect(saveButton).toBeDisabled();

    const suffix = Date.now().toString().slice(-5);
    const storeName = `셀러룸 테스트 ${suffix}`;
    const memo = `설정 E2E 저장 확인 ${suffix}`;

    await page.getByLabel("스토어명").fill(storeName);
    await page.getByLabel("판매 채널").selectOption("스마트스토어");
    await page.getByLabel("운영 메모").fill(memo);

    await expect(page.getByText("변경사항 있음")).toBeVisible();
    await expect(saveButton).toBeEnabled();

    const saveResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/settings") && response.request().method() === "PATCH"
    );
    await saveButton.click();
    const saveResponse = await saveResponsePromise;
    const savePayload = (await saveResponse.json()) as { code: number; message: string };

    expect(saveResponse.ok(), JSON.stringify(savePayload)).toBe(true);
    expect(savePayload.code).toBe(200);
    await expect(page.getByText(savePayload.message)).toBeVisible();
    await expect(page.locator("#settings-form").getByText("저장 완료")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("스토어명")).toHaveValue(storeName);
    await expect(page.getByLabel("판매 채널")).toHaveValue("스마트스토어");
    await expect(page.getByLabel("운영 메모")).toHaveValue(memo);
    await expect(saveButton).toBeDisabled();
  });
});
