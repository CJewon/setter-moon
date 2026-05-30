import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { OrderChangeHistory } from "@/features/orders/components/order-change-history";
import type { OrderChangeLog } from "@/server/orders/types";

const baseLog: OrderChangeLog = {
  changed_by: "user-1",
  changes: [
    {
      after: "수정 주문",
      before: "기존 주문",
      field: "customerName",
      label: "고객명"
    },
    {
      after: "2개",
      before: "1개",
      field: "quantity",
      label: "수량"
    }
  ],
  created_at: "2026-05-30T00:00:00.000Z",
  id: "log-1",
  order_id: "order-1",
  summary: "고객명, 수량 변경"
};

describe("OrderChangeHistory", () => {
  it("renders an empty state when no change logs exist", () => {
    render(<OrderChangeHistory logs={[]} />);

    expect(screen.getByText("주문 수정 이력")).toBeTruthy();
    expect(screen.getByText("아직 주문 수정 이력이 없습니다.")).toBeTruthy();
  });

  it("renders change summaries and before/after values", () => {
    render(<OrderChangeHistory logs={[baseLog]} />);

    expect(screen.getByText("고객명, 수량 변경")).toBeTruthy();
    expect(screen.getByText("고객명")).toBeTruthy();
    expect(screen.getByText("기존 주문")).toBeTruthy();
    expect(screen.getByText("수정 주문")).toBeTruthy();
    expect(screen.getByText("수량")).toBeTruthy();
    expect(screen.getByText("1개")).toBeTruthy();
    expect(screen.getByText("2개")).toBeTruthy();
  });
});
