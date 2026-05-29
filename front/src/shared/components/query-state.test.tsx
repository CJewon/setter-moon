import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { QueryLoadingState } from "@/shared/components/query-state";

describe("QueryLoadingState", () => {
  it("renders an accessible loading status with a shared message", () => {
    render(<QueryLoadingState title="상품 목록을 불러오고 있습니다." />);

    const status = screen.getByRole("status");

    expect(status.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("상품 목록을 불러오고 있습니다.")).toBeTruthy();
    expect(screen.getByText("화면에 필요한 정보를 준비하고 있습니다.")).toBeTruthy();
  });

  it("supports page-specific loading copy", () => {
    render(
      <QueryLoadingState
        description="대시보드 요약과 최근 주문을 정리하고 있습니다."
        title="대시보드를 불러오고 있습니다."
        variant="dashboard"
      />
    );

    expect(screen.getByText("대시보드를 불러오고 있습니다.")).toBeTruthy();
    expect(screen.getByText("대시보드 요약과 최근 주문을 정리하고 있습니다.")).toBeTruthy();
  });
});
