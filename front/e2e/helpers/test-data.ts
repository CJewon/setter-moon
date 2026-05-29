import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { getSharedTestAccount } from "../../test-utils/test-account";

type EnvMap = Record<string, string | undefined>;

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

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

export async function cleanupUnorderedE2EProducts() {
  const env = readLocalEnv();
  const admin = getAdminClient(env);

  if (!admin) {
    return;
  }

  const testAccount = getSharedTestAccount(env);
  const { data: users, error: userError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (userError) {
    throw userError;
  }

  const user = users.users.find((item) => item.email === testAccount.email);

  if (!user) {
    return;
  }

  const { data: stores, error: storeError } = await admin.from("stores").select("id").eq("owner_id", user.id);

  if (storeError) {
    throw storeError;
  }

  const storeIds = stores?.map((store) => store.id) ?? [];

  if (storeIds.length === 0) {
    return;
  }

  const { data: products, error: productError } = await admin.from("products").select("id, name").in("store_id", storeIds);

  if (productError) {
    throw productError;
  }

  const e2eProductIds =
    products
      ?.filter((product) => product.name.startsWith("E2E 옵션 상품"))
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
