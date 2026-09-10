import { describe, expect, it } from "vitest";
import { hashPin, normalizePhone, validatePin, verifyPin } from "./_core/localAuth";

describe("local phone and PIN security", () => {
  it("normalizes Tanzanian local and international phone formats", () => {
    expect(normalizePhone("0698 232 313")).toBe("255698232313");
    expect(normalizePhone("255698232313")).toBe("255698232313");
  });

  it("rejects invalid phone and PIN formats", () => {
    expect(() => normalizePhone("12345")).toThrow();
    expect(validatePin("123456")).toBe(true);
    expect(validatePin("12345")).toBe(false);
    expect(validatePin("abcdef")).toBe(false);
  });

  it("never stores a PIN in plain text and verifies the hash", async () => {
    const pin = "123456";
    const stored = await hashPin(pin);
    expect(stored).not.toContain(pin);
    expect(await verifyPin(pin, stored)).toBe(true);
    expect(await verifyPin("654321", stored)).toBe(false);
  });
});
