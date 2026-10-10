import React, { useMemo, useState } from 'react';
import { useCart } from '../../state/cart.js';
import { useProducts } from '../../state/products.jsx';
import { formatBRLFromCents } from '../../utils/money.js';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const navigate = useNavigate();
  const { items, remove, setQtd, setTamanho, clear } = useCart();
  const { products } = useProducts();

  const [cliente, setCliente] = useState({ nome: '', telefone: '', rua: '', numero: '', bairro: '', cidade: '', cep: '' });
  const [pagamento, setPagamento] = useState('Pix');
  const [cupom, setCupom] = useState('');

  const whatsappNumber = '559192587994';
  const [cupomStatus, setCupomStatus] = useState(null);

  const enriched = useMemo(() => {
    return items
      .map((it) => {
        const p = products.find((product) => product.id === it.id);
        if (!p) return null;
        return {
          ...p,
          qtd: it.qtd,
          tamanho: it.tamanho || String(p.tamanho || '').split(',')[0] || '38',
          cartKey: it.cartKey || `${it.id}:${it.tamanho || ''}`
        };
      })
      .filter(Boolean);
  }, [items, products]);

  const subtotal = useMemo(() => enriched.reduce((a, x) => a + x.preco * x.qtd, 0), [enriched]);

  // Cupom demo: "LK10" => 10%
  const desconto = useMemo(() => {
    const code = String(cupom || '').trim().toUpperCase();
    if (code === 'LK10') return Math.round(subtotal * 0.1);
    return 0;
  }, [cupom, subtotal]);

  const total = Math.max(0, subtotal - desconto);

  if (!enriched.length) {
    return (
      <div className="container" style={{ padding: '22px 0' }}>
        <div className="emptyBox">Seu carrinho está vazio.</div>
        <button className="tBtn" onClick={() => navigate('/')}>Voltar para a loja</button>
        <style>{`
          .emptyBox{margin-top:18px;padding:18px;border-radius:18px;border:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.12);color:rgba(233,234,242,.75);font-weight:800}
          .tBtn{margin-top:12px;background:rgba(255,215,0,.16);border:1px solid rgba(255,215,0,.42);color:var(--gold);padding:12px;border-radius:16px;font-weight:1000;cursor:pointer;width:100%;max-width:340px}
        `}</style>
      </div>
    );
  }

  const buildWhatsAppMessage = () => {
    const itensTxt = enriched
      .map((x) => `• ${x.nome}\n  Tamanho: ${x.tamanho} | Quantidade: ${x.qtd}\n  Unitário: ${formatBRLFromCents(x.preco)} | Subtotal: ${formatBRLFromCents(x.preco * x.qtd)}\n  Foto: ${new URL(x.imagem, window.location.origin).href}`)
      .join('\n');

    return `Olá! Quero fazer este pedido na LK OUTLET.\n\nCLIENTE\nNome: ${cliente.nome.trim()}\nTelefone: ${cliente.telefone.trim()}\n\nENDEREÇO DE ENTREGA\nRua: ${cliente.rua.trim()}, ${cliente.numero.trim()}\nBairro: ${cliente.bairro.trim()}\nCidade: ${cliente.cidade.trim()}\nCEP: ${cliente.cep.trim() || 'Não informado'}\n\nPAGAMENTO\nForma: ${pagamento}\n\nPRODUTOS\n${itensTxt}\n\nSubtotal: ${formatBRLFromCents(subtotal)}\nDesconto: ${formatBRLFromCents(desconto)}\nTotal do pedido: ${formatBRLFromCents(total)}\nCupom: ${cupom ? cupom.toUpperCase() : '—'}`;
  };

  const submitOrder = (event) => {
    event.preventDefault();
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container cartPage">
      <section className="cartWrap">
        <div className="cartHeader">
          <h1 className="cartTitle">Carrinho</h1>
          <button className="cartClear" onClick={clear}>Limpar</button>
        </div>

        <div className="cartGrid">
          <div className="cartLeft">
            <div className="lineList">
              {enriched.map((x) => (
                <div key={x.cartKey} className="lineItem">
                  <img src={x.imagem} alt={x.nome} />
                  <div className="lineInfo">
                    <div className="lineName">{x.nome}</div>
                    <div className="linePrice">{formatBRLFromCents(x.preco)} cada</div>
                    <div className="lineQty">
                      <button onClick={() => setQtd(x.cartKey, Math.max(1, x.qtd - 1))}>-</button>
                      <span>{x.qtd}</span>
                      <button onClick={() => setQtd(x.cartKey, x.qtd + 1)}>+</button>
                    </div>
                    <label className="lineSize">Numeração
                      <select value={x.tamanho} onChange={(event) => setTamanho(x.cartKey, event.target.value)}>
                        {[38, 39, 40, 41, 42, 43].map((size) => <option key={size} value={String(size)}>{size}</option>)}
                      </select>
                    </label>
                  </div>
                  <button className="lineRemove" aria-label={`Remover ${x.nome}`} onClick={() => remove(x.cartKey)}>×</button>
                </div>
              ))}
            </div>

            <div className="couponBox">
              <label>Cupom de desconto</label>
              <div className="couponRow">
                <input value={cupom} onChange={(e) => setCupom(e.target.value)} placeholder="Ex: LK10" />
                <button
                  onClick={() => {
                    const code = String(cupom || '').trim().toUpperCase();
                    if (!code) return setCupomStatus(null);
                    if (code === 'LK10') setCupomStatus('Cupom aplicado: 10% OFF');
                    else setCupomStatus('Cupom inválido');
                  }}
                >
                  Aplicar
                </button>
              </div>
              {cupomStatus ? <div className={`couponStatus ${cupomStatus.includes('inválido') ? 'danger' : 'ok'}`}>{cupomStatus}</div> : null}
            </div>
          </div>

          <div className="cartRight">
            <form className="formCard" onSubmit={submitOrder}>
              <div className="formTitle">Dados do cliente</div>
              <div className="fields">
                <label>
                  Nome completo
                  <input autoComplete="name" required value={cliente.nome} onChange={(e) => setCliente((c) => ({ ...c, nome: e.target.value }))} placeholder="Nome de quem vai receber" />
                </label>
                <label>
                  Telefone
                  <input autoComplete="tel" type="tel" required value={cliente.telefone} onChange={(e) => setCliente((c) => ({ ...c, telefone: e.target.value }))} placeholder="DDD + telefone" />
                </label>
                <label>
                  Rua / avenida
                  <input autoComplete="address-line1" required value={cliente.rua} onChange={(e) => setCliente((c) => ({ ...c, rua: e.target.value }))} placeholder="Nome da rua" />
                </label>
                <label>
                  Número
                  <input required value={cliente.numero} onChange={(e) => setCliente((c) => ({ ...c, numero: e.target.value }))} placeholder="Número ou S/N" />
                </label>
                <label>
                  Bairro
                  <input autoComplete="address-level3" required value={cliente.bairro} onChange={(e) => setCliente((c) => ({ ...c, bairro: e.target.value }))} placeholder="Bairro" />
                </label>
                <label>
                  Cidade
                  <input autoComplete="address-level2" required value={cliente.cidade} onChange={(e) => setCliente((c) => ({ ...c, cidade: e.target.value }))} placeholder="Cidade" />
                </label>
                <label>
                  CEP <span>(opcional)</span>
                  <input autoComplete="postal-code" inputMode="numeric" value={cliente.cep} onChange={(e) => setCliente((c) => ({ ...c, cep: e.target.value }))} placeholder="00000-000" />
                </label>
              </div>

              <div className="payBox">
                <div className="payTitle">Pagamento</div>
                <select required value={pagamento} onChange={(e) => setPagamento(e.target.value)}>
                  <option value="Pix">Pix</option>
                  <option value="Dinheiro na entrega">Dinheiro na entrega</option>
                  <option value="Cartão de crédito na entrega">Cartão de crédito na entrega</option>
                  <option value="Cartão de débito na entrega">Cartão de débito na entrega</option>
                </select>
              </div>

              <div className="summary">
                <div className="sumRow"><span>Subtotal</span><b>{formatBRLFromCents(subtotal)}</b></div>
                <div className="sumRow"><span>Desconto</span><b className={desconto ? 'gold' : ''}>{formatBRLFromCents(desconto)}</b></div>
                <div className="sumRow total"><span>Total</span><b>{formatBRLFromCents(total)}</b></div>
              </div>

              <button
                className="waBtn"
                type="submit"
              >
                Finalizar pedido via WhatsApp
              </button>

              <div className="saveHint">O WhatsApp abrirá com os dados do pedido e os links das fotos dos produtos.</div>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        .cartPage{padding:22px 0}
        .cartWrap{border:1px solid rgba(255,255,255,.06);border-radius:22px;background:rgba(0,0,0,.12);padding:18px}
        .cartHeader{display:flex;align-items:center;justify-content:space-between;gap:14px}
        .cartTitle{font-family:'Plus Jakarta Sans';font-weight:1000;font-size:34px;margin:0}
        .cartClear{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:rgba(233,234,242,.9);padding:10px 12px;border-radius:14px;font-weight:900;cursor:pointer}

        .cartGrid{display:grid;grid-template-columns:1.4fr .9fr;gap:16px;margin-top:14px}
        @media(max-width:980px){.cartGrid{grid-template-columns:1fr}}

        .lineList{display:flex;flex-direction:column;gap:12px}
        .lineItem{display:grid;grid-template-columns:92px 1fr 40px;gap:12px;align-items:center;padding:12px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
        .lineItem img{width:92px;height:70px;object-fit:cover;border-radius:14px;border:1px solid rgba(255,255,255,.06)}
        .lineName{font-weight:1000;font-family:'Plus Jakarta Sans';font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .linePrice{color:rgba(233,234,242,.7);font-weight:800;font-size:13px;margin-top:6px}
        .lineQty{display:flex;align-items:center;gap:10px;margin-top:10px}
        .lineQty button{width:34px;height:34px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:rgba(233,234,242,.9);cursor:pointer;font-weight:1000}
        .lineQty span{min-width:26px;text-align:center;font-weight:1000}
        .lineSize{display:flex;align-items:center;gap:9px;margin-top:9px;color:rgba(233,234,242,.66);font-size:11px}.lineSize select{background:#20211d;border:1px solid rgba(255,255,255,.14);color:white;padding:5px 8px;border-radius:6px}
        .lineRemove{width:36px;height:36px;border-radius:14px;background:rgba(255,77,77,.12);border:1px solid rgba(255,77,77,.35);color:rgba(255,77,77,.95);cursor:pointer;font-weight:1000}

        .couponBox{margin-top:12px;padding:12px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
        .couponBox label{display:block;color:rgba(233,234,242,.7);font-weight:800;font-size:12px;margin-bottom:8px}
        .couponRow{display:flex;gap:10px}
        .couponRow input{flex:1;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:var(--text);padding:11px 12px;border-radius:14px;outline:none}
        .couponRow button{background:rgba(255,215,0,.16);border:1px solid rgba(255,215,0,.42);color:var(--gold);padding:11px 12px;border-radius:14px;font-weight:1000;cursor:pointer}
        .couponStatus{margin-top:10px;font-weight:1000}
        .couponStatus.ok{color:rgba(49,208,127,.95)}
        .couponStatus.danger{color:rgba(255,77,77,.95)}

        .formCard{padding:12px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
        .formTitle{font-weight:1000;font-family:'Plus Jakarta Sans';font-size:18px;margin-bottom:10px}
        .fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .fields label{display:flex;flex-direction:column;gap:8px;color:rgba(233,234,242,.7);font-weight:800;font-size:12px}
        .fields label span{font-weight:500;color:rgba(233,234,242,.48)}
        .fields input{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:var(--text);padding:11px 12px;border-radius:14px;outline:none}

        .payBox{margin-top:12px}
        .payTitle{color:rgba(233,234,242,.7);font-weight:800;font-size:12px;margin-bottom:8px}
        .payBox select{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:var(--text);padding:11px 12px;border-radius:14px;outline:none}

        .summary{margin-top:14px;border-top:1px solid rgba(255,255,255,.06);padding-top:12px}
        .sumRow{display:flex;align-items:center;justify-content:space-between;color:rgba(233,234,242,.8);font-weight:800;margin-top:8px}
        .sumRow b{color:rgba(255,255,255,.92)}
        .sumRow.gold b{color:var(--gold)}
        .sumRow.total{margin-top:12px;font-size:16px}

        .waBtn{margin-top:14px;width:100%;background:rgba(255,215,0,.18);border:1px solid rgba(255,215,0,.45);color:var(--gold);padding:14px 12px;border-radius:18px;font-weight:1000;cursor:pointer}
        .saveHint{margin-top:10px;color:rgba(233,234,242,.65);font-weight:700;font-size:12px}
        @media(max-width:560px){.fields{grid-template-columns:1fr}.lineItem{grid-template-columns:72px 1fr 32px;gap:8px;padding:8px}.lineItem img{width:72px;height:68px}.lineName{font-size:13px}}
      `}</style>
    </div>
  );
}
