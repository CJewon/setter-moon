import { expect, type Page } from "@playwright/test";
import { getSharedTestAccount } from "../../test-utils/test-account";

const sharedTestAccount = getSharedTestAccount();

export async function signInAndEnsureStore(page: Page) {
  await page.goto("/sign-in");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("이메일").fill(sharedTestAccount.email);
  await page.locator('input[name="password"]').fill(sharedTestAccount.password);
  await expect(page.getByRole("button", { name: "로그인" })).toBeEnabled();

  const signInResponsePromise = page.waitForResponse((response) =>
    response.url().includes("/api/auth/sign-in") && response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "로그인" }).click();
  const signInResponse = await signInResponsePromise;

  expect(signInResponse.ok(), await signInResponse.text()).toBe(true);
  await page.waitForURL(/\/(dashboard|onboarding\/store)/);

  if (page.url().includes("/onboarding/store")) {
    await page.getByLabel("스토어명").fill("셀러룸 E2E 스토어");
    await page.getByLabel("주요 판매 채널").selectOption("스마트스토어");
    await page.getByRole("button", { name: "스토어 만들기" }).click();
    await page.waitForURL(/\/dashboard/);
  }

  await expect(page).toHaveURL(/\/dashboard/);
}
