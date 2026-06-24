export function isOrderRevenueEligible(order = {}) {
  if (!order) return false;

  if (order.paymentMethod === "COD") return true;
  if (order.isPaid === true) return true;

  return ["AUTHORIZED", "PENDING"].includes(order.paymentStatus);
}

export function parseCheckoutMetadata(metadata = {}) {
  const rawPayload = metadata?.checkoutPayload || metadata?.orderPayload || metadata?.payload || null;

  if (!rawPayload) {
    return null;
  }

  if (typeof rawPayload === "string") {
    try {
      return JSON.parse(rawPayload);
    } catch {
      return null;
    }
  }

  return rawPayload;
}

export function buildCheckoutMetadata(payload = {}) {
  return {
    checkoutPayload: JSON.stringify(payload),
    appId: "jeeshop",
  };
}
