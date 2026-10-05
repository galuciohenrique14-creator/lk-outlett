import React, { useEffect, useMemo, useState } from 'react';
import { produtosSeed, CATEGORIAS, MODALIDADES, PRODUCTS_STORAGE_KEY } from '../../data/products.js';

const KEY_SETTINGS = 'lkoutlet_settings_v1';
const KEY_ORDERS = 'lkoutlet_orders_v1';
const KEY_CUPONS = 'lkoutlet_cupons_v1';
const KEY_REVIEWS = 'lkoutlet_reviews_v1';
const STORE_WHATSAPP = '559192587994';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function requireAdmin() {
  return sessionStorage.getItem('lkoutlet_admin_ok') === '1';
}

function formatBRL(cents) {
  return (Number(cents) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);

  const [settings, setSettings] = useState(() =>
    ({
      ...readJSON(KEY_SETTINGS, {
      nomeLoja: 'LK OUTLET',
      whatsappNumber: STORE_WHATSAPP
      }),
      whatsappNumber: STORE_WHATSAPP,
      adminUser: 'rick',
      adminPass: 'rick071007'
    })
  );

  const [products, setProducts] = useState(() => readJSON(PRODUCTS_STORAGE_KEY, produtosSeed));
  const [orders, setOrders] = useState(() => readJSON(KEY_ORDERS, []));
  const [cupons, setCupons] = useState(() =>
    readJSON(KEY_CUPONS, [
      { codigo: 'LK10', desconto_percent: 10, ativo: true, usos_maximos: 50, usos_atual: 0 }
    ])
  );
  const [reviews, setReviews] = useState(() => readJSON(KEY_REVIEWS, []));

  const [tab, setTab] = useState('painel');

  // modals state (admin)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productDraft, setProductDraft] = useState(null);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    setAuthed(requireAdmin());
  }, []);

  useEffect(() => {
    writeJSON(KEY_SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    writeJSON(PRODUCTS_STORAGE_KEY, products);
  }, [products]);

  useEffect(() => {
    writeJSON(KEY_ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    writeJSON(KEY_CUPONS, cupons);
  }, [cupons]);

  useEffect(() => {
    writeJSON(KEY_REVIEWS, reviews);
  }, [reviews]);

  const salesByCategory = useMemo(() => {
    const map = {};
    for (const o of orders) {
      for (const it of o.itens || []) {
        map[it.categoria] = (map[it.categoria] || 0) + (Number(it.preco) || 0) * (Number(it.qtd) || 0);
      }
    }
    return Object.entries(map).map(([k, v]) => ({ categoria: k, total: v }));
  }, [orders]);

  if (!authed) {
    return (
      <div className="container" style={{ padding: '22px 0' }}>
        <div className="unauthBox">Acesso negado. Faça login novamente.</div>
        <style>{`.unauthBox{border:1px solid rgba(255,255,255,.06);border-radius:22px;background:rgba(0,0,0,.12);padding:18px;font-weight:900}`}</style>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '22px 0' }}>
      <div className="adminShell">
        <div className="adminTop">
          <div>
            <div className="adminBrand">LK OUTLET — Admin</div>
            <div className="adminMuted">Gerencie produtos, pedidos, cupons e avaliações.</div>
          </div>
          <div className="adminActions">
            <button className="btn" onClick={() => setSettingsModalOpen(true)}>Configurações</button>
            <button
              className="btn secondary"
              onClick={() => {
                sessionStorage.removeItem('lkoutlet_admin_ok');
                alert('Sessão encerrada.');
              }}
            >
              Sair
            </button>
          </div>
        </div>

        <div className="tabs">
          {[
            ['painel', 'Painel'],
            ['produtos', 'Produtos'],
            ['pedidos', 'Pedidos'],
            ['cupons', 'Cupons'],
            ['avaliacoes', 'Avaliações']
          ].map(([k, label]) => (
            <button
              key={k}
              className={`tabBtn ${tab === k ? 'active' : ''}`}
              onClick={() => setTab(k)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'painel' && (
          <div className="panel">
            <div className="panelCard">
              <div className="panelTitle">Gráfico de vendas por categoria (demo)</div>
              <div className="bars">
                {salesByCategory.length ? (
                  salesByCategory.map((x) => {
                    const max = Math.max(...salesByCategory.map((y) => y.total));
                    const w = max ? (x.total / max) * 100 : 0;
                    return (
                      <div key={x.categoria} className="barRow">
                        <div className="barLabel">{x.categoria}</div>
                        <div className="barTrack">
                          <div className="barFill" style={{ width: `${w}%` }} />
                        </div>
                        <div className="barVal">{formatBRL(x.total)}</div>
                      </div>
                    );
                  })
                ) : (
                  <div className="muted">Sem pedidos salvos ainda.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'produtos' && (
          <div className="panel">
            <div className="panelCard">
              <div className="panelHead">
                <div>
                  <div className="panelTitle">Tabela de produtos</div>
                  <div className="panelMuted">Itens armazenados localmente no navegador.</div>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductDraft({
                      id: `p_${Math.random().toString(16).slice(2)}`,
                      nome: '',
                      descricao: '',
                      preco: 0,
                      precoAntigo: 0,
                      imagem: '',
                      categoria: CATEGORIAS[0],
                      modalidade: '',
                      tamanho: 'P,M,G,GG',
                      estoque: 0,
                      ativo: true,
                      destaque: false,
                      tags: []
                    });
                    setProductModalOpen(true);
                  }}
                >
                  + Novo produto
                </button>
              </div>

              <div className="table">
                <div className="thead">
                  <div>Nome</div>
                  <div>Categoria</div>
                  <div>Modalidade</div>
                  <div>Preço</div>
                  <div>Estoque</div>
                  <div>Status</div>
                  <div></div>
                </div>
                <div className="tbody">
                  {products.map((p) => (
                    <div className="tr" key={p.id}>
                      <div className="cell strong">{p.nome}</div>
                      <div className="cell">{p.categoria}</div>
                      <div className="cell">{p.modalidade || 'Definir'}</div>
                      <div className="cell">{formatBRL(p.preco)}</div>
                      <div className="cell">{p.estoque}</div>
                      <div className="cell">
                        <span className={`pill ${p.ativo ? 'ok' : 'off'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                      </div>
                      <div className="cell actions">
                        <button
                          className="mini"
                          onClick={() => {
                            setEditingProduct(p);
                            setProductDraft({ ...p });
                            setProductModalOpen(true);
                          }}
                        >Editar</button>
                        <button
                          className="mini danger"
                          onClick={() => {
                            if (!confirm('Remover produto?')) return;
                            setProducts((prev) => prev.filter((x) => x.id !== p.id));
                          }}
                        >Remover</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'pedidos' && (
          <div className="panel">
            <div className="panelCard">
              <div className="panelTitle">Tabela de pedidos</div>
              <div className="muted" style={{ marginTop: 8 }}>
                Para fins de demo, pedidos não são criados automaticamente.
              </div>
              <div style={{ marginTop: 14 }}>
                {orders.length ? (
                  <pre style={{ whiteSpace: 'pre-wrap', color: 'rgba(233,234,242,.8)', background: 'rgba(255,255,255,.03)', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,.06)' }}>
{JSON.stringify(orders, null, 2)}
                  </pre>
                ) : (
                  <div className="muted">Nenhum pedido salvo.</div>
                )}
              </div>

              <div className="muted" style={{ marginTop: 14 }}>
                Status/atualização podem ser ligados ao backend posteriormente.
              </div>
            </div>
          </div>
        )}

        {tab === 'cupons' && (
          <div className="panel">
            <div className="panelCard">
              <div className="panelHead">
                <div>
                  <div className="panelTitle">Gerenciamento de cupons</div>
                  <div className="panelMuted">Crie códigos e controle usos (demo).</div>
                </div>
              </div>

              <div className="table">
                <div className="thead">
                  <div>Código</div>
                  <div>Desconto</div>
                  <div>Ativo</div>
                  <div>Usos</div>
                  <div></div>
                </div>
                <div className="tbody">
                  {cupons.map((c) => (
                    <div className="tr" key={c.codigo}>
                      <div className="cell strong">{c.codigo}</div>
                      <div className="cell">{c.desconto_percent}%</div>
                      <div className="cell">
                        <span className={`pill ${c.ativo ? 'ok' : 'off'}`}>{c.ativo ? 'Ativo' : 'Inativo'}</span>
                      </div>
                      <div className="cell">{c.usos_atual}/{c.usos_maximos}</div>
                      <div className="cell actions">
                        <button
                          className="mini"
                          onClick={() => {
                            setCupons((prev) =>
                              prev.map((x) =>
                                x.codigo === c.codigo ? { ...x, ativo: !x.ativo } : x
                              )
                            );
                          }}
                        >Toggle</button>
                        <button
                          className="mini danger"
                          onClick={() => {
                            if (!confirm('Remover cupom?')) return;
                            setCupons((prev) => prev.filter((x) => x.codigo !== c.codigo));
                          }}
                        >Remover</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }} className="newCup">
                <button
                  className="btn"
                  onClick={() => {
                    const codigo = prompt('Código do cupom (ex: LK15)').trim().toUpperCase();
                    if (!codigo) return;
                    const desconto_percent = Number(prompt('Desconto (%)', '10')) || 0;
                    const usos_maximos = Number(prompt('Usos máximos', '50')) || 0;
                    setCupons((prev) => [...prev, { codigo, desconto_percent, ativo: true, usos_maximos, usos_atual: 0 }]);
                  }}
                >
                  + Criar cupom
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'avaliacoes' && (
          <div className="panel">
            <div className="panelCard">
              <div className="panelTitle">Moderação de avaliações</div>
              <div className="muted" style={{ marginTop: 8 }}>Aprovar/rejeitar avaliações (demo).</div>
              <div style={{ marginTop: 14 }}>
                {reviews.length ? (
                  <pre style={{ whiteSpace: 'pre-wrap', color: 'rgba(233,234,242,.8)', background: 'rgba(255,255,255,.03)', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,.06)' }}>
{JSON.stringify(reviews, null, 2)}
                  </pre>
                ) : (
                  <div className="muted">Nenhuma avaliação cadastrada.</div>
                )}
              </div>

              <div className="muted" style={{ marginTop: 14 }}>
                Para demo, avaliações não são coletadas ainda.
              </div>
            </div>
          </div>
        )}

        {productModalOpen && (
          <div className="modalOverlay" onMouseDown={() => setProductModalOpen(false)}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modalHead">
                <div>
                  <div className="modalTitle">{editingProduct ? 'Editar produto' : 'Novo produto'}</div>
                  <div className="modalMuted">Carregar imagem por URL.</div>
                </div>
                <button className="mini" onClick={() => setProductModalOpen(false)}>Fechar</button>
              </div>

              <div className="formGrid">
                <label>
                  Nome
                  <input value={productDraft?.nome || ''} onChange={(e) => setProductDraft((d) => ({ ...d, nome: e.target.value }))} />
                </label>
                <label>
                  Descrição
                  <textarea value={productDraft?.descricao || ''} onChange={(e) => setProductDraft((d) => ({ ...d, descricao: e.target.value }))} />
                </label>
                <label>
                  Imagem (URL)
                  <input value={productDraft?.imagem || ''} onChange={(e) => setProductDraft((d) => ({ ...d, imagem: e.target.value }))} />
                </label>

                <label>
                  Categoria
                  <select value={productDraft?.categoria || CATEGORIAS[0]} onChange={(e) => setProductDraft((d) => ({ ...d, categoria: e.target.value }))}>
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Modalidade
                  <select value={productDraft?.modalidade || ''} onChange={(e) => setProductDraft((d) => ({ ...d, modalidade: e.target.value }))}>
                    <option value="">Selecione a modalidade</option>
                    {MODALIDADES.map((modalidade) => (
                      <option key={modalidade} value={modalidade}>{modalidade}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Preço (centavos)
                  <input type="number" value={productDraft?.preco ?? 0} onChange={(e) => setProductDraft((d) => ({ ...d, preco: Number(e.target.value) }))} />
                </label>
                <label>
                  Preço antigo (centavos)
                  <input type="number" value={productDraft?.precoAntigo ?? 0} onChange={(e) => setProductDraft((d) => ({ ...d, precoAntigo: Number(e.target.value) }))} />
                </label>

                <label>
                  Tamanho (string)
                  <input value={productDraft?.tamanho || ''} onChange={(e) => setProductDraft((d) => ({ ...d, tamanho: e.target.value }))} />
                </label>
                <label>
                  Estoque
                  <input type="number" value={productDraft?.estoque ?? 0} onChange={(e) => setProductDraft((d) => ({ ...d, estoque: Number(e.target.value) }))} />
                </label>

                <label>
                  Ativo
                  <select value={productDraft?.ativo ? '1' : '0'} onChange={(e) => setProductDraft((d) => ({ ...d, ativo: e.target.value === '1' }))}>
                    <option value="1">Sim</option>
                    <option value="0">Não</option>
                  </select>
                </label>

                <label>
                  Destaque
                  <select value={productDraft?.destaque ? '1' : '0'} onChange={(e) => setProductDraft((d) => ({ ...d, destaque: e.target.value === '1' }))}>
                    <option value="1">Sim</option>
                    <option value="0">Não</option>
                  </select>
                </label>

                <label>
                  Tags (separe por vírgula)
                  <input
                    value={(productDraft?.tags || []).join(',')}
                    onChange={(e) => setProductDraft((d) => ({ ...d, tags: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) }))}
                  />
                </label>
              </div>

              <div className="modalFoot">
                <button
                  className="btn"
                  onClick={() => {
                    const d = productDraft;
                    if (!d?.nome) return alert('Nome é obrigatório');
                    if (!d?.imagem) return alert('Imagem é obrigatória (URL)');
                    if (!MODALIDADES.includes(d.modalidade)) return alert('Selecione Futsal ou Society');
                    setProducts((prev) => {
                      const idx = prev.findIndex((x) => x.id === d.id);
                      if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = { ...d };
                        return next;
                      }
                      return [{ ...d }, ...prev];
                    });
                    setProductModalOpen(false);
                  }}
                >
                  Salvar
                </button>
              </div>

              <style>{`
                .modalOverlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px}
                .modal{width:min(980px, 100%);max-height:85vh;overflow:auto;border-radius:22px;border:1px solid rgba(255,255,255,.08);background:rgba(5,6,10,.95);box-shadow:0 30px 120px rgba(0,0,0,.7)}
                .modalHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 16px 0}
                .modalTitle{font-family:'Plus Jakarta Sans';font-weight:1000;font-size:24px}
                .modalMuted{color:rgba(233,234,242,.7);font-weight:800;margin-top:6px;font-size:12px}
                .formGrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px}
                .formGrid label{display:flex;flex-direction:column;gap:8px;color:rgba(233,234,242,.7);font-weight:900;font-size:12px}
                .formGrid input,.formGrid textarea,.formGrid select{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:var(--text);padding:11px 12px;border-radius:14px;outline:none}
                .formGrid textarea{min-height:90px;resize:vertical}
                .modalFoot{padding:0 16px 16px;display:flex;justify-content:flex-end}

                .adminShell{border:1px solid rgba(255,255,255,.06);border-radius:22px;background:rgba(0,0,0,.12);padding:18px}
                .adminTop{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
                .adminBrand{font-family:'Plus Jakarta Sans';font-weight:1000;font-size:22px}
                .adminMuted{margin-top:8px;color:rgba(233,234,242,.7);font-weight:800}
                .adminActions{display:flex;gap:10px;align-items:center}
                .tabs{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap}
                .tabBtn{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:rgba(233,234,242,.9);padding:10px 12px;border-radius:14px;font-weight:1000;cursor:pointer}
                .tabBtn.active{border-color:rgba(255,215,0,.55);color:var(--gold);background:rgba(255,215,0,.12)}
                .panel{margin-top:14px}
                .panelCard{border:1px solid rgba(255,255,255,.06);border-radius:22px;background:rgba(255,255,255,.02);padding:16px}
                .panelTitle{font-family:'Plus Jakarta Sans';font-weight:1000;font-size:22px}
                .panelMuted{color:rgba(233,234,242,.7);font-weight:800;margin-top:8px;font-size:12px}
                .panelHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
                .muted{color:rgba(233,234,242,.7);font-weight:800}

                .btn{background:rgba(255,215,0,.18);border:1px solid rgba(255,215,0,.45);color:var(--gold);padding:12px 14px;border-radius:18px;font-weight:1000;cursor:pointer}
                .btn.secondary{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:rgba(233,234,242,.92)}
                .table{margin-top:14px;border:1px solid rgba(255,255,255,.06);border-radius:18px;overflow:hidden}
                .thead,.tr{display:grid;grid-template-columns:2fr 1fr 1fr .9fr .7fr .7fr 1fr;gap:10px;align-items:center}
                .thead{background:rgba(255,255,255,.03);padding:12px;font-weight:1000;color:rgba(233,234,242,.75)}
                .tbody .tr{padding:12px;border-top:1px solid rgba(255,255,255,.05)}
                .cell{color:rgba(233,234,242,.85);font-weight:800;font-size:14px}
                .cell.strong{color:rgba(255,255,255,.95)}
                .actions{display:flex;gap:8px;justify-content:flex-end}
                .mini{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:rgba(233,234,242,.9);padding:8px 10px;border-radius:14px;font-weight:1000;cursor:pointer}
                .mini.danger{background:rgba(255,77,77,.12);border-color:rgba(255,77,77,.35);color:rgba(255,77,77,.95)}
                .pill{display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12)}
                .pill.ok{border-color:rgba(49,208,127,.35);color:rgba(49,208,127,.95);background:rgba(49,208,127,.1)}
                .pill.off{border-color:rgba(255,77,77,.35);color:rgba(255,77,77,.95);background:rgba(255,77,77,.1)}

                .bars{display:flex;flex-direction:column;gap:10px;margin-top:12px}
                .barRow{display:grid;grid-template-columns:220px 1fr 160px;gap:12px;align-items:center}
                .barLabel{font-weight:1000;color:rgba(233,234,242,.85)}
                .barTrack{height:14px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.06);overflow:hidden}
                .barFill{height:100%;background:linear-gradient(90deg, rgba(255,215,0,.2), rgba(255,215,0,.8));border-radius:999px}
                .barVal{font-weight:1000;color:rgba(233,234,242,.8);text-align:right}
                @media(max-width:900px){.thead,.tr{grid-template-columns:1.5fr .9fr .9fr .9fr .7fr .7fr;}.thead div:last-child,.tr .cell.actions{grid-column:1/-1}.barRow{grid-template-columns:1fr;gap:8px}}
              `}</style>
            </div>
          </div>
        )}

        {settingsModalOpen && (
          <div className="modalOverlay" onMouseDown={() => setSettingsModalOpen(false)}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modalHead">
                <div>
                  <div className="modalTitle">Configurações</div>
                  <div className="modalMuted">Nome da loja e número WhatsApp.</div>
                </div>
                <button className="mini" onClick={() => setSettingsModalOpen(false)}>Fechar</button>
              </div>

              <div className="formGrid">
                <label>
                  Nome da loja
                  <input value={settings.nomeLoja} onChange={(e) => setSettings((s) => ({ ...s, nomeLoja: e.target.value }))} />
                </label>
                <label>
                  WhatsApp (número)
                  <input value={settings.whatsappNumber} onChange={(e) => setSettings((s) => ({ ...s, whatsappNumber: e.target.value }))} />
                </label>
              </div>

              <div className="modalFoot">
                <button className="btn" onClick={() => setSettingsModalOpen(false)}>Salvar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

