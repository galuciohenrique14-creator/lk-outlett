import React from 'react';
import { useWishlist } from '../../state/wishlist.js';
import ProductCard from '../../components/Product/ProductCard.jsx';

export default function Wishlist() {
  const { list, toggle, remove } = useWishlist();

  if (!list.length) {
    return (
      <div className="container">
        <div className="emptyBox">Sua lista de desejos está vazia.</div>
        <style>{`.emptyBox{margin:26px 0;padding:18px;border-radius:18px;border:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.12);color:rgba(233,234,242,.75);font-weight:800}`}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="wishHeader">
        <h2 className="wishTitle">Lista de desejos</h2>
      </div>
      <div className="pGrid">
        {list.map((p) => (
          <ProductCard
            key={p.id}
            produto={p}
            wished={true}
            onToggleWishlist={toggle}
            onAddToCart={() => {
              // carrinho via adicionar no card (aciona upsert no Home apenas). Mantemos simples: sem ação aqui.
              alert('Use o carrinho pelo botão no produto na vitrine.');
            }}
          />
        ))}
      </div>
      <style>{`
        .wishHeader{margin:18px 0}
        .wishTitle{font-family:'Plus Jakarta Sans';font-weight:1000;font-size:26px;margin:0}
        .pGrid{display:grid;grid-template-columns:repeat(4, minmax(0,1fr));gap:14px}
        @media(max-width:1100px){.pGrid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:820px){.pGrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:520px){.pGrid{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}

