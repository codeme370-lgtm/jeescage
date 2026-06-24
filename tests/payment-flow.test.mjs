import test from 'node:test';
import assert from 'node:assert/strict';
import { isOrderRevenueEligible, buildCheckoutMetadata, parseCheckoutMetadata } from '../lib/paymentFlow.mjs';

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
