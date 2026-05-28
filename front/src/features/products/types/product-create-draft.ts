import type { ProductCreateValues } from "@/features/products/schemas/product-form-schema";
import type { VariantCombinationItem } from "@/features/products/utils/variant-combinations";

export type ProductBasicDraft = {
  name: string;
  basePrice: string;
  baseCost: string;
  status: "active" | "sold_out" | "hidden";
  memo: string;
};

export type ProductOptionGroupDraft = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariantDraft = {
  key: string;
  label: string;
  options: VariantCombinationItem["options"];
  isActive: boolean;
  price: string;
  cost: string;
  currentStock: string;
  safetyStock: string;
  memo: string;
};

export type ProductCreateFormState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type ProductOptionMode = ProductCreateValues["optionMode"];
