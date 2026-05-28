import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

const protectedScreens = [
  { path: "/dashboard", heading: "대시보드", visibleText: "오늘 주문" },
  { path: "/products", heading: "상품", visibleText: "상품 등록" },
  { path: "/products/new", heading: "상품 등록", visibleText: "상품 기본 정보" },
  { path: "/products/e2e-product/edit", heading: "상품 수정", visibleText: "현재는 상품 상세에서 등록된 정보를 확인할 수 있습니다." },
  { path: "/inventory", heading: "재고", visibleText: "현재 재고" },
  { path: "/inventory/low-stock", heading: "재고 부족", visibleText: "현재 재고 부족 옵션 조합이 없습니다." },
  { path: "/inventory/movements", heading: "재고 이력", visibleText: "아직 재고 변경 이력이 없습니다." },
  { path: "/orders", heading: "주문", visibleText: "주문 등록" },
  { path: "/orders/new", heading: "주문 등록", visibleText: "고객명" },
  { path: "/categories", heading: "카테고리", visibleText: "아직 등록된 카테고리가 없습니다." },
  { path: "/settings", heading: "설정", visibleText: "스토어 이름과 운영 메모는 마이페이지에서 수정할 수 있습니다." },
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
    await expect(page.getByLabel("아이디 저장")).toBeVisible();
    await expect(page.getByRole("link", { name: "아이디 찾기" })).toBeVisible();
    await expect(page.getByRole("link", { name: "비밀번호 찾기" })).toBeVisible();

    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: "계정 만들기" })).toBeVisible();
    await expect(page.getByLabel("이름")).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();

    await page.goto("/find-id");
    await expect(page.getByRole("heading", { name: "아이디 찾기" })).toBeVisible();
    await expect(page.getByLabel("이름")).toBeVisible();
    await expect(page.getByLabel("스토어명")).toBeVisible();

    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: "비밀번호 찾기" })).toBeVisible();
    await expect(page.getByLabel("이메일")).toBeVisible();
  });

  test("아이디 저장은 이메일만 브라우저에 보관한다", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      window.localStorage.setItem("sellerroom:remembered-email", "saved@example.com");
      window.localStorage.setItem("sellerroom:password-check", "should-not-be-used");
    });

    await page.goto("/sign-in");
    await expect(page.getByLabel("이메일")).toHaveValue("saved@example.com");
    await expect(page.locator('input[name="password"]')).toHaveValue("");

    await page.getByLabel("아이디 저장").uncheck();
    await page.reload();
    await expect(page.getByLabel("이메일")).toHaveValue("");
    expect(await page.evaluate(() => window.localStorage.getItem("sellerroom:remembered-email"))).toBeNull();
  });

  test("아이디 찾기와 비밀번호 찾기는 서버 메시지를 표시한다", async ({ page }) => {
    await page.goto("/find-id");
    await page.getByLabel("이름").fill("테스터");
    await page.getByLabel("스토어명").fill("셀러룸 E2E 스토어");
    const findIdResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/auth/find-id") && response.request().method() === "POST"
    );
    await page.getByRole("button", { name: "아이디 찾기" }).click();
    const findIdResponse = await findIdResponsePromise;
    expect(findIdResponse.ok(), await findIdResponse.text()).toBe(true);
    await expect(page.getByRole("main").getByText("확인 요청을 접수했습니다.").first()).toBeVisible();

    await page.goto("/forgot-password");
    await page.getByLabel("이메일").fill("test@gmail.com");
    const forgotPasswordResponsePromise = page.waitForResponse((response) =>
      response.url().includes("/api/auth/forgot-password") && response.request().method() === "POST"
    );
    await page.getByRole("button", { name: "비밀번호 찾기" }).click();
    const forgotPasswordResponse = await forgotPasswordResponsePromise;
    expect(forgotPasswordResponse.ok(), await forgotPasswordResponse.text()).toBe(true);
    await expect(page.getByRole("main").getByText("비밀번호 재설정 요청을 접수했습니다.").first()).toBeVisible();
  });

  test("테스트 계정으로 현재 개발된 인증 화면을 모두 진입한다", async ({ page }) => {
    await signInAndEnsureStore(page);

    for (const screen of protectedScreens) {
      await page.goto(screen.path);
      await expect(page.getByRole("heading", { name: screen.heading, exact: true })).toBeVisible();
      await expect(page.getByText(screen.visibleText).first()).toBeVisible();
    }

    await page.goto("/products/new");
    await page.getByRole("link", { name: "상품 목록으로" }).click();
    await expect(page).toHaveURL(/\/products$/);

    await page.goto("/products");
    await page.getByRole("button", { name: "판매상태 필터" }).click();
    await expect(page.getByRole("option", { name: "판매중" })).toBeVisible();
    await page.getByRole("option", { name: "판매중" }).click();
    await expect(page.getByRole("button", { name: "판매상태 필터" })).toContainText("판매중");
    await page.goto("/products?page=1&pageSize=20");
    await expect(page.getByRole("navigation", { name: "목록 페이지 이동" })).toBeVisible();
    await expect(page.getByText("페이지당").first()).toBeVisible();

    await page.goto("/inventory");
    await page.getByRole("button", { name: "재고상태 필터" }).click();
    await expect(page.getByRole("option", { name: "부족" })).toBeVisible();
    await page.getByRole("option", { name: "부족" }).click();
    await expect(page.getByRole("button", { name: "재고상태 필터" })).toContainText("부족");

    await page.goto("/orders/new");
    await page.getByRole("link", { name: "주문 목록으로" }).click();
    await expect(page).toHaveURL(/\/orders$/);
    await page.goto("/orders?page=1&pageSize=20");
    await expect(page.getByRole("navigation", { name: "목록 페이지 이동" })).toBeVisible();
    await page.getByRole("link", { name: "50" }).last().click();
    await expect(page).toHaveURL(/pageSize=50/);
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
