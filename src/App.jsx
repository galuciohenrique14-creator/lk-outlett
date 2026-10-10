import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import Home from './pages/Home/Home.jsx';
import Product from './pages/Product/Product.jsx';
import Wishlist from './pages/Wishlist/Wishlist.jsx';
import Cart from './pages/Cart/Cart.jsx';
import AdminLogin from './pages/Admin/AdminLogin.jsx';
import Admin from './pages/Admin/Admin.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/produto/:id" element={<Product />} />
        <Route path="/lista" element={<Wishlist />} />
        <Route path="/carrinho" element={<Cart />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

