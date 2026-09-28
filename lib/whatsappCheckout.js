export function sanitizeWhatsAppNumber(value = '') {
  const cleaned = String(value || '').replace(/\D/g, '');

  if (!cleaned) {
    return '233248608602';
  }

  if (cleaned.startsWith('0')) {
    return `233${cleaned.slice(1)}`;
  }

  return cleaned;
}

export function getBusinessWhatsAppNumber() {
  return sanitizeWhatsAppNumber(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
      process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER ||
      process.env.NEXT_PUBLIC_BUSINESS_PHONE ||
      '233248608602'
  );
}

export function buildWhatsAppCheckoutMessage({ items = [], subtotal = 0, total = 0, currency = 'GHS' }) {
  const lines = [
    'Hello, I would like to place an order.',
    '',
    '*Order Summary*'
  ];

  if (!Array.isArray(items) || items.length === 0) {
    lines.push('No items in cart.');
  } else {
    items.forEach((item, index) => {
      const productName = String(
        item.productName || item.name || item.product?.name || `Item ${index + 1}`
      ).trim();
      const quantity = Number(item.quantity ?? item.totalQuantity ?? 1) || 1;
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
      const variant = item.variant || item.selectedColor || item.selectedSize || item.selectedVariant || item.size || item.colour || item.color || null;

      lines.push(`• Product: ${productName}`);
      lines.push(`Quantity: ${quantity}`);
      lines.push(`Price: ${currency}${Number(unitPrice).toFixed(2)}`);
      if (variant) {
        lines.push(`Variant: ${variant}`);
      }
      lines.push('');
    });
  }

  lines.push(`*Subtotal:* ${currency}${Number(subtotal).toFixed(2)}`);
  lines.push(`*Total:* ${currency}${Number(total).toFixed(2)}`);
  lines.push('');
  lines.push('Please confirm my order and let me know how I can complete the payment.');
  lines.push('');
  lines.push('Thank you.');

  return lines.join('\n').trim();
}

export function createWhatsAppCheckoutLink({ number = getBusinessWhatsAppNumber(), message = '' } = {}) {
  const phoneNumber = sanitizeWhatsAppNumber(number);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}
