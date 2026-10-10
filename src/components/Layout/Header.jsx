import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../state/cart.js';
import { useWishlist } from '../../state/wishlist.js';


function GoldCartIcon() {
  return (
    <div className="cartIconWrap" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 7H21L19.5 16.2C19.4 16.9 18.8 17.4 18.1 17.4H8.2C7.6 17.4 7.1 17 7 16.4L5 3.8C4.9 3.2 4.4 2.8 3.8 2.8H2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 21C9.55228 21 10 20.5523 10 20C10 19.4477 9.55228 19 9 19C8.44772 19 8 19.4477 8 20C8 20.5523 8.44772 21 9 21Z"
          fill="currentColor"
        />
        <path
          d="M17 21C17.5523 21 18 20.5523 18 20C18 19.4477 17.5523 19 17 19C16.4477 19 16 19.4477 16 20C16 20.5523 16.4477 21 17 21Z"
          fill="currentColor"
        />
      </svg>
      <span className="cartBadge" />
    </div>
  );
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items } = useCart();
  const { list } = useWishlist();
  const [adminMode, setAdminMode] = useState(false);


  const cartCount = useMemo(() => items.reduce((a, it) => a + it.qtd, 0), [items]);
  const wishCount = list.length;

  useEffect(() => {
    setAdminMode(false);
  }, [navigate]);

  return (
    <header className="lkHeader">
      <div className="container lkHeaderInner">
        <Link to="/" className="lkBrand" aria-label="LK OUTLET">
          <img className="lkBrandLogo" src="/images/logo.jpeg" alt="" />
          <span className="lkBrandLockup">
            <span className="lkBrandText">LK OUTLET</span>
            <span className="lkBrandSport">FUTSAL · SOCIETY</span>
          </span>
        </Link>

        <nav className="lkNav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            Loja
          </Link>
          <Link to="/lista">Lista</Link>
          <Link to="/admin/login" className={adminMode ? 'active' : ''}>
            Admin
          </Link>
        </nav>

        <div className="lkHeaderActions">
          <Link
            to="/lista"
            className="lkIconBtn"
            aria-label="Lista de desejos"
            onClick={(e) => {
              // abre gaveta rapidamente também
              window.dispatchEvent(new Event('lk:open-wishlist'));
            }}
          >
            <span className="iconHeart">♥</span>
            <span className="pill">{wishCount}</span>
          </Link>


          <button
            className="lkIconBtn lkCartBtn"
            aria-label="Abrir carrinho"
            onClick={() => {
              // Drawer aberto via state
              window.dispatchEvent(new CustomEvent('lk:open-cart'));
              if (location.pathname !== '/carrinho') {
                navigate('/carrinho');
              }
            }}
          >
            <GoldCartIcon />
            <span className="pill">{cartCount}</span>
          </button>
        </div>
      </div>

      <style>{`
        .lkHeader{position:sticky;top:0;z-index:50;background:rgba(16,17,15,.94);border-bottom:1px solid rgba(255,255,255,.12)}
        .lkHeaderInner{display:flex;align-items:center;justify-content:space-between;padding:12px 0;gap:14px}
        .lkBrand{display:flex;align-items:center;gap:10px}
        .lkBrandLogo{width:46px;height:46px;padding:2px;object-fit:contain;background:#050505;border-radius:8px;border:1px solid rgba(216,239,98,.58);box-shadow:0 4px 14px rgba(0,0,0,.3);transition:transform .25s ease,border-color .25s ease}
        .lkBrand:hover .lkBrandLogo{transform:translateY(-1px);border-color:var(--gold)}
        .lkBrandLockup{display:grid;gap:3px}
        .lkBrandText{font-family:'DM Sans',sans-serif;font-weight:900;letter-spacing:.08em;font-size:13px;line-height:1;color:rgba(255,255,255,.96)}
        .lkBrandSport{font-family:'DM Sans',sans-serif;font-weight:800;letter-spacing:.1em;font-size:8px;line-height:1;color:var(--gold)}
        .lkNav{display:flex;gap:24px;align-items:center}
        .lkNav a{color:rgba(233,234,242,.68);font-weight:600;font-size:12px;position:relative;padding:8px 0;transition:color .2s}
        .lkNav a.active,.lkNav a:hover{color:var(--gold)}
        .lkHeaderActions{display:flex;gap:10px;align-items:center}
        .lkIconBtn{background:transparent;border:0;color:var(--text);border-radius:2px;padding:8px;cursor:pointer;display:flex;gap:8px;align-items:center;transition:color .2s}
        .lkIconBtn:hover{color:var(--gold)}
        .lkCartBtn{position:relative}
        .pill{min-width:18px;height:18px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;color:#171714;font-weight:800;font-size:10px}
        .cartIconWrap{position:relative;color:var(--gold)}
        .cartBadge{position:absolute;right:-8px;top:-7px;width:8px;height:8px;border-radius:999px;background:var(--gold);box-shadow:0 0 0 0 rgba(255,215,0,.4);animation:pulse 1.4s ease-in-out infinite}
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,215,0,.45)}70%{box-shadow:0 0 0 10px rgba(255,215,0,0)}}
        @media(max-width:640px){.lkHeaderInner{flex-wrap:wrap;padding:9px 0;gap:7px}.lkBrandLogo{width:42px;height:42px}.lkNav{order:3;flex:1 0 100%;justify-content:center;gap:7px}.lkNav a{font-size:11px;padding:5px 7px}.lkHeaderActions{gap:6px}.lkIconBtn{padding:7px 8px;gap:7px}.pill{min-width:22px;height:20px}}
      `}</style>
    </header>
  );
}

