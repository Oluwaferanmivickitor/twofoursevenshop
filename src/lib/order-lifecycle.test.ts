import { describe, expect, it } from "vitest";
import { deliveryFee, isLowStock, nextOrderStage, validateOrderTransition } from "./order-lifecycle";
describe("Order rules", () => {
  it("uses the requested six-stage pipeline", () => {
    expect(nextOrderStage("order_placed")).toBe("payment_confirmed");
    expect(nextOrderStage("payment_confirmed")).toBe("processing");
    expect(nextOrderStage("processing")).toBe("packed");
    expect(nextOrderStage("packed")).toBe("shipped");
    expect(nextOrderStage("shipped")).toBe("delivered");
    expect(nextOrderStage("delivered")).toBeNull();
  });
  it("blocks processing until payment is paid", () => {
    expect(() => validateOrderTransition("payment_confirmed", "processing", "awaiting_payment")).toThrow("Payment must be paid");
    expect(() => validateOrderTransition("payment_confirmed", "processing", "paid")).not.toThrow();
  });
  it("requires courier and tracking when shipping", () => {
    expect(() => validateOrderTransition("packed", "shipped", "paid", "Courier", "")).toThrow("tracking");
    expect(() => validateOrderTransition("packed", "shipped", "paid", "Courier", "TRACK123")).not.toThrow();
  });
  it("requires an actually paid order for a refund record", () => expect(() => validateOrderTransition("order_placed", "refunded", "awaiting_payment")).toThrow("Only paid"));
  it("shows low stock under five units only", () => {
    expect(isLowStock(4)).toBe(true); expect(isLowStock(5)).toBe(false); expect(isLowStock(0)).toBe(false);
  });
  it("waives delivery only at an enabled threshold", () => {
    expect(deliveryFee(100000, 3000, 100000)).toBe(0); expect(deliveryFee(99999, 3000, 100000)).toBe(3000); expect(deliveryFee(100000, 3000, 0)).toBe(3000);
  });
});