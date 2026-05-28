import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

const protectedScreens = [
  { path: "/dashboard", heading: "대시보드", visibleText: "오늘 주문" },
  { path: "/products", heading: "상품", visibleText: "상품 등록" },
  { path: "/products/new", heading: "상품 등록", visibleText: "상품 기본 정보" },
  { path: "/products/e2e-product/edit", heading: "상품 수정", visibleText: "상품 기본 정보 수정 폼" },
  { path: "/inventory", heading: "재고", visibleText: "현재 재고" },
  { path: "/inventory/low-stock", heading: "재고 부족", visibleText: "재고 부족 옵션 조합 목록" },
  { path: "/inventory/movements", heading: "재고 이력", visibleText: "재고 변경 이력 테이블" },
  { path: "/orders", heading: "주문", visibleText: "주문 등록" },
  { path: "/orders/new", heading: "주문 등록", visibleText: "고객명" },
  { path: "/orders/e2e-order", heading: "주문 상세", visibleText: "상태 변경" },
  { path: "/categories", heading: "카테고리", visibleText: "카테고리 목록" },
  { path: "/settings", heading: "설정", visibleText: "스토어 설정 폼" },
  { path: "/my-page", heading: "마이페이지", visibleText: "현재 접속 계정" }
];

test.describe("현재 구현 화면 E2E", () => {
  test("공개 화면이 렌더링된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "주문과 재고를 한 화면에서 덜 헷갈리게" })).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "로그인" })).toBeVisible();
    await expect(page.getByRole("link", { name: /무료로 시작/ }).first()).toBeVisible();

    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: "계정 만들기" })).toBeVisible();
    await expect(page.getByLabel("이름")).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
  });

  test("테스트 계정으로 현재 개발된 인증 화면을 모두 진입한다", async ({ page }) => {
    await signInAndEnsureStore(page);

    for (const screen of protectedScreens) {
      await page.goto(screen.path);
      await expect(page.getByRole("heading", { name: screen.heading, exact: true })).toBeVisible();
      await expect(page.getByText(screen.visibleText).first()).toBeVisible();
    }
  });

  test("사용자 메뉴에서 마이페이지 이동과 로그아웃이 동작한다", async ({ page }) => {
    await signInAndEnsureStore(page);

    await page.locator('header button[aria-haspopup="menu"]').last().click();
    await page.getByRole("menuitem", { name: "마이페이지" }).click();
    await expect(page).toHaveURL(/\/my-page/);
    await expect(page.getByRole("heading", { name: "마이페이지" })).toBeVisible();

    await page.locator('header button[aria-haspopup="menu"]').last().click();
    await page.getByRole("menuitem", { name: "로그아웃" }).click();
    await page.waitForURL("/");
    await expect(page.getByRole("heading", { name: "주문과 재고를 한 화면에서 덜 헷갈리게" })).toBeVisible();
  });
});
