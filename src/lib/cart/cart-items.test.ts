import { describe, expect, it } from "vitest";
import { addItem, countItems, MAX_QTY_PER_LINE, parseCart, removeItem, setQuantity } from "./cart-items";

describe("cart items", () => {
  it("adds new lines and merges repeated variants", () => {
    let cart = addItem([], "a", 1);
    cart = addItem(cart, "b", 2);
    cart = addItem(cart, "a", 3);
    expect(cart).toEqual([
      { variantId: "a", quantity: 4 },
      { variantId: "b", quantity: 2 },
    ]);
    expect(countItems(cart)).toBe(6);
  });

  it("caps quantity per line", () => {
    expect(addItem([], "a", 500)[0].quantity).toBe(MAX_QTY_PER_LINE);
  });

  it("removes a line when quantity drops below one", () => {
    expect(setQuantity([{ variantId: "a", quantity: 2 }], "a", 0)).toEqual([]);
    expect(removeItem([{ variantId: "a", quantity: 2 }], "a")).toEqual([]);
  });

  it("returns the same array when removing an absent variant", () => {
    const cart = [{ variantId: "a", quantity: 1 }];
    expect(removeItem(cart, "zzz")).toBe(cart);
  });

  it("parses untrusted storage safely", () => {
    expect(parseCart("nope")).toEqual([]);
    expect(
      parseCart([
        { variantId: "a", quantity: 2 },
        { variantId: "a", quantity: 1.7 },
        { variantId: "", quantity: 1 },
        { variantId: "b", quantity: -3 },
        { variantId: "c", quantity: "5" },
        null,
      ]),
    ).toEqual([{ variantId: "a", quantity: 3 }]);
  });
});
