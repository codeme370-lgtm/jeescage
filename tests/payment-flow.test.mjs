import test from 'node:test';
import assert from 'node:assert/strict';
import { isOrderRevenueEligible, buildCheckoutMetadata, parseCheckoutMetadata } from '../lib/paymentFlow.mjs';
import { buildWhatsAppCheckoutMessage, createWhatsAppCheckoutLink } from '../lib/whatsappCheckout.js';

test('pending paystack orders are not treated as revenue-eligible', () => {
  assert.equal(isOrderRevenueEligible({ paymentMethod: 'PAYSTACK', paymentStatus: 'PENDING', isPaid: false }), false);
});

test('authorized paystack orders are treated as revenue-eligible', () => {
  assert.equal(isOrderRevenueEligible({ paymentMethod: 'PAYSTACK', paymentStatus: 'AUTHORIZED', isPaid: true }), true);
});

test('checkout metadata preserves the payload for verification', () => {
  const payload = { items: [{ productId: 'prod-1', quantity: 1 }], addressId: 'addr-1' };
  const metadata = buildCheckoutMetadata(payload);
  assert.equal(metadata.appId, 'jeeshop');
  assert.deepEqual(parseCheckoutMetadata(metadata), payload);
});

test('whatsapp checkout message includes order summary, totals, and payment confirmation request', () => {
  const message = buildWhatsAppCheckoutMessage({
    items: [
      { productName: 'Wireless Mouse', quantity: 2, unitPrice: 45, variant: 'Black' },
      { productName: 'USB Cable', quantity: 1, unitPrice: 20 }
    ],
    subtotal: 110,
    total: 110,
    currency: 'GHS'
  });

  assert.match(message, /Hello, I would like to place an order\./);
  assert.match(message, /\*Order Summary\*/);
  assert.match(message, /• Product: Wireless Mouse/);
  assert.match(message, /Variant: Black/);
  assert.match(message, /Quantity: 2/);
  assert.match(message, /\*Subtotal:\* GHS110\.00/);
  assert.match(message, /\*Total:\* GHS110\.00/);
  assert.match(message, /Please confirm my order and let me know how I can complete the payment\./);
});

test('whatsapp click-to-chat link URL-encodes the order message and uses the business number', () => {
  const link = createWhatsAppCheckoutLink({
    number: '0248608602',
    message: 'Hello, I would like to place an order.\n\n*Order Summary*'
  });

  assert.equal(link, 'https://wa.me/233248608602?text=Hello%2C%20I%20would%20like%20to%20place%20an%20order.%0A%0A*Order%20Summary*');
});
