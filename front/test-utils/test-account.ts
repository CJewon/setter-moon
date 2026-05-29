export type TestAccountEnv = Record<string, string | undefined>;

export const DEFAULT_TEST_ACCOUNT = Object.freeze({
  email: "test@gmail.com",
  password: "Password1!"
});

function getConfiguredValue(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : fallback;
}

export function getSharedTestAccount(env: TestAccountEnv = process.env) {
  return {
    email: getConfiguredValue(env.E2E_SELLER_EMAIL ?? env.JEST_SELLER_EMAIL, DEFAULT_TEST_ACCOUNT.email),
    password: getConfiguredValue(env.E2E_SELLER_PASSWORD ?? env.JEST_SELLER_PASSWORD, DEFAULT_TEST_ACCOUNT.password)
  };
}
