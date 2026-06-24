const SUPPORTED_PAYMENT_METHODS = new Set(['PAYSTACK', 'HUBTEL', 'COD']);

export function normalizePaymentMethod(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === 'PAYSTACK') return 'PAYSTACK';
  if (normalized === 'HUBTEL') return 'HUBTEL';
  if (normalized === 'COD') return 'COD';
  return null;
}

export function isSupportedPaymentMethod(value) {
  const normalized = normalizePaymentMethod(value);
  return Boolean(normalized && SUPPORTED_PAYMENT_METHODS.has(normalized));
}

export function getPaymentProviderConfig(method) {
  const normalized = normalizePaymentMethod(method);
  if (normalized === 'HUBTEL') {
    return {
      provider: 'HUBTEL',
      label: 'Hubtel',
      redirectPath: '/hubtel',
      requiresRedirect: true,
    };
  }
  if (normalized === 'PAYSTACK') {
    return {
      provider: 'PAYSTACK',
      label: 'Paystack',
      redirectPath: '/paystack',
      requiresRedirect: true,
    };
  }
  return {
    provider: 'COD',
    label: 'Cash on Delivery',
    redirectPath: '/orders',
    requiresRedirect: false,
  };
}
