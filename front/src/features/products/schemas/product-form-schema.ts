import { z } from "zod";
import { getActiveVariantOptionMismatch } from "@/features/products/utils/product-option-validation";

const nonNegativeIntegerSchema = z.coerce
  .number()
  .int("정수로 입력하세요.")
  .min(0, "0 이상으로 입력하세요.");

const optionValueSchema = z.string().trim().min(1, "옵션값을 입력하세요.").max(40, "옵션값은 40자 이하로 입력하세요.");

export const productStatusSchema = z.enum(["active", "sold_out", "hidden"]);

export const productOptionGroupSchema = z.object({
  name: z.string().trim().min(1, "옵션 그룹명을 입력하세요.").max(30, "옵션 그룹명은 30자 이하로 입력하세요."),
  values: z.array(optionValueSchema).min(1, "옵션값을 1개 이상 입력하세요.").max(20, "옵션값은 그룹당 20개 이하로 입력하세요.")
});

export const productVariantOptionSchema = z.object({
  groupName: z.string().trim().min(1),
  value: z.string().trim().min(1)
});

export const productVariantSchema = z.object({
  clientKey: z.string().optional(),
  options: z.array(productVariantOptionSchema),
  isActive: z.boolean(),
  price: nonNegativeIntegerSchema,
  cost: nonNegativeIntegerSchema,
  currentStock: nonNegativeIntegerSchema,
  safetyStock: nonNegativeIntegerSchema,
  memo: z.string().trim().max(300, "옵션 메모는 300자 이하로 입력하세요.").optional()
});

export const productCreateSchema = z
  .object({
    name: z.string().trim().min(1, "상품명을 입력하세요.").max(80, "상품명은 80자 이하로 입력하세요."),
    basePrice: nonNegativeIntegerSchema,
    baseCost: nonNegativeIntegerSchema,
    status: productStatusSchema.default("active"),
    memo: z.string().trim().max(500, "메모는 500자 이하로 입력하세요.").optional(),
    optionMode: z.enum(["none", "options"]),
    optionGroups: z.array(productOptionGroupSchema).max(5, "옵션 그룹은 5개 이하로 입력하세요."),
    variants: z.array(productVariantSchema).min(1, "옵션 조합을 1개 이상 준비하세요.").max(100, "한 번에 등록할 옵션 조합은 100개 이하입니다.")
  })
  .superRefine((value, context) => {
    const activeVariants = value.variants.filter((variant) => variant.isActive);

    if (activeVariants.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message: "등록할 옵션 조합을 1개 이상 켜주세요."
      });
    }

    if (value.optionMode === "none" && value.optionGroups.length > 0) {
      context.addIssue({
        code: "custom",
        path: ["optionGroups"],
        message: "옵션 없이 등록할 때는 옵션 그룹을 비워주세요."
      });
    }

    if (value.optionMode === "options") {
      if (value.optionGroups.length === 0) {
        context.addIssue({
          code: "custom",
          path: ["optionGroups"],
          message: "옵션 그룹을 1개 이상 입력하세요."
        });
      }

      const groupNames = new Set<string>();
      value.optionGroups.forEach((group, groupIndex) => {
        if (groupNames.has(group.name)) {
          context.addIssue({
            code: "custom",
            path: ["optionGroups", groupIndex, "name"],
            message: "이미 추가한 옵션 그룹명입니다."
          });
        }
        groupNames.add(group.name);

        const values = new Set<string>();
        group.values.forEach((optionValue, valueIndex) => {
          if (values.has(optionValue)) {
            context.addIssue({
              code: "custom",
              path: ["optionGroups", groupIndex, "values", valueIndex],
              message: "이미 추가한 옵션값입니다."
            });
          }
          values.add(optionValue);
        });
      });

    }

    const mismatchMessage = getActiveVariantOptionMismatch(value);

    if (mismatchMessage) {
      context.addIssue({
        code: "custom",
        path: ["variants"],
        message: mismatchMessage
      });
    }

    const variantNames = new Set<string>();
    activeVariants.forEach((variant, variantIndex) => {
      const label = variant.options.length > 0 ? variant.options.map((option) => option.value).join(" / ") : "기본";

      if (variantNames.has(label)) {
        context.addIssue({
          code: "custom",
          path: ["variants", variantIndex],
          message: "중복된 옵션 조합이 있습니다."
        });
      }

      variantNames.add(label);
    });
  });

export type ProductCreateValues = z.infer<typeof productCreateSchema>;
export type ProductVariantValues = z.infer<typeof productVariantSchema>;
