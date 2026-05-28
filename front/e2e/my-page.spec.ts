import { expect, test, type Page } from "@playwright/test";
import { getSharedTestAccount } from "../test-utils/test-account";

const sharedTestAccount = getSharedTestAccount();

async function signIn(page: Page) {
  await page.goto("/sign-in");
  await page.getByLabel("이메일").fill(sharedTestAccount.email);
  await page.getByLabel("비밀번호").fill(sharedTestAccount.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL(/\/(dashboard|onboarding\/store)/);

  if (page.url().includes("/onboarding/store")) {
    await page.getByLabel("스토어명").fill("셀러룸 E2E 스토어");
    await page.getByLabel("주요 판매 채널").selectOption("스마트스토어");
    await page.getByRole("button", { name: "스토어 만들기" }).click();
    await page.waitForURL(/\/dashboard/);
  }
}

test.describe("마이페이지", () => {
  test("정보를 저장하고 새로고침 후 유지한다", async ({ page }) => {
    await signIn(page);
    await page.goto("/my-page");

    await expect(page.getByRole("heading", { name: "마이페이지" })).toBeVisible();
    await expect(page.getByText("현재 접속 계정")).toBeVisible();
    await expect(page.getByText("연결된 스토어")).toBeVisible();
    await expect(page.getByText("현재 플랜")).toBeVisible();
    await expect(page.getByText(/정상|한도 임박|한도 도달|한도 없음/).first()).toBeVisible();

    const saveButton = page.getByRole("button", { name: "변경사항 저장" });
    await expect(saveButton).toBeDisabled();
    await expect(page.getByText("변경사항 없음")).toBeVisible();

    const suffix = Date.now().toString().slice(-5);
    const displayName = `테스터 ${suffix}`;
    const storeName = `셀러룸 테스트 ${suffix}`;
    const memo = `마이페이지 E2E 저장 확인 ${suffix}`;

    await page.getByLabel("이름").fill(displayName);
    await page.getByLabel("스토어명").fill(storeName);
    await page.getByLabel("판매 채널").selectOption("스마트스토어");
    await page.getByLabel("메모").fill(memo);

    await expect(page.getByText("변경사항 있음")).toBeVisible();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(page.getByText("마이페이지 정보를 저장했습니다.")).toBeVisible();
    await expect(page.getByText("저장 완료")).toBeVisible();
    await expect(saveButton).toBeDisabled();

    await page.reload();
    await expect(page.getByLabel("이름")).toHaveValue(displayName);
    await expect(page.getByLabel("스토어명")).toHaveValue(storeName);
    await expect(page.getByLabel("판매 채널")).toHaveValue("스마트스토어");
    await expect(page.getByLabel("메모")).toHaveValue(memo);
    await expect(saveButton).toBeDisabled();
  });
});
