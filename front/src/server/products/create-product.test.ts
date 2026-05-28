import { describe, expect, it } from "@jest/globals";
import { createProductForStore } from "@/server/products/create-product";
import { ProductUsageLimitError } from "@/server/products/errors";
import type { ProductsSupabaseClient } from "@/server/products/types";
import type { Store } from "@/server/stores/service";
import { PLAN_IDS } from "@/server/usage/usage-policy";
import type { ProductCreateValues } from "@/features/products/schemas/product-form-schema";

type InsertCall = {
  rows: Record<string, unknown>[];
  table: string;
};

type UsageCounts = {
  monthly_order_count: number;
  product_count: number;
  sku_count: number;
};

function createSupabaseInsertRecorder(
  usage: UsageCounts = {
    monthly_order_count: 0,
    product_count: 0,
    sku_count: 0
  }
) {
  const calls: InsertCall[] = [];
  let optionGroupRows: Record<string, unknown>[] = [];
  let optionValueRows: Record<string, unknown>[] = [];
  let variantRows: Record<string, unknown>[] = [];

  function createInsertChain(table: string, rows: Record<string, unknown>[]) {
    let data: unknown = null;

    const chain = {
      select() {
        if (table === "products") {
          data = { id: "product-1" };
        }

        if (table === "product_option_groups") {
          optionGroupRows = rows.map((row, index) => ({ ...row, id: `group-${index + 1}` }));
          data = optionGroupRows;
        }

        if (table === "product_option_values") {
          optionValueRows = rows.map((row, index) => ({ ...row, id: `value-${index + 1}` }));
          data = optionValueRows;
        }

        if (table === "product_variants") {
          variantRows = rows.map((row, index) => ({ ...row, id: `variant-${index + 1}` }));
          data = variantRows;
        }

        return chain;
      },
      single() {
        return Promise.resolve({ data, error: null });
      },
      then(resolve: (value: { data: unknown; error: null }) => unknown, reject: (reason: unknown) => unknown) {
        return Promise.resolve({ data, error: null }).then(resolve, reject);
      }
    };

    return chain;
  }

  const supabase = {
    rpc() {
      return Promise.resolve({
        data: [usage],
        error: null
      });
    },
    from(table: string) {
      return {
        insert(rows: Record<string, unknown> | Record<string, unknown>[]) {
          const rowList = Array.isArray(rows) ? rows : [rows];
          calls.push({ table, rows: rowList });

          return createInsertChain(table, rowList);
        },
        delete() {
          return {
            eq() {
              return this;
            },
            then(resolve: (value: { error: null }) => unknown, reject: (reason: unknown) => unknown) {
              return Promise.resolve({ error: null }).then(resolve, reject);
            }
          };
        }
      };
    }
  } as unknown as ProductsSupabaseClient;

  return { calls, supabase };
}

const store: Store = {
  business_type: null,
  created_at: "2026-05-28T00:00:00.000Z",
  id: "store-1",
  memo: null,
  name: "테스트 스토어",
  owner_id: "user-1",
  plan_id: PLAN_IDS.PAID_FULL,
  updated_at: "2026-05-28T00:00:00.000Z"
};

const productValues: ProductCreateValues = {
  baseCost: 9000,
  basePrice: 19000,
  memo: "테스트 상품",
  name: "린넨 셔츠",
  optionGroups: [{ name: "색상", values: ["블랙", "아이보리"] }],
  optionMode: "options",
  status: "active",
  variants: [
    {
      clientKey: "black",
      cost: 9000,
      currentStock: 7,
      isActive: true,
      memo: "",
      options: [{ groupName: "색상", value: "블랙" }],
      price: 19000,
      safetyStock: 2
    },
    {
      clientKey: "ivory",
      cost: 9000,
      currentStock: 0,
      isActive: true,
      memo: "",
      options: [{ groupName: "색상", value: "아이보리" }],
      price: 19000,
      safetyStock: 2
    }
  ]
};

describe("createProductForStore", () => {
  it("stores option combinations and records initial stock movements only when stock exists", async () => {
    const { calls, supabase } = createSupabaseInsertRecorder();

    await expect(createProductForStore(supabase, store, PLAN_IDS.PAID_FULL, productValues)).resolves.toEqual({
      productId: "product-1"
    });

    expect(calls.find((call) => call.table === "products")?.rows[0]).toMatchObject({
      base_cost: 9000,
      base_price: 19000,
      has_options: true,
      memo: "테스트 상품",
      name: "린넨 셔츠",
      status: "active",
      store_id: "store-1"
    });
    expect(calls.find((call) => call.table === "product_variants")?.rows).toMatchObject([
      { current_stock: 7, sku_name: "블랙" },
      { current_stock: 0, sku_name: "아이보리" }
    ]);
    expect(calls.find((call) => call.table === "product_variant_options")?.rows).toHaveLength(2);
    expect(calls.find((call) => call.table === "stock_movements")?.rows).toEqual([
      {
        after_stock: 7,
        before_stock: 0,
        memo: "상품 등록 초기 재고",
        product_id: "product-1",
        quantity: 7,
        store_id: "store-1",
        type: "inbound",
        variant_id: "variant-1"
      }
    ]);
  });

  it("blocks free plan product creation when product limit is reached", async () => {
    const { calls, supabase } = createSupabaseInsertRecorder({
      monthly_order_count: 0,
      product_count: 10,
      sku_count: 0
    });

    await expect(createProductForStore(supabase, store, PLAN_IDS.FREE, productValues)).rejects.toThrow(ProductUsageLimitError);
    expect(calls).toHaveLength(0);
  });

  it("blocks free plan product creation when SKU limit would be exceeded", async () => {
    const { calls, supabase } = createSupabaseInsertRecorder({
      monthly_order_count: 0,
      product_count: 0,
      sku_count: 99
    });

    await expect(createProductForStore(supabase, store, PLAN_IDS.FREE, productValues)).rejects.toThrow(ProductUsageLimitError);
    expect(calls).toHaveLength(0);
  });
});
