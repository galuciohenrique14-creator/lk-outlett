import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../state/cart.js';
import { useProducts } from '../../state/products.jsx';
import { useWishlist } from '../../state/wishlist.js';
import { formatBRLFromCents } from '../../utils/money.js';

export default function Product() {
  const { id } = useParams();
  const { products } = useProducts();
  const prod = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const { upsert } = useCart();
  const { toggle, list } = useWishlist();

  const [selectedSize, setSelectedSize] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const touchStartX = useRef(null);

  const images = useMemo(
    () => (prod?.imagens?.length ? prod.imagens : [prod?.imagem].filter(Boolean)),
    [prod],
  );

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  const sizes = useMemo(() => {
    if (!prod?.tamanho) return [];
    return String(prod.tamanho).split(',').map((s) => s.trim()).filter(Boolean);
  }, [prod]);

  const wished = list.some((x) => x.id === prod?.id);
  const discountPercent = prod?.precoAntigo > prod?.preco
    ? (prod.descontoPercentual || Math.round(((prod.precoAntigo - prod.preco) / prod.precoAntigo) * 100))
    : 0;

  const showPreviousImage = () => {
    setActiveImageIndex((index) => (index - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    setActiveImageIndex((index) => (index + 1) % images.length);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const distance = touchStartX.current - event.changedTouches[0].clientX;
    if (Math.abs(distance) > 40) {
      if (distance > 0) showNextImage();
      else showPreviousImage();
    }
    touchStartX.current = null;
  };

  if (!prod) return <div className="container">Produto não encontrado.</div>;

  return (
    <div className="container pDetail">
      <section className="dWrap">
        <div className="dGallery">
          <div
            className="dHero"
            aria-label="Galeria de fotos do produto"
            onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
            onTouchEnd={handleTouchEnd}
          >
            <img key={images[activeImageIndex]} src={images[activeImageIndex]} alt={`${prod.nome}, foto ${activeImageIndex + 1}`} />
            {images.length > 1 && (
              <>
                <button type="button" className="dGalleryNav previous" onClick={showPreviousImage} aria-label="Foto anterior">
                  ‹
                </button>
                <button type="button" className="dGalleryNav next" onClick={showNextImage} aria-label="Próxima foto">
                  ›
                </button>
                <span className="dGalleryCount" aria-live="polite">
                  {activeImageIndex + 1} / {images.length}
                </span>
              </>
            )}
            <div className="dZoomHint">Zoom</div>
          </div>
          <div className="dThumbRow" aria-label="Galeria">
            {images.map((src, index) => (
              <button
                type="button"
                className={`dThumb ${index === activeImageIndex ? 'active' : ''}`}
                key={src}
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Ver foto ${index + 1} de ${images.length}`}
                aria-current={index === activeImageIndex ? 'true' : undefined}
              >
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        <div className="dInfo">
          <div className="dKicker">{prod.categoria}</div>
          <h1 className="dTitle">{prod.nome}</h1>
          <p className="dDesc">{prod.descricao}</p>

          <div className="dPriceBox">
            <div className="dPriceNow">{formatBRLFromCents(prod.preco)}</div>
            {prod.precoAntigo ? <div className="dPriceOld">{formatBRLFromCents(prod.precoAntigo)}</div> : null}
          </div>
          {discountPercent > 0 && (
            <div className="dDiscount">
              {discountPercent}% de desconto · você economiza {formatBRLFromCents(prod.precoAntigo - prod.preco)}
            </div>
          )}

          <div className="dMetaRow">
            <div className="dMeta">
              <div className="dMetaLabel">Estoque</div>
              <div className={`dMetaValue ${prod.estoque > 0 ? 'ok' : 'danger'}`}>{prod.estoque} un.</div>
            </div>
            <div className="dMeta">
              <div className="dMetaLabel">Ativo</div>
              <div className={`dMetaValue ${prod.ativo ? 'ok' : 'danger'}`}>{prod.ativo ? 'Sim' : 'Não'}</div>
            </div>
          </div>

          <div className="dForm">
            <label className="dLabel">Selecione o tamanho</label>
            <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
              <option value="">Selecione...</option>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="dActions">
              <button
                className="dAdd"
                disabled={prod.estoque <= 0 || !selectedSize}
                onClick={() => {
                  upsert(prod, 1, selectedSize);
                  window.dispatchEvent(new Event('lk:notify'));
                  window.dispatchEvent(new CustomEvent('lk:open-cart'));
                }}
              >
                Adicionar ao carrinho
              </button>
              <button className={`dWish ${wished ? 'active' : ''}`} onClick={() => toggle(prod)}>
                {wished ? 'Na lista ♥' : 'Adicionar à lista'}
              </button>
            </div>

            <div className="dShare">
              <button
                className="dShareBtn"
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: prod.nome, text: prod.descricao, url });
                      return;
                    } catch {
                      // ignore
                    }
                  }
                  await navigator.clipboard.writeText(url);
                  alert('Link copiado!');
                }}
              >
                Compartilhar
              </button>
            </div>
          </div>

          <div className="dTags">
            {prod.tags?.slice(0, 6)?.map((t) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </div>

          <div className="dBack">
            <Link to="/">← Voltar</Link>
          </div>
        </div>
      </section>

      <style>{`
        .pDetail{padding:42px 0 72px}
        .dWrap{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:48px;align-items:start}
        @media(max-width:980px){.dWrap{grid-template-columns:1fr;gap:30px}}
        .dGallery{position:relative;min-width:0}
        .dHero{position:relative;border-radius:3px;border:0;overflow:hidden;background:#e9e7df;box-shadow:none;touch-action:pan-y}
        .dHero img{width:100%;height:540px;object-fit:contain;display:block;transition:opacity .25s ease;animation:galleryImageIn .35s ease both}
        @keyframes galleryImageIn{from{opacity:.5}to{opacity:1}}
        .dZoomHint{position:absolute;right:14px;top:14px;padding:7px 10px;border-radius:999px;border:1px solid rgba(255,215,0,.35);background:rgba(255,215,0,.12);color:var(--gold);font-weight:900;font-size:12px;backdrop-filter:blur(8px)}
        .dGalleryNav{position:absolute;z-index:2;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(23,23,20,.22);border-radius:50%;background:rgba(244,240,231,.88);color:#171714;font-size:30px;line-height:1;cursor:pointer;transition:background .2s,transform .2s}
        .dGalleryNav.previous{left:14px}.dGalleryNav.next{right:14px}.dGalleryNav:hover{background:white;transform:translateY(-50%) scale(1.06)}
        .dGalleryCount{position:absolute;z-index:2;left:14px;top:14px;padding:7px 10px;border-radius:999px;background:rgba(0,0,0,.58);color:white;font-size:12px;font-weight:800}
        .dThumbRow{display:flex;gap:10px;margin-top:12px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}
        .dThumb{flex:0 0 88px;padding:0;border-radius:2px;border:1px solid rgba(255,255,255,.16);overflow:hidden;background:#f4f2ec;cursor:pointer;opacity:.72;transition:opacity .2s,border-color .2s}
        .dThumb:hover,.dThumb.active{border-color:var(--gold);opacity:1}
        .dThumb img{width:100%;height:70px;padding:4px;object-fit:contain;object-position:center;display:block}

        .dInfo{position:sticky;top:104px;border:0;background:transparent;padding:10px 0}
        .dKicker{color:var(--gold);font-weight:700;letter-spacing:.16em;font-size:10px;text-transform:uppercase;margin-bottom:12px}
        .dTitle{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:42px;line-height:.98;margin:0}
        .dDesc{color:rgba(233,234,242,.68);line-height:1.65;margin:14px 0 20px}
        .dPriceBox{display:flex;align-items:baseline;gap:14px;margin-bottom:12px}
        .dPriceNow{font-family:'DM Sans',sans-serif;font-weight:700;font-size:26px;color:rgba(255,255,255,.96)}
        .dPriceOld{color:rgba(233,234,242,.55);text-decoration:line-through;font-weight:800}
        .dDiscount{display:inline-flex;margin:-5px 0 14px;padding:7px 10px;background:rgba(216,239,98,.12);color:var(--gold);font-size:12px;font-weight:800}

        .dMetaRow{display:flex;gap:30px;padding:13px 0;margin:0 0 22px;border-top:1px solid rgba(255,255,255,.15);border-bottom:1px solid rgba(255,255,255,.15)}
        .dMeta{min-width:90px}
        .dMetaLabel{color:rgba(233,234,242,.58);font-weight:600;font-size:11px}
        .dMetaValue{margin-top:6px;font-weight:700;font-family:'DM Sans',sans-serif;font-size:13px}
        .dMetaValue.ok{color:rgba(49,208,127,.95)}
        .dMetaValue.danger{color:rgba(255,77,77,.95)}

        .dForm label{display:block;color:rgba(233,234,242,.7);font-weight:800;font-size:12px;margin-bottom:8px}
        .dForm select{width:100%;background:#191a16;border:1px solid rgba(255,255,255,.22);color:var(--text);padding:12px;border-radius:2px;outline:none;margin-bottom:14px}

        .dActions{display:grid;grid-template-columns:1fr;gap:10px}
        .dAdd{background:var(--gold);border:1px solid var(--gold);color:#171714;padding:14px 12px;border-radius:2px;font-weight:800;cursor:pointer;transition:background .2s,transform .2s}
        .dAdd:not(:disabled):hover{background:#e8ff86;transform:translateY(-1px)}
        .dAdd:disabled{opacity:.45;cursor:not-allowed}
        .dWish{background:transparent;border:0;color:rgba(233,234,242,.76);padding:10px 12px;font-weight:700;cursor:pointer}
        .dWish.active{color:var(--gold)}

        .dShare{margin-top:12px}
        .dShareBtn{width:100%;background:transparent;border:1px solid rgba(255,255,255,.2);color:rgba(233,234,242,.9);padding:11px 12px;border-radius:2px;font-weight:700;cursor:pointer;transition:border-color .2s,color .2s}
        .dShareBtn:hover{border-color:var(--gold);color:var(--gold)}
        .dTags{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
        .tag{padding:4px 0;margin-right:8px;color:rgba(216,239,98,.82);font-weight:700;font-size:11px}

        .dBack{margin-top:14px;color:rgba(233,234,242,.7)}
        .dBack a{color:inherit;text-decoration:underline}
        @media(max-width:980px){.dInfo{position:static}.dHero img{height:480px}}
        @media(max-width:520px){.pDetail{padding:20px 0 48px}.dWrap{gap:24px}.dHero img{height:340px}.dTitle{font-size:36px}.dMetaRow{gap:22px}}
        @media(prefers-reduced-motion:reduce){.dHero img,.dGalleryNav,.dThumb,.dAdd,.dShareBtn{animation:none!important;transition:none!important}}
      `}</style>
    </div>
  );
}
