export type TestAccountEnv = Record<string, string | undefined>;

export const DEFAULT_TEST_ACCOUNT = Object.freeze({
  email: "test@gmail.com",
  password: "Password1!"
});

export function getSharedTestAccount(env: TestAccountEnv = process.env) {
  return {
    email: env.E2E_SELLER_EMAIL ?? env.JEST_SELLER_EMAIL ?? DEFAULT_TEST_ACCOUNT.email,
    password:
      env.E2E_SELLER_PASSWORD ?? env.JEST_SELLER_PASSWORD ?? DEFAULT_TEST_ACCOUNT.password
  };
}
