/* ============================================================
   MODEMAN ADMIN — admin.js
   Funções compartilhadas entre todas as páginas do painel
   ============================================================ */

// ===== PRODUTOS PADRÃO =====
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

// ===== AUTH =====
function requireAuth() {
  if (sessionStorage.getItem('mm_admin_ok') !== '1') {
    window.location.href = 'login.html';
  }
}

function logout() {
  sessionStorage.removeItem('mm_admin_ok');
  window.location.href = 'login.html';
}

// ===== DATA HELPERS =====
function getProdutos() {
  const saved = localStorage.getItem('mm_produtos');
  return saved ? JSON.parse(saved) : [...DEFAULT_PRODUTOS];
}

function saveProdutos(arr) {
  localStorage.setItem('mm_produtos', JSON.stringify(arr));
}

function getPedidos() {
  return JSON.parse(localStorage.getItem('mm_pedidos') || '[]');
}

function getConfig() {
  return JSON.parse(localStorage.getItem('mm_config') || '{}');
}

function saveConfig(obj) {
  localStorage.setItem('mm_config', JSON.stringify(obj));
}

// ===== UTILS =====
function fmt(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ===== TOAST =====
function showAdminToast(msg) {
  const t = document.getElementById('adminToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== SIDEBAR MOBILE =====
function initSidebar() {
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebarOverlay');

  if (!hamburger || !sidebar) return;

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', open);
  overlay.addEventListener('click', close);

  // Fechar ao clicar em link (mobile)
  sidebar.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth < 768) close();
    });
  });
}
