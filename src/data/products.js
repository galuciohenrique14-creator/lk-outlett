export const CATEGORIAS = ['Chuteiras'];
export const MODALIDADES = ['Futsal', 'Society'];
export const PRODUCTS_STORAGE_KEY = 'lkoutlet_products_v1';

const produtosExistentes = [
  {
    id: 'p1',
    nome: 'Chuteira Lima e Amarela',
    descricao: 'Visual vibrante para entrar em campo com personalidade.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-lima-amarela.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: true,
    tags: ['chuteira','lima','amarela']
  },
  {
    id: 'p2',
    nome: 'Chuteira Verde Neon',
    descricao: 'Combinação verde neon e preto para um visual marcante.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-verde-neon.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: false,
    tags: ['chuteira','verde','neon']
  },
  {
    id: 'p3',
    nome: 'Chuteira Branca, Cinza e Lima',
    descricao: 'Base clara com detalhes cinza e pontos em verde lima.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-branca-cinza-lima.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: true,
    tags: ['chuteira','branca','cinza','lima']
  },
  {
    id: 'p4',
    nome: 'Chuteira Amarela e Vermelha',
    descricao: 'Amarelo intenso com detalhes vermelhos contrastantes.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-amarela-vermelha.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: false,
    tags: ['chuteira','amarela','vermelha']
  },
  {
    id: 'p5',
    nome: 'Chuteira Turquesa',
    descricao: 'Tons turquesa com detalhes vermelhos para se destacar.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-turquesa.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: false,
    tags: ['chuteira','turquesa']
  },
  {
    id: 'p6',
    nome: 'Chuteira Gelo e Rosa',
    descricao: 'Tons suaves com detalhes rosa para um visual diferente.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-gelo-rosa.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: true,
    tags: ['chuteira','gelo','rosa']
  },
  {
    id: 'p7',
    nome: 'Chuteira Rosa e Preta',
    descricao: 'Rosa vibrante com detalhes pretos de alto contraste.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-rosa.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: false,
    tags: ['chuteira','rosa','preta']
  },
  {
    id: 'p8',
    nome: 'Chuteira Branca e Vermelha',
    descricao: 'Modelo claro com detalhes vermelhos e pretos.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-branca-vermelha.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: false,
    tags: ['chuteira','branca','vermelha']
  },
  {
    id: 'p9',
    nome: 'Chuteira Branca e Azul',
    descricao: 'Branco com azul e detalhes vibrantes na sola.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-branca-azul.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: true,
    tags: ['chuteira','branca','azul']
  },
  {
    id: 'p10',
    nome: 'Chuteira Branca e Azul Marinho',
    descricao: 'Outra combinação branca e azul, com detalhes vermelhos.',
    preco: 38000,
    precoAntigo: 0,
    imagem: '/images/chuteira-branca-azul-2.jpeg',
    categoria: 'Chuteiras',
    tamanho: '38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: false,
    tags: ['chuteira','branca','azul']
  }
];

const catalogImage = (number) => `/images/catalogo-${number}.jpeg`;

const novaChuteira = (id, nome, numerosDasFotos) => {
  const imagens = numerosDasFotos.map(catalogImage);
  const detalhes = nome.replace(/^Chuteira /, '').toLocaleLowerCase('pt-BR');
  const palavrasTag = detalhes.split(/\s+/).filter((palavra) => !['com', 'e'].includes(palavra));

  return {
    id,
    nome,
    descricao: `${detalhes.charAt(0).toLocaleUpperCase('pt-BR')}${detalhes.slice(1)} com visual marcante para jogar com personalidade.`,
    preco: 39000,
    precoAntigo: 0,
    imagem: imagens[0],
    imagens,
    categoria: 'Chuteiras',
    tamanho: '36,37,38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: false,
    tags: ['chuteira', ...palavrasTag]
  };
};

const novosModelos = Array.from({ length: 39 }, (_, index) => {
  const numero = index + 39;
  const detalhes = `modelo ${numero}`;

  return {
    id: `p${numero}`,
    nome: `Chuteira Modelo ${numero}`,
    descricao: 'Modelo exclusivo LK Outlet para jogar com personalidade.',
    preco: 39000,
    precoAntigo: 0,
    imagem: `/images/novos-modelos/chuteira-${numero}.jpeg`,
    categoria: 'Chuteiras',
    tamanho: '36,37,38,39,40,41,42,43',
    estoque: 6,
    ativo: true,
    destaque: false,
    tags: ['chuteira', detalhes]
  };
});

export const produtosSeed = [
  ...produtosExistentes.map((produto) => ({
    ...produto,
    preco: 39000,
    tamanho: '36,37,38,39,40,41,42,43'
  })),
  novaChuteira('p11', 'Chuteira Lilás e Branca', [11]),
  novaChuteira('p12', 'Chuteira Rosa e Branca', [12]),
  novaChuteira('p13', 'Chuteira Laranja e Branca', [13]),
  novaChuteira('p14', 'Chuteira Lavanda e Rosa', [14]),
  novaChuteira('p15', 'Chuteira Branca e Vermelha', [15]),
  novaChuteira('p16', 'Chuteira Coral e Preta', [16, 17, 21]),
  novaChuteira('p17', 'Chuteira Lima com Três Listras', [18, 19, 20, 22, 26]),
  novaChuteira('p18', 'Chuteira Branca, Azul e Coral', [23, 24, 25]),
  novaChuteira('p19', 'Chuteira Rosa Claro', [27, 28, 29, 30, 32]),
  novaChuteira('p20', 'Chuteira Preta e Azul', [31, 33, 34, 35, 36]),
  novaChuteira('p21', 'Chuteira Branca, Rosa e Azul', [37, 38, 40]),
  novaChuteira('p22', 'Chuteira Rosé com Dourado', [39, 41, 42, 43]),
  novaChuteira('p23', 'Chuteira Branca, Preta e Vermelha', [44, 45, 46, 47]),
  novaChuteira('p24', 'Chuteira Preta e Dourada', [48, 49, 50, 53]),
  novaChuteira('p25', 'Chuteira Vermelha', [51, 52, 54]),
  novaChuteira('p26', 'Chuteira Grafite e Laranja', [55, 56, 57, 59]),
  novaChuteira('p27', 'Chuteira Rosa e Preta', [58, 60, 61, 64]),
  novaChuteira('p28', 'Chuteira Preta e Bronze', [62, 63, 65]),
  novaChuteira('p29', 'Chuteira Branca e Dourada', [66, 67, 68, 71]),
  novaChuteira('p30', 'Chuteira Branca e Laranja', [69, 70]),
  novaChuteira('p31', 'Chuteira Branca com Detalhes Vermelhos', [72, 73]),
  novaChuteira('p32', 'Chuteira Preta, Branca e Azul', [74, 75, 76, 78]),
  novaChuteira('p33', 'Chuteira Rosé e Nude', [77, 79, 80, 84]),
  novaChuteira('p34', 'Chuteira Turquesa e Rosa', [81, 82, 83]),
  novaChuteira('p35', 'Chuteira Preta e Verde Neon', [85, 86, 89]),
  novaChuteira('p36', 'Chuteira Pink e Preta', [87, 90, 94]),
  novaChuteira('p37', 'Chuteira Branca e Coral', [88]),
  novaChuteira('p38', 'Chuteira Limão e Preta', [91, 92, 93]),
  ...novosModelos
];

export function getProdutos() {
  try {
    const produtosSalvos = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY) || 'null');
    return Array.isArray(produtosSalvos) ? produtosSalvos : produtosSeed;
  } catch {
    return produtosSeed;
  }
}

