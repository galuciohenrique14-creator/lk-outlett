import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
const KEY = 'lkoutlet_wishlist_v1';

function safeParse(v, fallback) {
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function WishlistProvider({ children }) {
  const [list, setList] = useState(() => {
    if (typeof window === 'undefined') return [];
    return safeParse(localStorage.getItem(KEY), []);
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(list));
  }, [list]);

  const api = useMemo(() => {
    const toggle = (produto) => {
      setList((prev) => {
        const exists = prev.some((x) => x.id === produto.id);
        if (exists) return prev.filter((x) => x.id !== produto.id);
        return [...prev, produto];
      });
    };

    const remove = (id) => setList((prev) => prev.filter((x) => x.id !== id));
    const clear = () => setList([]);

    return { list, toggle, remove, clear };
  }, [list]);

  return React.createElement(WishlistContext.Provider, { value: api }, children);
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

