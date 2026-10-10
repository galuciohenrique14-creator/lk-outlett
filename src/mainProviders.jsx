import React from 'react';
import { CartProvider } from './state/cart.js';
import { ProductsProvider } from './state/products.jsx';
import { WishlistProvider } from './state/wishlist.js';

export default function MainProviders({ children }) {
  return (
    <ProductsProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </ProductsProvider>
  );
}
