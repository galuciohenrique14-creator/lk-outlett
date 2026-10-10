import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIAS, MODALIDADES } from '../../data/products.js';
import { hasAdminSession, signOutAdmin } from '../../data/supabase.js';
import { useProducts } from '../../state/products.jsx';
import './admin.css';

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

function formatBRL(cents) {
  return (Number(cents) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getBasePrice(product) {
  return product.precoAntigo > product.preco ? product.precoAntigo : product.preco;
}

function getDiscountPercent(product) {
  if (product.descontoPercentual > 0) return product.descontoPercentual;
  if (product.precoAntigo > product.preco) {
    return Math.round(((product.precoAntigo - product.preco) / product.precoAntigo) * 100);
  }
  return 10;
}

async function optimizeImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Não foi possível preparar a imagem neste dispositivo.');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.78);
}

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const { products, loading: productsLoading, error: catalogError, remote, upsert, remove } = useProducts();
  const [productError, setProductError] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const [settings, setSettings] = useState(() =>
    ({
      ...readJSON(KEY_SETTINGS, {
      nomeLoja: 'LK OUTLET',
      whatsappNumber: STORE_WHATSAPP
      }),
      whatsappNumber: STORE_WHATSAPP
    })
  );

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
    setAuthed(hasAdminSession());
  }, []);

  useEffect(() => {
    writeJSON(KEY_SETTINGS, settings);
  }, [settings]);

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
      <div className="container adminPage">
        <div className="unauthBox">Acesso negado. Faça login novamente.</div>
      </div>
    );
  }

  return (
    <div className="container adminPage">
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
                signOutAdmin();
                setAuthed(false);
                navigate('/admin/login');
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
                  <div className="panelMuted">
                    {remote ? 'Catálogo compartilhado com a loja.' : 'Catálogo compartilhado indisponível.'}
                  </div>
                </div>
                <button
                  className="btn"
                  disabled={productsLoading}
                  onClick={() => {
                    setEditingProduct(null);
                    setProductError('');
                    setProductDraft({
                      id: `p_${Math.random().toString(16).slice(2)}`,
                      nome: '',
                      descricao: '',
                      preco: 0,
                      precoAntigo: 0,
                      precoBase: 39000,
                      promocaoAtiva: false,
                      descontoPercentual: 10,
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

              {catalogError && <div className="adminAlert" role="alert">{catalogError}</div>}
              {productError && <div className="adminAlert" role="alert">{productError}</div>}
              {productsLoading && <div className="muted" role="status">Sincronizando catálogo...</div>}

              <div className="table productTable">
                <div className="thead">
                  <div>Nome</div>
                  <div>Categoria</div>
                  <div>Modalidade</div>
                  <div>Preço</div>
                  <div>Promoção</div>
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
                      <div className="cell priceCell">
                        <span>{formatBRL(p.preco)}</span>
                        {p.precoAntigo > p.preco && <del>{formatBRL(p.precoAntigo)}</del>}
                      </div>
                      <div className="cell">
                        {p.precoAntigo > p.preco
                          ? <span className="pill sale">-{getDiscountPercent(p)}%</span>
                          : <span className="muted">—</span>}
                      </div>
                      <div className="cell">{p.estoque}</div>
                      <div className="cell">
                        <span className={`pill ${p.ativo ? 'ok' : 'off'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                      </div>
                      <div className="cell actions">
                        <button
                          className="mini"
                          onClick={() => {
                            setEditingProduct(p);
                            setProductDraft({
                              ...p,
                              precoBase: getBasePrice(p),
                              promocaoAtiva: Boolean(p.promocaoAtiva || p.precoAntigo > p.preco),
                              descontoPercentual: getDiscountPercent(p)
                            });
                            setProductError('');
                            setProductModalOpen(true);
                          }}
                        >Editar</button>
                        <button
                          className="mini danger"
                          onClick={async () => {
                            if (!confirm('Remover produto?')) return;
                            try {
                              await remove(p.id);
                            } catch (error) {
                              setProductError(`Não foi possível remover o produto: ${error.message}`);
                            }
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
                  <div className="modalMuted">Escolha uma foto do celular ou computador.</div>
                </div>
                <button className="mini" onClick={() => setProductModalOpen(false)}>Fechar</button>
              </div>

              {productError && <div className="adminAlert modalAlert" role="alert">{productError}</div>}
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
                  Foto do produto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setProductError('');
                      try {
                        const imagem = await optimizeImage(file);
                        setProductDraft((draft) => ({ ...draft, imagem }));
                      } catch (error) {
                        setProductError(`Não foi possível carregar a imagem: ${error.message}`);
                      }
                    }}
                  />
                </label>
                <div className="imagePreview">
                  {productDraft?.imagem
                    ? <img src={productDraft.imagem} alt="Prévia do produto" />
                    : <span>Selecione uma imagem para ver a prévia</span>}
                </div>

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
                  Preço normal (R$)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={((productDraft?.precoBase ?? 0) / 100).toFixed(2)}
                    onChange={(e) => setProductDraft((d) => ({
                      ...d,
                      precoBase: Math.round((Number(e.target.value) || 0) * 100)
                    }))}
                  />
                </label>
                <label>
                  Aplicar promoção
                  <select
                    value={productDraft?.promocaoAtiva ? '1' : '0'}
                    onChange={(e) => setProductDraft((d) => ({ ...d, promocaoAtiva: e.target.value === '1' }))}
                  >
                    <option value="0">Não</option>
                    <option value="1">Sim</option>
                  </select>
                </label>
                {productDraft?.promocaoAtiva && (
                  <label>
                    Desconto (%)
                    <input
                      type="number"
                      min="1"
                      max="99"
                      step="1"
                      value={productDraft?.descontoPercentual ?? 10}
                      onChange={(e) => setProductDraft((d) => ({ ...d, descontoPercentual: Number(e.target.value) }))}
                    />
                    <span className="fieldHint">
                      Preço promocional: {formatBRL(Math.round((productDraft.precoBase * (100 - productDraft.descontoPercentual)) / 100))}
                    </span>
                  </label>
                )}

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
                  disabled={savingProduct}
                  onClick={async () => {
                    const d = productDraft;
                    if (!d?.nome?.trim()) return setProductError('Informe o nome do produto.');
                    if (!d?.imagem) return setProductError('Selecione uma imagem para o produto.');
                    if (!MODALIDADES.includes(d.modalidade)) return setProductError('Selecione Futsal ou Society.');
                    if (!Number.isFinite(d.precoBase) || d.precoBase <= 0) return setProductError('Informe um preço normal maior que zero.');
                    if (d.promocaoAtiva && (!Number.isInteger(d.descontoPercentual) || d.descontoPercentual < 1 || d.descontoPercentual > 99)) {
                      return setProductError('O desconto deve ser um número inteiro entre 1% e 99%.');
                    }

                    const promotionalPrice = Math.round((d.precoBase * (100 - d.descontoPercentual)) / 100);
                    const { precoBase, ...productData } = d;
                    const productToSave = {
                      ...productData,
                      nome: d.nome.trim(),
                      preco: d.promocaoAtiva ? promotionalPrice : d.precoBase,
                      precoAntigo: d.promocaoAtiva ? d.precoBase : 0,
                      descontoPercentual: d.promocaoAtiva ? d.descontoPercentual : 0
                    };
                    setSavingProduct(true);
                    setProductError('');
                    try {
                      await upsert(productToSave);
                      setProductModalOpen(false);
                    } catch (error) {
                      setProductError(`Não foi possível salvar o produto: ${error.message}`);
                    } finally {
                      setSavingProduct(false);
                    }
                  }}
                >
                  {savingProduct ? 'Salvando...' : 'Salvar produto'}
                </button>
              </div>
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
