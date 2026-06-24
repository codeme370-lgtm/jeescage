import axios from 'axios';

export async function createHubtelCheckoutSession({ amount, email, orderIds, userId, callbackUrl, description }) {
  const baseUrl = process.env.HUBTEL_API_BASE_URL || 'https://api.hubtel.com/v1/checkout';
  const clientId = process.env.HUBTEL_CLIENT_ID;
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Hubtel credentials are not configured');
  }

  const payload = {
    amount: Math.round(Number(amount) * 100),
    currency: 'GHS',
    email: email || 'customer@example.com',
    description: description || 'Jeeshop order payment',
    callbackUrl,
    metadata: {
      orderIds: orderIds.join(','),
      userId,
      appId: 'jeeshop',
      paymentProvider: 'HUBTEL',
    },
  };

  const response = await axios.post(`${baseUrl}/initiate`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
  });

  const data = response?.data?.data || response?.data || {};

  return {
    authorizationUrl: data.authorizationUrl || data.checkoutUrl || data.redirectUrl || null,
    reference: data.reference || data.transactionId || null,
    raw: data,
  };
}
