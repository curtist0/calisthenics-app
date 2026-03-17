import { generateId } from "@/lib/storage";

describe("Storage utilities", () => {
  it("generateId returns unique ids", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("generateId returns string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});
