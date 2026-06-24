export function isDatabaseUnavailableError(error) {
  if (!error) return false;

  const message = [error?.message, error?.cause?.message, error?.cause?.code]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return /fetch failed|connect timeout|connect timeout error|neondb|database.*connect|econnrefused|timed out|temporary failure/i.test(message);
}

export function getFallbackPayloadForRoute(routeName) {
  switch (routeName) {
    case 'products':
      return { products: [] };
    case 'videos':
      return [];
    case 'categories':
      return { categories: [] };
    case 'auth-me':
      return { user: null };
    default:
      return {};
  }
}
