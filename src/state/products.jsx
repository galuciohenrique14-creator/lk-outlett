import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getProdutos, produtosSeed, PRODUCTS_STORAGE_KEY } from '../data/products.js';
import {
  fetchSharedProducts,
  isSupabaseConfigured,
  removeSharedProduct,
  saveSharedProduct,
  saveSharedProducts
} from '../data/supabase.js';

const ProductsContext = createContext(null);

function cacheProducts(products) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => getProdutos());
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');
  const refreshSequence = useRef(0);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    const requestId = ++refreshSequence.current;
    setLoading(true);
    try {
      let rows = await fetchSharedProducts();
      if (requestId !== refreshSequence.current) return;
      if (!rows.length && !sessionStorage.getItem('lkoutlet_supabase_access_token')) {
        setError('O catálogo compartilhado ainda não tem produtos. Entre como administrador para publicar o catálogo inicial.');
        return;
      }
      if (!rows.length && sessionStorage.getItem('lkoutlet_supabase_access_token')) {
        const cachedCatalog = getProdutos();
        const initialCatalog = cachedCatalog.length ? cachedCatalog : produtosSeed;
        if (initialCatalog.length) {
          const migrated = await saveSharedProducts(initialCatalog);
          if (requestId !== refreshSequence.current) return;
          rows = migrated.map((data) => ({ id: data.id, data }));
        }
      }
      if (requestId !== refreshSequence.current) return;
      const sharedProducts = rows.map((row) => row.data);
      setProducts(sharedProducts);
      if (sharedProducts.length || sessionStorage.getItem('lkoutlet_supabase_access_token')) {
        try {
          cacheProducts(sharedProducts);
        } catch (cacheError) {
          setError(`Catálogo sincronizado, mas não foi possível salvar a cópia local: ${cacheError.message}`);
          return;
        }
      }
      setError('');
    } catch (loadError) {
      if (requestId === refreshSequence.current) {
        setError(`Não foi possível sincronizar o catálogo compartilhado: ${loadError.message}`);
      }
    } finally {
      if (requestId === refreshSequence.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener('lk:products-refresh', refresh);
    return () => window.removeEventListener('lk:products-refresh', refresh);
  }, [refresh]);

  const upsert = useCallback(async (product) => {
    const saved = isSupabaseConfigured ? await saveSharedProduct(product) : product;
    const index = products.findIndex((item) => item.id === saved.id);
    const next = index < 0
      ? [saved, ...products]
      : products.map((item) => item.id === saved.id ? saved : item);
    if (!isSupabaseConfigured) {
      cacheProducts(next);
      setProducts(next);
      setError('');
      return;
    }
    setProducts(next);
    try {
      cacheProducts(next);
    } catch (cacheError) {
      setError(`Produto sincronizado, mas a cópia local não pôde ser salva: ${cacheError.message}`);
    }
  }, [products]);

  const remove = useCallback(async (id) => {
    if (isSupabaseConfigured) await removeSharedProduct(id);
    const next = products.filter((item) => item.id !== id);
    if (!isSupabaseConfigured) {
      cacheProducts(next);
      setProducts(next);
      setError('');
      return;
    }
    setProducts(next);
    try {
      cacheProducts(next);
    } catch (cacheError) {
      setError(`Produto removido do catálogo compartilhado, mas a cópia local não pôde ser atualizada: ${cacheError.message}`);
    }
  }, [products]);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    remote: isSupabaseConfigured,
    refresh,
    upsert,
    remove
  }), [products, loading, error, refresh, upsert, remove]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within ProductsProvider');
  return context;
}
