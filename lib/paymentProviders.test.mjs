import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePaymentMethod, isSupportedPaymentMethod } from './paymentProviders.mjs';

test('normalizes supported payment methods', () => {
  assert.equal(normalizePaymentMethod('paystack'), 'PAYSTACK');
  assert.equal(normalizePaymentMethod('hubtel'), 'HUBTEL');
  assert.equal(normalizePaymentMethod('HUBTEL'), 'HUBTEL');
});

test('rejects unsupported payment methods', () => {
  assert.equal(isSupportedPaymentMethod('stripe'), false);
  assert.equal(isSupportedPaymentMethod('PAYSTACK'), true);
  assert.equal(isSupportedPaymentMethod('HUBTEL'), true);
});
