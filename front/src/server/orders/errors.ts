export class OrderMutationError extends Error {
  code?: string;

  constructor(error: { code?: string; message?: string }) {
    super(error.message ?? "Order mutation failed.");
    this.name = "OrderMutationError";
    this.code = error.code;
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("주문을 찾을 수 없습니다.");
    this.name = "OrderNotFoundError";
  }
}

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderValidationError";
  }
}

export class OrderUsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderUsageLimitError";
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor(message = "변경할 수 없는 주문 상태입니다.") {
    super(message);
    this.name = "InvalidOrderStatusTransitionError";
  }
}

export class InsufficientStockError extends Error {
  constructor(message = "현재 재고가 부족하여 배송대기로 변경할 수 없습니다.") {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export function isOrderMutationError(error: unknown) {
  return error instanceof OrderMutationError;
}

export function isOrderNotFoundError(error: unknown) {
  return error instanceof OrderNotFoundError;
}

export function isOrderValidationError(error: unknown) {
  return error instanceof OrderValidationError;
}

export function isOrderUsageLimitError(error: unknown) {
  return error instanceof OrderUsageLimitError;
}

export function isInvalidOrderStatusTransitionError(error: unknown) {
  return error instanceof InvalidOrderStatusTransitionError;
}

export function isInsufficientStockError(error: unknown) {
  return error instanceof InsufficientStockError;
}
