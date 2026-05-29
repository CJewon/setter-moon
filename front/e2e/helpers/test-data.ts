import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/shared/types/database";
import { getSharedTestAccount } from "../../test-utils/test-account";

type EnvMap = Record<string, string | undefined>;
type AdminClient = SupabaseClient<Database>;

type TestStoreContext = {
  admin: AdminClient;
  storeId: string;
  userId: string;
};

export type E2EProductFixture = {
  productId: string;
  productName: string;
  variantId: string;
};

function readLocalEnv(): EnvMap {
  const envPath = path.resolve(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    return process.env;
  }

  const localEnv: EnvMap = { ...process.env };

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trimStart().startsWith("#")) {
      continue;
    }

    const index = line.indexOf("=");

    if (index > -1) {
      localEnv[line.slice(0, index)] = line.slice(index + 1);
    }
  }

  return localEnv;
}

function getAdminClient(env: EnvMap) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

async function getTestStoreContext(): Promise<TestStoreContext | null> {
  const env = readLocalEnv();
  const admin = getAdminClient(env);

  if (!admin) {
    return null;
  }

  const testAccount = getSharedTestAccount(env);
  const { data: users, error: userError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (userError) {
    throw userError;
  }

  const user = users.users.find((item) => item.email === testAccount.email);

  if (!user) {
    return null;
  }

  const { data: stores, error: storeError } = await admin.from("stores").select("id").eq("owner_id", user.id);

  if (storeError) {
    throw storeError;
  }

  const storeIds = stores?.map((store) => store.id) ?? [];

  if (storeIds.length === 0) {
    return null;
  }

  return {
    admin,
    storeId: storeIds[0],
    userId: user.id
  };
}

export async function cleanupUnorderedE2EProducts() {
  const context = await getTestStoreContext();

  if (!context) {
    return;
  }

  const { admin, storeId } = context;

  const { data: products, error: productError } = await admin.from("products").select("id, name").eq("store_id", storeId);

  if (productError) {
    throw productError;
  }

  const cleanupPrefixes = ["E2E 옵션 상품", "E2E 수정 상품"];
  const e2eProductIds =
    products
      ?.filter((product) => cleanupPrefixes.some((prefix) => product.name.startsWith(prefix)))
      .map((product) => product.id) ?? [];

  if (e2eProductIds.length === 0) {
    return;
  }

  const { data: referencedItems, error: itemError } = await admin
    .from("order_items")
    .select("product_id")
    .in("product_id", e2eProductIds);

  if (itemError) {
    throw itemError;
  }

  const referencedProductIds = new Set(referencedItems?.map((item) => item.product_id) ?? []);
  const productIdsToDelete = e2eProductIds.filter((productId) => !referencedProductIds.has(productId));

  if (productIdsToDelete.length === 0) {
    return;
  }

  const { error: movementError } = await admin.from("stock_movements").delete().in("product_id", productIdsToDelete);

  if (movementError) {
    throw movementError;
  }

  const { error: deleteError } = await admin.from("products").delete().in("id", productIdsToDelete);

  if (deleteError) {
    throw deleteError;
  }
}

export async function createEditableE2EProduct(): Promise<E2EProductFixture | null> {
  const context = await getTestStoreContext();

  if (!context) {
    return null;
  }

  const { admin, storeId } = context;
  const suffix = Date.now().toString().slice(-6);
  const productName = `E2E 수정 상품 ${suffix}`;
  const { data: product, error: productError } = await admin
    .from("products")
    .insert({
      base_cost: 9000,
      base_price: 19000,
      has_options: false,
      memo: "상품 수정 E2E fixture",
      name: productName,
      status: "active",
      store_id: storeId
    })
    .select("id")
    .single();

  if (productError) {
    throw productError;
  }

  const { data: variant, error: variantError } = await admin
    .from("product_variants")
    .insert({
      cost: 9000,
      current_stock: 12,
      is_active: true,
      price: 19000,
      product_id: product.id,
      safety_stock: 2,
      sku_name: "기본"
    })
    .select("id")
    .single();

  if (variantError) {
    await admin.from("products").delete().eq("id", product.id).eq("store_id", storeId);
    throw variantError;
  }

  const { error: movementError } = await admin.from("stock_movements").insert({
    after_stock: 12,
    before_stock: 0,
    memo: "상품 수정 E2E 초기 재고",
    product_id: product.id,
    quantity: 12,
    store_id: storeId,
    type: "inbound",
    variant_id: variant.id
  });

  if (movementError) {
    await admin.from("products").delete().eq("id", product.id).eq("store_id", storeId);
    throw movementError;
  }

  return {
    productId: product.id,
    productName,
    variantId: variant.id
  };
}

async function resetFirstVariantStock(admin: AdminClient, productId: string) {
  const { data: variant, error: variantFindError } = await admin
    .from("product_variants")
    .select("id")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (variantFindError) {
    throw variantFindError;
  }

  if (variant) {
    const { error: updateVariantError } = await admin
      .from("product_variants")
      .update({
        current_stock: 1000,
        is_active: true,
        price: 19000,
        safety_stock: 2
      })
      .eq("id", variant.id);

    if (updateVariantError) {
      throw updateVariantError;
    }

    return variant.id;
  }

  const { data: createdVariant, error: createVariantError } = await admin
    .from("product_variants")
    .insert({
      cost: 9000,
      current_stock: 1000,
      is_active: true,
      price: 19000,
      product_id: productId,
      safety_stock: 2,
      sku_name: "기본"
    })
    .select("id")
    .single();

  if (createVariantError) {
    throw createVariantError;
  }

  return createdVariant.id;
}

export async function ensureOrderableE2EProduct(): Promise<E2EProductFixture | null> {
  const context = await getTestStoreContext();

  if (!context) {
    return null;
  }

  const { admin, storeId } = context;
  const { data: existingProducts, error: existingProductError } = await admin
    .from("products")
    .select("id, name")
    .eq("store_id", storeId)
    .like("name", "E2E 주문 상품%")
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingProductError) {
    throw existingProductError;
  }

  const existingProduct = existingProducts?.[0];

  if (existingProduct) {
    const { error: productUpdateError } = await admin
      .from("products")
      .update({
        status: "active"
      })
      .eq("id", existingProduct.id)
      .eq("store_id", storeId);

    if (productUpdateError) {
      throw productUpdateError;
    }

    return {
      productId: existingProduct.id,
      productName: existingProduct.name,
      variantId: await resetFirstVariantStock(admin, existingProduct.id)
    };
  }

  const productName = `E2E 주문 상품 ${Date.now().toString().slice(-6)}`;
  const { data: product, error: productError } = await admin
    .from("products")
    .insert({
      base_cost: 9000,
      base_price: 19000,
      has_options: false,
      memo: "주문 E2E fixture",
      name: productName,
      status: "active",
      store_id: storeId
    })
    .select("id")
    .single();

  if (productError) {
    const { data: fallbackProducts, error: fallbackError } = await admin
      .from("products")
      .select("id, name")
      .eq("store_id", storeId)
      .neq("status", "hidden")
      .order("created_at", { ascending: false })
      .limit(1);

    if (fallbackError) {
      throw fallbackError;
    }

    const fallbackProduct = fallbackProducts?.[0];

    if (!fallbackProduct) {
      throw productError;
    }

    return {
      productId: fallbackProduct.id,
      productName: fallbackProduct.name,
      variantId: await resetFirstVariantStock(admin, fallbackProduct.id)
    };
  }

  return {
    productId: product.id,
    productName,
    variantId: await resetFirstVariantStock(admin, product.id)
  };
}
