export class ProductUsageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductUsageLimitError";
  }
}

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductValidationError";
  }
}

export class ProductMutationError extends Error {
  code?: string;
  details?: string;
  hint?: string;

  constructor(error: { code?: string; message?: string; details?: string; hint?: string }) {
    super(error.message ?? "Product mutation failed.");
    this.name = "ProductMutationError";
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
  }
}

export class ProductNotFoundError extends Error {
  constructor(message = "Product not found.") {
    super(message);
    this.name = "ProductNotFoundError";
  }
}

export function isProductUsageLimitError(error: unknown) {
  return error instanceof ProductUsageLimitError;
}

export function isProductValidationError(error: unknown) {
  return error instanceof ProductValidationError;
}

export function isProductMutationError(error: unknown) {
  return error instanceof ProductMutationError;
}

export function isProductNotFoundError(error: unknown) {
  return error instanceof ProductNotFoundError;
}
