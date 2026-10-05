import React from 'react';
import { formatBRLFromCents } from '../../utils/money.js';
import { Link } from 'react-router-dom';

export default function ProductCard({ produto, onAddToCart, onToggleWishlist, wished, style }) {
  const discountPercent =
    produto && produto.precoAntigo && produto.precoAntigo > produto.preco
      ? Math.round(((produto.precoAntigo - produto.preco) / produto.precoAntigo) * 100)
      : null;

  return (
    <article className="pCard" style={style}>
      <Link to={`/produto/${produto.id}`} className="pCardMedia">
        <img src={produto.imagem} alt={produto.nome} loading="lazy" />
        {produto.destaque && <div className="pBadge">Destaque</div>}
        {discountPercent !== null && <div className="pBadge gold">-{discountPercent}%</div>}
      </Link>

      <div className="pCardBody">
        <div className="pCardTop">
          <div className="pCardTitle" title={produto.nome}>
            {produto.nome}
          </div>
          <button
            className={`pWish ${wished ? 'active' : ''}`}
            aria-label="Alternar lista de desejos"
            onClick={() => onToggleWishlist?.(produto)}
          >
            ♥
          </button>
        </div>

        <div className="pCardDesc">{produto.descricao}</div>

        <div className="pPriceRow">
          <span className="pPrice">{formatBRLFromCents(produto.preco)}</span>
          {produto.precoAntigo ? (
            <span className="pOldPrice">{formatBRLFromCents(produto.precoAntigo)}</span>
          ) : null}
        </div>

        <Link className="pAdd" to={`/produto/${produto.id}`}>
          Escolher numeração
        </Link>
      </div>

      <style>{`
        .pCard{min-width:0;display:flex;flex-direction:column;background:transparent;border:0;overflow:hidden;transition:transform .3s ease}
        .pCard:hover{transform:translateY(-3px)}
        .pCardMedia{display:grid;place-items:center;position:relative;aspect-ratio:1/1;overflow:hidden;background:#f4f2ec}
        .pCardMedia img{width:100%;height:100%;padding:10px;object-fit:contain;object-position:center;transition:filter .4s ease,transform .6s cubic-bezier(.2,.7,.25,1)}
        .pCard:hover .pCardMedia img{transform:scale(1.02);filter:saturate(1.06)}
        .pBadge{position:absolute;left:12px;top:12px;background:#d8ef62;color:#171714;padding:6px 9px;font-weight:800;font-size:10px;letter-spacing:.08em;text-transform:uppercase;z-index:2}
        .pBadge.gold{left:auto;right:12px;background:#d8ef62;color:#171714}
        .pCardBody{flex:1;padding:13px 0 0;display:flex;flex-direction:column;gap:8px}
        .pCardTop{display:flex;gap:10px;align-items:flex-start;justify-content:space-between}
        .pCardTitle{font-weight:600;font-family:'Cormorant Garamond',Georgia,serif;font-size:23px;line-height:1.05;white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;min-height:48px}
        .pWish{flex:none;border:1px solid rgba(255,255,255,.18);background:transparent;color:rgba(233,234,242,.85);border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:16px;transition:transform .2s ease,border-color .2s ease,color .2s ease}
        .pWish:hover{transform:scale(1.08);border-color:var(--gold);color:var(--gold)}
        .pWish.active{border-color:var(--gold);color:var(--gold);background:rgba(216,239,98,.1)}
        .pCardDesc{color:rgba(233,234,242,.62);font-size:12px;line-height:1.5;min-height:36px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .pPriceRow{display:flex;align-items:baseline;gap:10px}
        .pPrice{font-weight:700;font-family:'DM Sans',sans-serif;font-size:16px;color:rgba(255,255,255,.95)}
        .pOldPrice{color:rgba(233,234,242,.52);text-decoration:line-through;font-size:13px;font-weight:700}
        .pAdd{display:block;text-align:center;text-decoration:none;margin-top:auto;padding:10px 2px 4px;border-top:1px solid rgba(255,255,255,.18);color:var(--gold);font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;transition:border-color .2s,color .2s}
        .pAdd:hover{border-color:var(--gold);color:#e8ff86}
        @media(prefers-reduced-motion:reduce){.pCard,.pCardMedia img,.pWish{transition:none!important;animation:none!important}}
      `}</style>
    </article>
  );
}

