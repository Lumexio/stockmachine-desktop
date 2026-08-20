export function getPlanLimits(planId) {
  switch (planId) {
    case 'max': return { products: 500 };
    case 'pro': return { products: 150 };
    case 'free':
    default:
      return { products: 50 };
  }
}

export function isPlanLimitReached(planId, currentCount, entity = 'products') {
  if (entity !== 'products') return false;
  const limits = getPlanLimits(planId);
  return currentCount >= limits.products;
}
