import React from 'react';
import { CartProvider } from './state/cart.js';
import { WishlistProvider } from './state/wishlist.js';

export default function MainProviders({ children }) {
  return (
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
}

