import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../../state/cart.js';
import { produtosSeed } from '../../data/products.js';
import { formatBRLFromCents } from '../../utils/money.js';
import { useNavigate } from 'react-router-dom';

function findProduto(id) {
  return produtosSeed.find((p) => p.id === id) || null;
}

export default function CartDrawer() {
  const navigate = useNavigate();
  const { items, remove, setQtd } = useCart();
  const [open, setOpen] = useState(false);

  const enriched = useMemo(() => {
    return items
      .map((it) => {
        const p = findProduto(it.id);
        if (!p) return null;
        return {
          ...p,
          qtd: it.qtd,
          tamanho: it.tamanho || String(p.tamanho || '').split(',')[0] || '38',
          cartKey: it.cartKey || `${it.id}:${it.tamanho || ''}`
        };
      })
      .filter(Boolean);
  }, [items]);

  const subtotal = useMemo(() => enriched.reduce((a, x) => a + x.preco * x.qtd, 0), [enriched]);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    const closeHandler = () => setOpen(false);

    window.addEventListener('lk:open-cart', openHandler);
    window.addEventListener('lk:close-cart', closeHandler);

    return () => {
      window.removeEventListener('lk:open-cart', openHandler);
      window.removeEventListener('lk:close-cart', closeHandler);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="drawerOverlay" onMouseDown={() => setOpen(false)}>
      <aside className="cartDrawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawerHead">
          <div>
            <div className="drawerTitle">Sua sacola</div>
            <div className="drawerMuted">Confira os produtos antes de finalizar</div>
          </div>
          <button className="drawerClose" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>

        <div className="drawerBody">
          {enriched.length ? (
            <div className="drawerList">
              {enriched.map((x) => (
                <div key={x.id} className="drawerItem">
                  <img src={x.imagem} alt={x.nome} />
                  <div className="dInfo">
                    <div className="dName">{x.nome}</div>
                    <div className="dPrice">{formatBRLFromCents(x.preco)}</div>
                    <div className="dQty">
                      <button onClick={() => setQtd(x.cartKey, Math.max(1, x.qtd - 1))}>-</button>
                      <span>{x.qtd}</span>
                      <button onClick={() => setQtd(x.cartKey, x.qtd + 1)}>+</button>
                    </div>
                    <div className="dSize">Numeração {x.tamanho}</div>
                  </div>
                  <button className="dRemove" onClick={() => remove(x.cartKey)}>
                    Remover
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyDrawer">Carrinho vazio.</div>
          )}
        </div>

        <div className="drawerFoot">
          <div className="sum">
            <div className="sumRow"><span>Subtotal</span><b>{formatBRLFromCents(subtotal)}</b></div>
            <div className="sumRow total"><span>Total parcial</span><b>{formatBRLFromCents(subtotal)}</b></div>
          </div>

          <button
            className="waFinalize"
            disabled={!enriched.length}
            onClick={() => {
              setOpen(false);
              navigate('/carrinho');
            }}
          >
            Informar entrega e pagamento
          </button>

          <div className="drawerHint">O WhatsApp será aberto depois de preencher seus dados.</div>
        </div>

        <style>{`
          .drawerOverlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:120;display:flex;justify-content:flex-end}
          .cartDrawer{width:min(420px, 96vw);height:100%;background:rgba(5,6,10,.96);border-left:1px solid rgba(255,255,255,.08);box-shadow:-30px 0 120px rgba(0,0,0,.7);display:flex;flex-direction:column}
          .drawerHead{padding:14px 14px 12px;display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid rgba(255,255,255,.06)}
          .drawerTitle{font-family:'Plus Jakarta Sans';font-weight:1000;font-size:20px}
          .drawerMuted{color:rgba(233,234,242,.7);font-weight:800;margin-top:6px;font-size:12px}
          .drawerClose{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:rgba(233,234,242,.9);border-radius:14px;width:38px;height:38px;font-weight:1000;cursor:pointer}
          .drawerBody{padding:12px 14px;flex:1;overflow:auto}
          .drawerItem{display:grid;grid-template-columns:92px 1fr 92px;gap:12px;align-items:center;padding:10px;border-radius:18px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-bottom:10px}
          .drawerItem img{width:92px;height:70px;object-fit:cover;border-radius:14px;border:1px solid rgba(255,255,255,.06)}
          .dName{font-weight:1000;font-family:'Plus Jakarta Sans';font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .dPrice{margin-top:6px;color:rgba(233,234,242,.7);font-weight:900;font-size:12px}.dSize{margin-top:5px;color:var(--gold);font-size:11px;font-weight:800}
          .dQty{display:flex;align-items:center;gap:10px;margin-top:8px}
          .dQty button{width:32px;height:32px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:rgba(233,234,242,.9);font-weight:1000;cursor:pointer}
          .dQty span{min-width:22px;text-align:center;font-weight:1000}
          .dRemove{background:rgba(255,77,77,.12);border:1px solid rgba(255,77,77,.35);color:rgba(255,77,77,.95);border-radius:14px;padding:10px 8px;font-weight:1000;cursor:pointer}

          .couponRow2{display:grid;grid-template-columns:1fr 120px;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)}
          .couponRow2 label{display:flex;flex-direction:column;gap:8px;color:rgba(233,234,242,.7);font-weight:900;font-size:12px}
          .couponRow2 input{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:var(--text);padding:11px 12px;border-radius:14px;outline:none}
          .couponRow2 button{background:rgba(255,215,0,.16);border:1px solid rgba(255,215,0,.42);color:var(--gold);padding:12px;border-radius:14px;font-weight:1000;cursor:pointer}

          .cupStatus{margin-top:10px;font-weight:1000}
          .cupStatus.ok{color:rgba(49,208,127,.95)}
          .cupStatus.danger{color:rgba(255,77,77,.95)}

          .emptyDrawer{color:rgba(233,234,242,.7);font-weight:900;padding:22px 0;text-align:center}

          .drawerFoot{padding:14px;border-top:1px solid rgba(255,255,255,.06)}
          .sumRow{display:flex;justify-content:space-between;align-items:center;color:rgba(233,234,242,.8);font-weight:900;margin-top:8px}
          .sumRow b{color:rgba(255,255,255,.92)}
          .sumRow.gold b{color:var(--gold)}
          .sumRow.total{margin-top:12px;font-size:16px}
          .waFinalize{margin-top:14px;width:100%;background:rgba(255,215,0,.18);border:1px solid rgba(255,215,0,.45);color:var(--gold);padding:14px 12px;border-radius:18px;font-weight:1000;cursor:pointer}
          .waFinalize:disabled{opacity:.45;cursor:not-allowed}
          .drawerHint{margin-top:10px;color:rgba(233,234,242,.62);font-size:12px;font-weight:800}
        `}</style>
      </aside>
    </div>
  );
}

