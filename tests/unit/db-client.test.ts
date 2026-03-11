import { describe, expect, it } from "vitest";
import { getDb } from "../../lib/db";

describe("database client", () => {
  it("returns the same prisma instance for repeated calls", () => {
    const first = getDb();
    const second = getDb();
    expect(first).toBe(second);
  });
});
