export function getCartCount(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((a, it) => a + (Number(it.qtd) || 0), 0);
}

export function getWishlistCount(list) {
  if (!Array.isArray(list)) return 0;
  return list.length;
}

