import { describe, it, expect } from "vitest";
import { extractApiError } from "../api/core";
describe("extractApiError", () => {
  it("maps new code envelope", () => {
    const err = { response: { status: 400, data: { code: "ACCOUNT_NOT_FOUND", message: "Email not found." } } };
    expect(extractApiError(err).code).toBe("ACCOUNT_NOT_FOUND");
  });
  it("maps RFC7807 problem+json", () => {
    const err = { response: { status: 400, data: { title: "Validation", errors: { Email: ["Taken"] } } } };
    expect(extractApiError(err).message).toMatch(/Taken/);
  });
  it("handles raw string body", () => {
    const err = { response: { status: 400, data: "Email not found." } };
    expect(extractApiError(err).code).toBe("ACCOUNT_NOT_FOUND");
  });
  it("handles network error", () => {
    const err = { message: "Network Error", request: {} };
    expect(extractApiError(err).code).toBe("NETWORK_ERROR");
  });
});
