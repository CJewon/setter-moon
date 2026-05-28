import { describe, expect, it } from "@jest/globals";
import { DEFAULT_TEST_ACCOUNT, getSharedTestAccount } from "./test-account";

describe("getSharedTestAccount", () => {
  it("uses the shared manual test account by default", () => {
    expect(getSharedTestAccount({})).toEqual(DEFAULT_TEST_ACCOUNT);
  });

  it("allows e2e and jest runner overrides", () => {
    expect(
      getSharedTestAccount({
        E2E_SELLER_EMAIL: "e2e@example.com",
        E2E_SELLER_PASSWORD: "E2ePassword1!",
        JEST_SELLER_EMAIL: "jest@example.com",
        JEST_SELLER_PASSWORD: "JestPassword1!"
      })
    ).toEqual({
      email: "e2e@example.com",
      password: "E2ePassword1!"
    });

    expect(
      getSharedTestAccount({
        JEST_SELLER_EMAIL: "jest@example.com",
        JEST_SELLER_PASSWORD: "JestPassword1!"
      })
    ).toEqual({
      email: "jest@example.com",
      password: "JestPassword1!"
    });
  });
});
