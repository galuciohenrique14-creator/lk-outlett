import React, { useMemo, useState } from 'react';
import { MODALIDADES } from '../../data/products.js';
import ProductCard from '../../components/Product/ProductCard.jsx';
import { useCart } from '../../state/cart.js';
import { useProducts } from '../../state/products.jsx';
import { useWishlist } from '../../state/wishlist.js';

export default function Home() {
  const { items } = useCart();
  const { products, loading: productsLoading, error: catalogError } = useProducts();
  const { list, toggle } = useWishlist();
  const [modality, setModality] = useState('Todas');
  const [search, setSearch] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [sort, setSort] = useState('destaques');

  const filtered = useMemo(() => {
    const minCents = min === '' ? 0 : Number(min) * 100;
    const maxCents = max === '' ? Infinity : Number(max) * 100;
    const query = search.trim().toLocaleLowerCase('pt-BR');
    let list = products.filter((p) => p.ativo);

    if (modality !== 'Todas') list = list.filter((p) => p.modalidade === modality);
    if (query) {
      list = list.filter((product) =>
        [product.nome, product.descricao, product.categoria, product.modalidade, ...(product.tags || [])]
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(query),
      );
    }
    list = list.filter((product) => product.preco >= minCents && product.preco <= maxCents);
    if (sort === 'menor_preco') list = [...list].sort((a, b) => a.preco - b.preco);
    if (sort === 'maior_preco') list = [...list].sort((a, b) => b.preco - a.preco);
    if (sort === 'destaques') list = [...list].sort((a, b) => Number(b.destaque) - Number(a.destaque));

    return list;
  }, [modality, max, min, search, sort, products]);

  const cartCount = items.reduce((total, item) => total + item.qtd, 0);

  return (
    <div className="storefront">
      <div className="announcement">PEÇAS SELECIONADAS · ESTILO QUE FICA</div>

      <section className="storeHero" aria-labelledby="hero-title">
        <img
          className="storeHeroImage"
          src="/images/chuteira-turquesa.jpeg"
          alt="Chuteira turquesa da coleção LK Outlet"
          loading="eager"
        />
        <div className="storeHeroShade" />
        <div className="storeHeroContent">
          <p className="heroEyebrow">LK OUTLET · FUTEBOL</p>
          <h1 id="hero-title">Jogue com<br /><span>identidade.</span></h1>
          <p className="heroDescription">Chuteiras selecionadas por R$ 390,00, com numeração do 36 ao 43.</p>
          <a className="heroCta" href="#colecao">Explorar coleção <span aria-hidden="true">↘</span></a>
        </div>
        <div className="heroLogoPresentation">
          <img src="/images/logo.jpeg" alt="LK Outlet" />
          <span>FUTSAL · SOCIETY</span>
        </div>
        <div className="heroIndex" aria-hidden="true">01 <span>/</span> 04</div>
      </section>

      <section className="benefitStrip" aria-label="Benefícios da loja">
        <p><span>01</span> Curadoria independente</p>
        <p><span>02</span> Novos achados sempre</p>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('lk:open-cart'))}>
          Sacola <span>{cartCount}</span> <span aria-hidden="true">↗</span>
        </button>
      </section>

      <section className="collection container" id="colecao">
        <div className="collectionHeading">
          <div>
            <p className="sectionEyebrow">COLEÇÃO LK OUTLET</p>
            <h2>Chuteiras em destaque<span>.</span></h2>
          </div>
          <p className="collectionNote">R$ 390,00 · Tamanhos 36 a 43</p>
        </div>

        <div className="collectionToolbar">
          <div className="categoryTabs" aria-label="Filtrar por modalidade">
            {['Todas', ...MODALIDADES].map((item) => (
              <button
                key={item}
                type="button"
                className={modality === item ? 'categoryTab active' : 'categoryTab'}
                aria-pressed={modality === item}
                onClick={() => setModality(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="collectionFilters">
            <label className="searchControl">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar peças"
                aria-label="Buscar produtos"
              />
            </label>
            <label className="priceControl">
              <span>R$</span>
              <input type="number" min="0" value={min} onChange={(event) => setMin(event.target.value)} placeholder="De" aria-label="Preço mínimo" />
              <span className="priceDivider">—</span>
              <input type="number" min="0" value={max} onChange={(event) => setMax(event.target.value)} placeholder="Até" aria-label="Preço máximo" />
            </label>
            <label className="sortControl">
              <span className="visuallyHidden">Ordenar produtos</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar produtos">
                <option value="destaques">Em destaque</option>
                <option value="menor_preco">Menor preço</option>
                <option value="maior_preco">Maior preço</option>
              </select>
            </label>
          </div>
        </div>

        {catalogError && <div className="catalogNotice" role="alert">{catalogError}</div>}
        {productsLoading && <div className="catalogNotice" role="status">Sincronizando a coleção...</div>}

        <div className="resultsLine">
          <span>{filtered.length} {filtered.length === 1 ? 'peça encontrada' : 'peças encontradas'}</span>
          <span>R$ 390,00 · NUMERAÇÃO 36–43</span>
        </div>

        {filtered.length > 0 ? (
          <div className="pGrid">
              {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                produto={product}
                wished={list.some((item) => item.id === product.id)}
                onToggleWishlist={toggle}
                  style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="emptyResults">
            <span aria-hidden="true">⌕</span>
            <h3>Nenhuma peça por aqui</h3>
            <p>Tente outra busca ou limpe os filtros para ver a coleção.</p>
            <button type="button" onClick={() => { setSearch(''); setModality('Todas'); setMin(''); setMax(''); }}>
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      <style>{`
        .storefront{--ink:#171714;--paper:#f4f0e7;--lime:#d8ef62;color:var(--paper)}
        .announcement{height:32px;display:flex;align-items:center;justify-content:center;background:var(--lime);color:#171714;font-size:10px;font-weight:800;letter-spacing:0.12em}
        .storeHero{position:relative;min-height:clamp(480px,66vh,720px);overflow:hidden;background:#262722;display:flex;align-items:center}
        .storeHeroImage,.storeHeroShade{position:absolute;inset:0;width:100%;height:100%}
        .storeHeroImage{object-fit:contain;object-position:center;animation:heroReveal 1s ease-out both}
        .storeHeroShade{background:linear-gradient(90deg,rgba(14,16,13,.78) 0%,rgba(14,16,13,.52) 43%,rgba(14,16,13,.08) 100%),linear-gradient(0deg,rgba(14,16,13,.38),transparent 36%)}
        .storeHeroContent{position:relative;z-index:1;width:min(1200px,100%);margin:0 auto;padding:76px 28px 88px;animation:contentRise .7s .12s both}
        .heroEyebrow,.sectionEyebrow{font-size:10px;font-weight:800;letter-spacing:0.18em;color:var(--lime)}
        .storeHero h1{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:clamp(58px,8vw,112px);line-height:.84;margin:22px 0 18px;max-width:700px}
        .storeHero h1 span{font-style:italic;color:var(--lime)}
        .heroDescription{font-size:15px;line-height:1.65;max-width:385px;color:rgba(255,255,255,.82);margin:0 0 28px}
        .heroCta{display:inline-flex;align-items:center;gap:38px;padding:14px 18px;background:var(--lime);color:#171714;font-size:12px;font-weight:800;transition:background .2s,transform .2s}
        .heroCta:hover{background:#e8ff86;transform:translateY(-2px)}
        .heroLogoPresentation{position:absolute;z-index:1;right:max(64px,calc((100vw - 1120px)/2));top:50%;transform:translateY(-50%);width:224px;padding:10px;text-align:center;border:1px solid rgba(216,239,98,.42);border-radius:6px;background:rgba(12,13,11,.86);box-shadow:0 16px 42px rgba(0,0,0,.38);backdrop-filter:blur(8px);animation:contentRise .7s .24s both}.heroLogoPresentation img{width:100%;display:block;aspect-ratio:1;object-fit:contain;border-radius:3px;background:#050505;transition:filter .3s ease}.heroLogoPresentation:hover img{filter:brightness(1.08)}.heroLogoPresentation span{display:flex;align-items:center;justify-content:center;gap:9px;margin:10px 0 2px;font-size:9px;line-height:1.4;letter-spacing:.12em;font-weight:900;color:var(--lime)}.heroLogoPresentation span::before,.heroLogoPresentation span::after{content:"";width:16px;height:1px;background:currentColor}
        .heroIndex{position:absolute;right:max(28px,calc((100vw - 1200px)/2));bottom:28px;z-index:1;font:600 11px 'DM Sans',sans-serif;letter-spacing:.1em}.heroIndex span{color:var(--lime);padding:0 8px}
        .benefitStrip{min-height:62px;padding:12px max(28px,calc((100vw - 1200px)/2));display:flex;align-items:center;gap:34px;border-bottom:1px solid rgba(255,255,255,.11);background:#20211d}
        .benefitStrip p,.benefitStrip button{margin:0;font-size:10px;font-weight:700;letter-spacing:.07em;color:rgba(255,255,255,.76)}
        .benefitStrip p span{color:var(--lime);margin-right:10px}.benefitStrip button{margin-left:auto;border:0;background:none;color:white;display:flex;align-items:center;gap:9px;cursor:pointer}.benefitStrip button span:first-child{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:var(--lime);color:#171714}
        .collection{padding-top:76px;padding-bottom:96px}
        .collectionHeading{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:32px}
        .sectionEyebrow{color:#b7d342;margin:0 0 10px}.collectionHeading h2{margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(34px,5vw,56px);font-weight:500;line-height:1.02}.collectionHeading h2 span{color:var(--lime)}
        .collectionNote{color:rgba(233,234,242,.58);font-size:12px;margin:0 0 4px}
        .collectionToolbar{border-top:1px solid rgba(255,255,255,.15);border-bottom:1px solid rgba(255,255,255,.15);padding:14px 0;display:flex;align-items:center;justify-content:space-between;gap:18px}
        .categoryTabs{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none}.categoryTabs::-webkit-scrollbar{display:none}
        .categoryTab{flex:none;border:1px solid transparent;background:transparent;color:rgba(255,255,255,.62);padding:9px 11px;font-size:11px;cursor:pointer;transition:color .2s,border-color .2s}.categoryTab:hover,.categoryTab.active{color:var(--lime);border-color:rgba(216,239,98,.38)}
        .collectionFilters{display:flex;gap:8px;align-items:center}
        .searchControl,.priceControl,.sortControl select{height:38px;display:flex;align-items:center;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.035);color:white}
        .searchControl{padding:0 10px;gap:6px}.searchControl>span{font-size:20px;color:var(--lime)}.searchControl input,.priceControl input{width:92px;min-width:0;border:0;outline:0;color:white;background:transparent;font-size:11px}.searchControl input::placeholder,.priceControl input::placeholder{color:rgba(255,255,255,.48)}.searchControl input::-webkit-search-cancel-button{-webkit-appearance:none}
        .priceControl{padding:0 8px;gap:6px;color:var(--lime);font-size:10px}.priceControl input{width:48px}.priceDivider{color:rgba(255,255,255,.4)}
        .sortControl select{padding:0 28px 0 10px;font-size:10px;outline:none}.sortControl option{background:#20211d}
        .resultsLine{display:flex;justify-content:space-between;padding:18px 0 14px;color:rgba(255,255,255,.58);font-size:10px}.resultsLine span:last-child{letter-spacing:.1em}
        .catalogNotice{margin-top:14px;padding:12px 14px;border:1px solid rgba(128,91,28,.28);background:rgba(255,244,207,.75);color:#60471f;font-size:13px;line-height:1.5}
        .pGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
        .emptyResults{text-align:center;padding:70px 20px 84px;border-bottom:1px solid rgba(255,255,255,.12)}.emptyResults>span{font-size:36px;color:var(--lime)}.emptyResults h3{font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;font-weight:500;margin:8px 0}.emptyResults p{font-size:13px;color:rgba(255,255,255,.6)}.emptyResults button{margin-top:12px;padding:11px 16px;border:1px solid var(--lime);background:transparent;color:var(--lime);cursor:pointer}
        .visuallyHidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        @keyframes heroReveal{from{opacity:.65}to{opacity:1}}@keyframes contentRise{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
          @media(prefers-reduced-motion:no-preference){.pGrid .pCard{animation:productCardIn .55s cubic-bezier(.2,.7,.25,1) both}@keyframes productCardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}}
        @media(max-width:900px){.collectionToolbar{align-items:flex-start;flex-direction:column}.collectionFilters{width:100%;flex-wrap:wrap}.searchControl{flex:1}.searchControl input{width:100%}.pGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.collection{padding-top:58px}}
        @media(max-width:600px){.storeHero{min-height:540px;align-items:flex-end}.storeHeroImage{object-position:center}.storeHeroShade{background:linear-gradient(0deg,rgba(14,16,13,.84),rgba(14,16,13,.08) 85%)}.storeHeroContent{padding:76px 20px 68px}.storeHero h1{font-size:66px}.heroDescription{max-width:310px}.heroLogoPresentation{width:116px;padding:6px;right:14px;top:14%;transform:none}.heroLogoPresentation span{font-size:7px;letter-spacing:.08em;gap:4px;margin:6px 0 1px}.heroLogoPresentation span::before,.heroLogoPresentation span::after{width:8px}.heroIndex{right:20px;bottom:22px}.benefitStrip{padding:12px 20px;gap:14px;flex-wrap:wrap}.benefitStrip p{font-size:9px}.benefitStrip p:nth-child(2){display:none}.collection{padding:48px 16px 68px}.collectionHeading{align-items:flex-start;flex-direction:column;margin-bottom:22px}.collectionNote{margin:0}.categoryTabs{width:100%}.collectionFilters{display:grid;grid-template-columns:1fr auto;width:100%}.searchControl{grid-column:1/-1}.priceControl{justify-content:center}.sortControl select{height:38px}.pGrid{gap:10px}.resultsLine{font-size:9px}.resultsLine span:last-child{font-size:8px}.pGrid .pCard{border-radius:4px}.pGrid .pCardBody{padding:11px 10px 12px}.pGrid .pCardTitle{white-space:normal;font-size:13px}.pGrid .pCardDesc{font-size:11px}.pGrid .pPrice{font-size:15px}.pGrid .pOldPrice{font-size:11px}.pGrid .pAdd{padding:9px 7px;font-size:10px}}
        @media(prefers-reduced-motion:reduce){.heroLogoPresentation,.heroLogoPresentation img{animation:none;transition:none}}
        @media(prefers-reduced-motion:reduce){.storeHeroImage,.storeHeroContent{animation:none}.heroCta{transition:none}}
      `}</style>

      <div className="notify" aria-hidden>
        +1 no carrinho
        <style>{`
          .notify{position:fixed;left:50%;top:88px;transform:translateX(-50%);padding:10px 14px;border-radius:999px;background:rgba(216,239,98,.14);border:1px solid rgba(216,239,98,.45);color:#e8ff86;font-weight:900;opacity:0;pointer-events:none;transition:opacity .25s ease, transform .25s ease;z-index:60}
          .notify.show{opacity:1;transform:translateX(-50%) translateY(-2px)}
        `}</style>
      </div>

      <ScriptNotify />
    </div>
  );
}

function ScriptNotify() {
  React.useEffect(() => {
    const handler = () => {
      const el = document.querySelector('.notify');
      if (!el) return;
      el.classList.add('show');
      clearTimeout(el.__t);
      el.__t = setTimeout(() => el.classList.remove('show'), 900);
    };
    window.addEventListener('lk:notify', handler);
    return () => window.removeEventListener('lk:notify', handler);
  }, []);
  return null;
}
