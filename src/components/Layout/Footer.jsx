import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="lkFooter">
      <div className="container lkFooterInner">
        <div>
          <div className="lkFooterBrand"><img src="/images/logo.jpeg" alt="Logo LK Outlet" /> <span>LK OUTLET</span></div>
          <div className="lkFooterMuted">Chuteiras para jogar com a sua identidade.</div>
        </div>
        <div className="lkFooterLinks">
          <Link to="/" className="lkFooterLink">Loja</Link>
          <Link to="/lista" className="lkFooterLink">Lista de desejos</Link>
          <Link to="/admin/login" className="lkFooterLink">Admin</Link>
        </div>
      </div>

      <style>{`
        .lkFooter{padding:26px 0 36px;border-top:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.1)}
        .lkFooterInner{display:flex;gap:16px;align-items:flex-start;justify-content:space-between}
        .lkFooterBrand{display:flex;align-items:center;gap:12px;font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-weight:600;color:var(--gold);letter-spacing:.12em}.lkFooterBrand img{width:42px;height:42px;object-fit:cover;border-radius:50%;border:2px solid rgba(216,239,98,.68);box-shadow:0 0 0 4px rgba(216,239,98,.08)}
        .lkFooterMuted{color:rgba(233,234,242,.7);margin-top:8px;font-size:14px}
        .lkFooterLinks{display:flex;gap:14px;flex-wrap:wrap}
        .lkFooterLink{color:rgba(233,234,242,.75);font-weight:600}
        .lkFooterLink:hover{color:var(--text);text-decoration:underline}
        @media(max-width:720px){.lkFooterInner{flex-direction:column}}
      `}</style>
    </footer>
  );
}

