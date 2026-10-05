import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'lkoutlet_cart_v1';

function safeParse(v, fallback) {
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    return safeParse(localStorage.getItem(KEY), []);
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const api = useMemo(() => {
    const upsert = (produto, qtd = 1, tamanho = '') => {
      const selectedSize = String(tamanho || String(produto.tamanho || '').split(',')[0] || '');
      const cartKey = `${produto.id}:${selectedSize}`;
      setItems((prev) => {
        const idx = prev.findIndex((p) => (p.cartKey || `${p.id}:${p.tamanho || ''}`) === cartKey);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qtd: Math.max(1, next[idx].qtd + qtd) };
          return next;
        }
        return [
          ...prev,
          {
            id: produto.id,
            cartKey,
            tamanho: selectedSize,
            nome: produto.nome,
            precoAtual: produto.preco,
            imagem: produto.imagem,
            qtd: Math.max(1, qtd)
          }
        ];
      });
    };

    const remove = (cartKey) => setItems((prev) => prev.filter((x) => (x.cartKey || `${x.id}:${x.tamanho || ''}`) !== cartKey));

    const setQtd = (cartKey, qtd) => {
      const n = Math.max(1, Number(qtd) || 1);
      setItems((prev) => prev.map((x) => ((x.cartKey || `${x.id}:${x.tamanho || ''}`) === cartKey ? { ...x, qtd: n } : x)));
    };

    const setTamanho = (cartKey, tamanho) => {
      setItems((prev) => {
        const selected = prev.find((item) => (item.cartKey || `${item.id}:${item.tamanho || ''}`) === cartKey);
        if (!selected) return prev;
        const nextKey = `${selected.id}:${tamanho}`;
        const duplicate = prev.find((item) => (item.cartKey || `${item.id}:${item.tamanho || ''}`) === nextKey);
        if (duplicate && nextKey !== cartKey) {
          return prev
            .filter((item) => (item.cartKey || `${item.id}:${item.tamanho || ''}`) !== cartKey)
            .map((item) => ((item.cartKey || `${item.id}:${item.tamanho || ''}`) === nextKey ? { ...item, qtd: item.qtd + selected.qtd } : item));
        }
        return prev.map((item) => ((item.cartKey || `${item.id}:${item.tamanho || ''}`) === cartKey
          ? { ...item, cartKey: nextKey, tamanho }
          : item));
      });
    };

    const clear = () => setItems([]);

    return { items, upsert, remove, setQtd, setTamanho, clear };
  }, [items]);

  return React.createElement(CartContext.Provider, { value: api }, children);
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


