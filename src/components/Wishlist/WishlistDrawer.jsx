import React, { useEffect, useMemo, useState } from 'react';
import { useWishlist } from '../../state/wishlist.js';
import { Link } from 'react-router-dom';

export default function WishlistDrawer() {
  const { list, toggle } = useWishlist();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setOpen(true);
    };
    window.addEventListener('lk:open-wishlist', handler);
    return () => window.removeEventListener('lk:open-wishlist', handler);
  }, []);

  if (!open) return null;

  return (
    <div className="drawerOverlay" onMouseDown={() => setOpen(false)}>
      <aside className="wishDrawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="head">
          <div>
            <div className="title">Lista de desejos</div>
            <div className="muted">Persistida no seu navegador</div>
          </div>
          <button className="close" onClick={() => setOpen(false)}>×</button>
        </div>

        <div className="body">
          {!list.length ? (
            <div className="empty">Nada por aqui ainda.</div>
          ) : (
            <div className="list">
              {list.map((p) => (
                <div className="item" key={p.id}>
                  <img src={p.imagem} alt={p.nome} />
                  <div className="info">
                    <div className="name">{p.nome}</div>
                    <div className="actions">
                      <Link to={`/produto/${p.id}`} onClick={() => setOpen(false)} className="miniLink">Ver</Link>
                      <button className="miniBtn" onClick={() => toggle(p)}>Remover</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          .drawerOverlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:121;display:flex;justify-content:flex-end}
          .wishDrawer{width:min(380px, 96vw);height:100%;background:rgba(5,6,10,.96);border-left:1px solid rgba(255,255,255,.08);box-shadow:-30px 0 120px rgba(0,0,0,.7);display:flex;flex-direction:column}
          .head{padding:14px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;justify-content:space-between;gap:12px}
          .title{font-family:'Plus Jakarta Sans';font-weight:1000;font-size:20px}
          .muted{color:rgba(233,234,242,.7);font-weight:800;margin-top:6px;font-size:12px}
          .close{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:rgba(233,234,242,.9);border-radius:14px;width:38px;height:38px;font-weight:1000;cursor:pointer}
          .body{padding:12px 14px;flex:1;overflow:auto}
          .empty{color:rgba(233,234,242,.7);font-weight:900;padding:22px 0;text-align:center}
          .list{display:flex;flex-direction:column;gap:10px}
          .item{display:grid;grid-template-columns:92px 1fr;gap:12px;align-items:center;padding:10px;border-radius:18px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02)}
          .item img{width:92px;height:70px;object-fit:cover;border-radius:14px;border:1px solid rgba(255,255,255,.06)}
          .name{font-weight:1000;font-family:'Plus Jakarta Sans';font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .actions{display:flex;gap:10px;margin-top:10px;align-items:center}
          .miniLink{padding:10px 12px;border-radius:14px;border:1px solid rgba(255,215,0,.35);background:rgba(255,215,0,.12);color:var(--gold);font-weight:1000}
          .miniBtn{padding:10px 12px;border-radius:14px;border:1px solid rgba(255,77,77,.35);background:rgba(255,77,77,.12);color:rgba(255,77,77,.95);font-weight:1000;cursor:pointer}
        `}</style>
      </aside>
    </div>
  );
}

