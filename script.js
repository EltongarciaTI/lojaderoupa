/* ============================================================
   MODEMAN — script.js
   Multi-page JavaScript
   ============================================================ */

// ===== DADOS DOS PRODUTOS (lê do admin se disponível) =====
const DEFAULT_PRODUTOS = [
  { id: 1,  nome: 'Camisa Social Oxford',    categoria: 'camisas',   preco: 189.90, precoOriginal: null,   emoji: '👔', badge: 'Novo', novo: true },
  { id: 2,  nome: 'Calça Jeans Slim',        categoria: 'calcas',    preco: 229.90, precoOriginal: 299.90, emoji: '👖', badge: 'Sale', novo: true },
  { id: 3,  nome: 'Camiseta Premium Branca', categoria: 'camisetas', preco: 79.90,  precoOriginal: null,   emoji: '👕', badge: 'Novo', novo: true },
  { id: 4,  nome: 'Jaqueta Bomber Preta',    categoria: 'jaquetas',  preco: 399.90, precoOriginal: 549.90, emoji: '🧥', badge: 'Sale', novo: true },
  { id: 5,  nome: 'Camisa Polo Listrada',    categoria: 'camisas',   preco: 149.90, precoOriginal: null,   emoji: '👔', badge: null,   novo: false },
  { id: 6,  nome: 'Bermuda Cargo Cáqui',     categoria: 'bermudas',  preco: 139.90, precoOriginal: 179.90, emoji: '🩳', badge: 'Sale', novo: false },
  { id: 7,  nome: 'Camiseta Estampada',      categoria: 'camisetas', preco: 89.90,  precoOriginal: null,   emoji: '👕', badge: null,   novo: false },
  { id: 8,  nome: 'Calça Alfaiataria',       categoria: 'calcas',    preco: 319.90, precoOriginal: null,   emoji: '👖', badge: null,   novo: false },
  { id: 9,  nome: 'Jaqueta Jeans Delavê',    categoria: 'jaquetas',  preco: 289.90, precoOriginal: 349.90, emoji: '🧥', badge: 'Sale', novo: false },
  { id: 10, nome: 'Camisa Linho Bege',       categoria: 'camisas',   preco: 199.90, precoOriginal: null,   emoji: '👔', badge: null,   novo: false },
  { id: 11, nome: 'Bermuda Surf Navy',       categoria: 'bermudas',  preco: 119.90, precoOriginal: null,   emoji: '🩳', badge: null,   novo: false },
  { id: 12, nome: 'Camiseta Básica Preta',   categoria: 'camisetas', preco: 69.90,  precoOriginal: null,   emoji: '👕', badge: null,   novo: false },
];
// Usa catálogo customizado do admin se existir
const PRODUTOS = JSON.parse(localStorage.getItem('mm_produtos') || 'null') || DEFAULT_PRODUTOS;

// Configurações do admin (WhatsApp, etc.)
const LOJA_CONFIG = JSON.parse(localStorage.getItem('mm_config') || '{}');

const DESCRICOES = {
  camisas:   'Confeccionada em tecido de alta qualidade com caimento impecável. Ideal para ocasiões sociais e ambientes de trabalho. Disponível em diversas cores.',
  calcas:    'Corte moderno com tecido confortável e resistente. Combina com diversas peças do guarda-roupa masculino. Lavável à máquina.',
  camisetas: 'Camiseta de algodão premium com toque suave na pele. Ideal para o dia a dia com muito conforto e estilo.',
  jaquetas:  'Jaqueta com acabamento sofisticado e forro interno para maior conforto. Perfeita para dias mais frescos.',
  bermudas:  'Bermuda leve e resistente, ideal para o verão. Bolsos práticos e elástico na cintura com cadarço ajustável.',
  acessorios:'Acessório de qualidade com materiais selecionados. Complemento perfeito para qualquer look masculino.',
};

// ===== ESTADO GLOBAL =====
let carrinho = JSON.parse(localStorage.getItem('mm_carrinho') || '[]');
let favoritos = JSON.parse(localStorage.getItem('mm_favoritos') || '[]');

// ===== UTILS =====
const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function salvarCarrinho() {
  localStorage.setItem('mm_carrinho', JSON.stringify(carrinho));
}
function salvarFavoritos() {
  localStorage.setItem('mm_favoritos', JSON.stringify(favoritos));
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== CART BADGES =====
function atualizarBadges() {
  const total = carrinho.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cartCount, #cartCountNav').forEach(el => {
    if (!el) return;
    el.textContent = total > 0 ? total : '';
    el.classList.toggle('visible', total > 0);
  });
}

// ===== CART: ADD / REMOVE / QTY =====
function adicionarAoCarrinho(id, tamanho) {
  const p = PRODUTOS.find(x => x.id === id);
  if (!p) return;
  const key = tamanho ? `${id}-${tamanho}` : String(id);
  const existente = carrinho.find(i => i.key === key);
  if (existente) {
    existente.qty++;
  } else {
    carrinho.push({ ...p, key, tamanho: tamanho || null, qty: 1 });
  }
  salvarCarrinho();
  atualizarBadges();
  renderizarCarrinho();
  showToast(`"${p.nome}" adicionado ao carrinho!`);
}

function removerDoCarrinho(key) {
  carrinho = carrinho.filter(i => i.key !== key);
  salvarCarrinho();
  atualizarBadges();
  renderizarCarrinho();
}

function alterarQtd(key, delta) {
  const item = carrinho.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removerDoCarrinho(key); return; }
  salvarCarrinho();
  atualizarBadges();
  renderizarCarrinho();
}

// ===== CART: RENDER =====
function renderizarCarrinho() {
  const container = document.getElementById('cartItems');
  const footer    = document.getElementById('cartFooter');
  if (!container) return;

  if (carrinho.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <span>🛍️</span>
        <p>Seu carrinho está vazio</p>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  container.innerHTML = '';
  carrinho.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item__img">
        <img src="${getProdutoImg(item.id)}" alt="${item.nome}" class="cart-item__photo" />
      </div>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.nome}</p>
        <p class="cart-item__meta">${item.tamanho ? 'Tamanho: ' + item.tamanho : item.categoria}</p>
        <div class="cart-item__footer">
          <strong class="cart-item__price">${fmt(item.preco * item.qty)}</strong>
          <div class="qty-control">
            <button data-action="dec" data-key="${item.key}">−</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-key="${item.key}">+</button>
          </div>
        </div>
      </div>`;
    div.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        alterarQtd(btn.dataset.key, btn.dataset.action === 'inc' ? 1 : -1);
      });
    });
    container.appendChild(div);
  });

  const total = carrinho.reduce((s, i) => s + i.preco * i.qty, 0);
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = fmt(total);
  if (footer) footer.style.display = 'flex';
}

// ===== FINALIZAR COMPRA → WHATSAPP =====
function finalizarCompra() {
  if (carrinho.length === 0) return;

  // Salvar pedido no histórico do admin
  const pedido = {
    id: Date.now(),
    data: new Date().toISOString(),
    itens: carrinho.map(i => ({ ...i })),
    total: carrinho.reduce((s, i) => s + i.preco * i.qty, 0),
  };
  const pedidos = JSON.parse(localStorage.getItem('mm_pedidos') || '[]');
  pedidos.unshift(pedido);
  localStorage.setItem('mm_pedidos', JSON.stringify(pedidos));

  // Montar mensagem WhatsApp
  const linhas = carrinho.map(item => {
    const tam = item.tamanho ? ` (${item.tamanho})` : '';
    return `• ${item.nome}${tam} x${item.qty} — ${fmt(item.preco * item.qty)}`;
  });
  const total = carrinho.reduce((s, i) => s + i.preco * i.qty, 0);
  const msg =
    `Olá! Gostaria de finalizar minha compra 🛍️\n\n` +
    linhas.join('\n') +
    `\n\n*Total: ${fmt(total)}*\n\nAguardo confirmação!`;

  // Número do admin ou fallback
  const numero = (LOJA_CONFIG.whatsapp || '5511999990000').replace(/\D/g, '');
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Imagem do produto: usa upload do admin se disponível, senão arquivo local
function getProdutoImg(id) {
  return localStorage.getItem(`mm_img_${id}`) || `imgs/produto-${id}.jpg`;
}

// ===== CART: OPEN / CLOSE =====
function abrirCarrinho() {
  const overlay = document.getElementById('cartOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function fecharCarrinho() {
  const overlay = document.getElementById('cartOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ===== FAVORITOS =====
function toggleFavorito(id) {
  const idx = favoritos.indexOf(id);
  if (idx === -1) {
    favoritos.push(id);
    salvarFavoritos();
    return true;
  } else {
    favoritos.splice(idx, 1);
    salvarFavoritos();
    return false;
  }
}
function isFavorito(id) { return favoritos.includes(id); }

// ===== CRIAR CARD DE PRODUTO =====
function criarCard(p, opts = {}) {
  const { linkable = true } = opts;
  const div = document.createElement('div');
  div.className = 'produto-card' + (opts.scrollItem ? ' h-scroll-item' : '');

  const badgeHtml = p.badge
    ? `<span class="produto-card__badge ${p.badge === 'Sale' ? 'badge-sale' : 'badge-novo'}">${p.badge}</span>`
    : '';

  const precoOrigHtml = p.precoOriginal
    ? `<span class="preco-original">${fmt(p.precoOriginal)}</span>`
    : '';

  const favAtivo = isFavorito(p.id);

  div.innerHTML = `
    <div class="produto-card__img">
      <!-- FOTO ${p.id}: coloque o arquivo imgs/produto-${p.id}.jpg -->
      <img src="${getProdutoImg(p.id)}" alt="${p.nome}" class="produto-card__photo" />
      ${badgeHtml}
      <button class="produto-card__wish${favAtivo ? ' active' : ''}" data-id="${p.id}" aria-label="Favoritar">
        <svg width="16" height="16" fill="${favAtivo ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
      </button>
    </div>
    <div class="produto-card__info">
      <p class="produto-card__cat">${p.categoria}</p>
      <h3 class="produto-card__name">${p.nome}</h3>
      <div class="produto-card__preco">
        <span class="preco-atual">${fmt(p.preco)}</span>
        ${precoOrigHtml}
      </div>
      <button class="produto-card__add" data-id="${p.id}">Adicionar ao Carrinho</button>
    </div>`;

  // Click na imagem/nome → ir para detalhe
  if (linkable) {
    div.querySelector('.produto-card__img').addEventListener('click', e => {
      if (!e.target.closest('.produto-card__wish')) {
        window.location.href = `produto.html?id=${p.id}`;
      }
    });
    div.querySelector('.produto-card__name').addEventListener('click', () => {
      window.location.href = `produto.html?id=${p.id}`;
    });
    div.querySelector('.produto-card__name').style.cursor = 'pointer';
  }

  // Favorito
  div.querySelector('.produto-card__wish').addEventListener('click', e => {
    e.stopPropagation();
    const ativo = toggleFavorito(p.id);
    const btn = e.currentTarget;
    const svg = btn.querySelector('svg');
    btn.classList.toggle('active', ativo);
    svg.setAttribute('fill', ativo ? 'currentColor' : 'none');
    showToast(ativo ? 'Adicionado aos favoritos!' : 'Removido dos favoritos');
  });

  // Add to cart
  div.querySelector('.produto-card__add').addEventListener('click', e => {
    e.stopPropagation();
    adicionarAoCarrinho(p.id, null);
  });

  return div;
}

// ===== TOPBAR SCROLL =====
function initTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;
  // Páginas internas já começam com scrolled
  if (!topbar.classList.contains('scrolled')) {
    window.addEventListener('scroll', () => {
      topbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }
}

// ===== CART EVENTS (shared) =====
function initCartEvents() {
  document.getElementById('cartBtn')?.addEventListener('click', abrirCarrinho);
  document.getElementById('cartNavBtn')?.addEventListener('click', abrirCarrinho);
  document.getElementById('closeCart')?.addEventListener('click', fecharCarrinho);
  document.getElementById('cartOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) fecharCarrinho();
  });
  document.getElementById('clearCart')?.addEventListener('click', () => {
    carrinho = [];
    salvarCarrinho();
    atualizarBadges();
    renderizarCarrinho();
    showToast('Carrinho limpo!');
  });
  document.getElementById('checkoutBtn')?.addEventListener('click', finalizarCompra);
}

// ===== SEARCH (shared) =====
function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input   = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  document.getElementById('searchBtn')?.addEventListener('click', () => {
    overlay?.classList.add('open');
    input?.focus();
  });
  document.getElementById('closeSearch')?.addEventListener('click', () => {
    overlay?.classList.remove('open');
    if (input) input.value = '';
  });

  input?.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!results) return;
    if (!q) {
      results.innerHTML = '<p class="search-empty">Digite para buscar produtos</p>';
      return;
    }
    const found = PRODUTOS.filter(p =>
      p.nome.toLowerCase().includes(q) || p.categoria.includes(q)
    );
    results.innerHTML = '';
    if (found.length === 0) {
      results.innerHTML = '<p class="search-empty">Nenhum produto encontrado.</p>';
    } else {
      found.forEach(p => results.appendChild(criarCard(p)));
    }
  });
}

// ===== ACCORDION (shared) =====
function initAccordion() {
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      item.classList.toggle('open');
    });
  });
}

// ===== PAGE: HOME =====
function initHome() {
  // Novidades (horizontal scroll)
  const novGrid = document.getElementById('novidades-grid');
  if (novGrid) {
    PRODUTOS.filter(p => p.novo).forEach(p => {
      novGrid.appendChild(criarCard(p, { scrollItem: true }));
    });
  }

  // Categorias → ir para produtos com filtro
  document.querySelectorAll('.categoria-card').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = `produtos.html?filter=${card.dataset.cat}`;
    });
  });
}

// ===== PAGE: PRODUTOS =====
function initProdutos() {
  const grid = document.getElementById('produtos-grid');
  if (!grid) return;

  // Ler filtro da URL
  const params = new URLSearchParams(location.search);
  const filtroUrl = params.get('filter') || 'todos';

  // Ativar botão correto
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const ativo = btn.dataset.filter === filtroUrl ||
      (filtroUrl === 'sale' && btn.dataset.filter === 'todos');
    btn.classList.toggle('active', ativo);
  });

  renderGrid(filtroUrl === 'sale' ? 'sale' : filtroUrl);

  // Eventos de filtro
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid(btn.dataset.filter);
      // Atualizar URL sem reload
      history.replaceState(null, '', `?filter=${btn.dataset.filter}`);
    });
  });

  function renderGrid(cat) {
    grid.innerHTML = '';
    const lista = cat === 'todos'
      ? PRODUTOS
      : cat === 'sale'
      ? PRODUTOS.filter(p => p.badge === 'Sale')
      : PRODUTOS.filter(p => p.categoria === cat);

    if (lista.length === 0) {
      grid.innerHTML = `<div class="products-empty"><span>🔍</span><p>Nenhum produto nesta categoria.</p></div>`;
      return;
    }
    lista.forEach(p => grid.appendChild(criarCard(p)));
  }
}

// ===== PAGE: PRODUTO DETALHE =====
function initProduto() {
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'));
  const produto = PRODUTOS.find(p => p.id === id);

  if (!produto) {
    window.location.href = 'produtos.html';
    return;
  }

  // Atualizar título da página
  document.title = `${produto.nome} — ModeMan`;

  // Breadcrumb
  const bnome = document.getElementById('breadcrumbNome');
  if (bnome) bnome.textContent = produto.nome;

  // Imagem — usa upload do admin se disponível
  const fotoEl = document.getElementById('produtoFoto');
  if (fotoEl) {
    fotoEl.src = getProdutoImg(produto.id);
    fotoEl.alt = produto.nome;
  }

  // Info
  document.getElementById('produtoCat').textContent = produto.categoria;
  document.getElementById('produtoNome').textContent = produto.nome;
  document.getElementById('produtoPreco').textContent = fmt(produto.preco);
  const origEl = document.getElementById('produtoPrecoOrig');
  if (produto.precoOriginal) {
    origEl.textContent = fmt(produto.precoOriginal);
    origEl.style.display = '';
  }

  const descEl = document.getElementById('produtoDesc');
  if (descEl) descEl.textContent = DESCRICOES[produto.categoria] || '';

  const acordionDesc = document.getElementById('acordionDesc');
  if (acordionDesc) acordionDesc.textContent = DESCRICOES[produto.categoria] || '';

  // Sticky CTA
  const ctaNome = document.getElementById('ctaNome');
  const ctaPreco = document.getElementById('ctaPreco');
  if (ctaNome) ctaNome.textContent = produto.nome;
  if (ctaPreco) ctaPreco.textContent = fmt(produto.preco);

  // Sticky CTA visível ao rolar
  const stickyCta = document.getElementById('stickyCta');
  if (stickyCta) {
    window.addEventListener('scroll', () => {
      stickyCta.classList.toggle('visible', window.scrollY > 340);
    });
    document.getElementById('ctaAddCart')?.addEventListener('click', () => {
      const tam = document.querySelector('.size-btn.selected')?.dataset.size || null;
      adicionarAoCarrinho(produto.id, tam);
      abrirCarrinho();
    });
  }

  // Favorito
  const wishBtn = document.getElementById('wishBtn');
  const wishBtnAlt = document.getElementById('wishBtnAlt');
  function atualizarWish() {
    const fav = isFavorito(produto.id);
    if (wishBtn) {
      const svg = wishBtn.querySelector('svg');
      svg?.setAttribute('fill', fav ? 'var(--red)' : 'none');
      svg?.setAttribute('stroke', fav ? 'var(--red)' : 'currentColor');
    }
    if (wishBtnAlt) {
      wishBtnAlt.textContent = fav ? '❤️  Remover dos favoritos' : '🤍  Adicionar aos favoritos';
    }
  }
  atualizarWish();
  wishBtn?.addEventListener('click', () => { toggleFavorito(produto.id); atualizarWish(); });
  wishBtnAlt?.addEventListener('click', () => {
    const fav = toggleFavorito(produto.id);
    atualizarWish();
    showToast(fav ? 'Adicionado aos favoritos!' : 'Removido dos favoritos');
  });

  // Tamanhos
  let tamanhoSelecionado = null;
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      tamanhoSelecionado = btn.dataset.size;
      const el = document.getElementById('tamanhoSelecionado');
      if (el) el.textContent = ` — ${tamanhoSelecionado}`;
    });
  });

  // Quantidade
  let qty = 1;
  const qtyEl = document.getElementById('qtyVal');
  document.getElementById('qtyInc')?.addEventListener('click', () => {
    qty++;
    if (qtyEl) qtyEl.textContent = qty;
  });
  document.getElementById('qtyDec')?.addEventListener('click', () => {
    if (qty > 1) { qty--; if (qtyEl) qtyEl.textContent = qty; }
  });

  // Add to cart
  document.getElementById('addCartBtn')?.addEventListener('click', () => {
    if (!tamanhoSelecionado) {
      showToast('Selecione um tamanho primeiro');
      document.getElementById('sizeGrid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    for (let i = 0; i < qty; i++) adicionarAoCarrinho(produto.id, tamanhoSelecionado);
    abrirCarrinho();
  });

  // Produtos relacionados
  const relGrid = document.getElementById('relacionadosGrid');
  if (relGrid) {
    PRODUTOS
      .filter(p => p.categoria === produto.categoria && p.id !== produto.id)
      .slice(0, 4)
      .forEach(p => relGrid.appendChild(criarCard(p, { scrollItem: true })));
  }

  // Accordion
  initAccordion();
}

// ===== PAGE: SOBRE =====
function initSobre() {
  // Formulário de contato
  document.getElementById('contatoForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.textContent = 'Enviando...';
    btn.disabled = true;
    setTimeout(() => {
      document.getElementById('formSuccess')?.classList.add('show');
      e.target.reset();
      btn.textContent = 'Enviar Mensagem';
      btn.disabled = false;
      setTimeout(() => document.getElementById('formSuccess')?.classList.remove('show'), 4000);
    }, 1200);
  });

  // Scroll para #contato se vier da URL
  if (location.hash === '#contato') {
    setTimeout(() => {
      document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  initTopbar();
  initCartEvents();
  initSearch();
  renderizarCarrinho();
  atualizarBadges();

  if (page === 'home')     initHome();
  if (page === 'produtos') initProdutos();
  if (page === 'produto')  initProduto();
  if (page === 'sobre')    initSobre();
});
