import { expect, test } from "@playwright/test";
import { signInAndEnsureStore } from "./helpers/auth";

const protectedScreens = [
  { path: "/dashboard", heading: "대시보드", visibleText: "오늘 주문" },
  { path: "/products", heading: "상품", visibleText: "상품 등록" },
  { path: "/products/new", heading: "상품 등록", visibleText: "상품 기본 정보" },
  { path: "/inventory", heading: "재고", visibleText: "현재 재고" },
  { path: "/inventory/low-stock", heading: "재고 부족", visibleText: "안전 재고" },
  { path: "/inventory/movements", heading: "재고 이력", visibleText: "변경 전/후" },
  { path: "/orders", heading: "주문", visibleText: "주문 등록" },
  { path: "/orders/new", heading: "주문 등록", visibleText: "고객명" },
  { path: "/categories", heading: "카테고리", visibleText: "카테고리는 상품이 더 많아진 뒤 정리해도 괜찮아요." },
  { path: "/settings", heading: "설정", visibleText: "스토어 정보" },
  { path: "/my-page", heading: "마이페이지", visibleText: "계정 정보" }
];

test.describe("현재 구현 화면 E2E", () => {
  test("공개 화면이 렌더링된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "주문과 재고를 한 화면에서 가볍게" })).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "로그인" })).toBeVisible();
    await expect(page.getByRole("link", { name: /무료 시작/ }).first()).toBeVisible();
    await expect(page.locator("header").getByRole("link", { name: "소개" })).toHaveAttribute("href", "#intro");
    await expect(page.locator("header").getByRole("link", { name: "기능" })).toHaveAttribute("href", "#features");
    await expect(page.locator("header").getByRole("link", { name: "화면" })).toHaveAttribute("href", "#preview");
    await expect(page.locator("header").getByRole("link", { name: "가격" })).toHaveAttribute("href", "#plan");
    await expect(page.getByText("이런 분께")).toHaveCount(0);
    await expect(page.getByText("운영 흐름")).toHaveCount(0);
    await expect(page.getByText("화면 미리보기")).toHaveCount(0);
    await expect(page.getByText("가격 안내")).toHaveCount(0);
    await expect(page.getByText("문제")).toHaveCount(0);
    await expect(page.getByText("작동 방식")).toHaveCount(0);
    await expect(page.getByText("데모 화면")).toHaveCount(0);
    await expect(page.getByText("요금제")).toHaveCount(0);

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

    await page.goto("/dashboard");
    await expect(page.getByText("최근 7일 판매 흐름")).toBeVisible();
    await expect(page.getByText("가로축: 날짜")).toBeVisible();
    await expect(page.getByText("세로축: 판매금액")).toBeVisible();

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
    await expect(page.getByText("페이지당")).toHaveCount(0);
    await page.getByPlaceholder("상품명 검색").fill("검색테스트");
    await page.getByRole("button", { name: "검색" }).click();
    await expect(page).toHaveURL(/keyword=/);

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
    await expect(page.getByText("페이지당")).toHaveCount(0);
    await page.goto("/orders?customerKeyword=__no_order_result__&page=1&pageSize=10");
    await expect(page.getByText("조건에 맞는 주문이 없습니다.")).toBeVisible();
    await expect(page.getByRole("link", { name: "전체 주문 보기" })).toBeVisible();
    await expect(page.locator("table")).toHaveCount(0);
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
    await expect(page.getByRole("heading", { name: "주문과 재고를 한 화면에서 가볍게" })).toBeVisible();
  });

  test("조회 API는 JSON 응답 규칙을 따른다", async ({ page }) => {
    await signInAndEnsureStore(page);

    const responses = await page.evaluate(async () => {
      const urls = [
        "/api/auth/session",
        "/api/dashboard",
        "/api/products?page=1&pageSize=10",
        "/api/inventory?page=1&pageSize=10",
        "/api/inventory/low-stock?page=1&pageSize=10",
        "/api/inventory/movements?page=1&pageSize=10",
        "/api/orders?page=1&pageSize=10",
        "/api/stores",
        "/api/stores/current",
        "/api/my-page",
        "/api/settings",
        "/api/usage/summary"
      ];

      return Promise.all(
        urls.map(async (url) => {
          const response = await fetch(url);
          const text = await response.text();
          let body: unknown = null;

          try {
            body = JSON.parse(text);
          } catch {
            body = { raw: text };
          }

          return {
            body,
            contentType: response.headers.get("content-type"),
            status: response.status,
            url
          };
        })
      );
    });

    for (const response of responses) {
      expect(response.status, response.url).toBe(200);
      expect(response.contentType, response.url).toContain("application/json");
      expect(response.body, response.url).toEqual(
        expect.objectContaining({
          code: 200,
          data: expect.anything(),
          message: expect.any(String)
        })
      );
    }

    const invalidPagination = await page.evaluate(async () => {
      const response = await fetch("/api/inventory?page=abc&pageSize=10");

      return {
        body: await response.json(),
        status: response.status
      };
    });

    expect(invalidPagination.status).toBe(400);
    expect(invalidPagination.body).toEqual(
      expect.objectContaining({
        code: 400,
        message: "페이지 번호를 확인해 주세요."
      })
    );
  });
});
