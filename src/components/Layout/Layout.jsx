import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from '../Cart/CartDrawer.jsx';
import WishlistDrawer from '../Wishlist/WishlistDrawer.jsx';

export default function Layout() {
  const location = useLocation();

  return (
    <div>
      <Header />
      <CartDrawer />
      <WishlistDrawer />

      <main style={{ minHeight: '60vh' }}>
        <Outlet key={location.pathname} />
      </main>
      <Footer />
    </div>
  );
}


