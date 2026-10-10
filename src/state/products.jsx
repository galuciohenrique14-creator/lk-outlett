import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getProdutos, PRODUCTS_STORAGE_KEY } from '../data/products.js';

const ProductsContext = createContext(null);

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => getProdutos());

  const upsert = useCallback((product) => {
    const index = products.findIndex((item) => item.id === product.id);
    const next = index < 0
      ? [product, ...products]
      : products.map((item) => item.id === product.id ? product : item);

    saveProducts(next);
    setProducts(next);
    return product;
  }, [products]);

  const remove = useCallback((id) => {
    const next = products.filter((item) => item.id !== id);
    saveProducts(next);
    setProducts(next);
  }, [products]);

  const value = useMemo(() => ({ products, upsert, remove }), [products, upsert, remove]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within ProductsProvider');
  return context;
}
