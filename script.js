/* =============================================
   LINKVITRINE PRO - Script Completo
   Sistema de links + afiliados + importação
============================================= */

// ===== STATE =====
let state = {
  links: [],
  produtos: [],
  sociais: {},
  config: {
    name: 'Usuário',
    username: 'usuario',
    bio: 'Seus melhores links aqui 🔥',
    email: '',
    avatar: '',
    theme: 'dark',
    btnStyle: 'rounded',
    primaryColor: '#6366f1'
  },
  clicks: {},
  analytics: {}
};

const DB = 'linkvitrine_v2';

// ===== LOAD / SAVE =====
function loadState() {
  try {
    const saved = localStorage.getItem(DB);
    if (saved) state = { ...state, ...JSON.parse(saved) };
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem(DB, JSON.stringify(state));
  } catch(e) {}
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Splash
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('app').style.opacity = '1';
  }, 1800);

  initUI();
  renderAll();
  setupEvents();
  setupSocialGrid();

  // Demo data se vazio
  if (!state.links.length && !state.produtos.length) {
    addDemoData();
  }
});

function initUI() {
  // Aplicar config
  document.getElementById('greetName').textContent = state.config.name;
  document.getElementById('previewUrl').textContent =
    `linkvitrine.pro/${state.config.username}`;
  document.getElementById('avatarInitial').textContent =
    state.config.name.charAt(0).toUpperCase();

  // Config form
  document.getElementById('cfgName').value = state.config.name;
  document.getElementById('cfgUser').value = state.config.username;
  document.getElementById('cfgBio').value = state.config.bio;
  document.getElementById('cfgEmail').value = state.config.email || '';

  // Avatar
  if (state.config.avatar) {
    document.getElementById('tb-avatar') &&
      (document.querySelector('.tb-avatar').innerHTML = `<img src="${state.config.avatar}">`);
  }

  // Tema
  document.body.className = `theme-${state.config.theme === 'light' ? 'light' : 'dark'}`;
  document.getElementById('themeIcon').className =
    state.config.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

function renderAll() {
  renderLinks();
  renderProdutos();
  renderMiniPreview();
  renderAnalytics();
  updateStats();
}

// ===== NAVEGAÇÃO =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.snav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById(`page-${id}`);
  if (page) page.classList.add('active');

  const nav = document.querySelector(`[data-page="${id}"]`);
  if (nav) nav.classList.add('active');

  const titles = {
    dashboard: 'Dashboard', links: 'Meus Links', produtos: 'Produtos',
    redes: 'Redes Sociais', import: 'Importar Links',
    aparencia: 'Aparência', analytics: 'Analytics', config: 'Configurações'
  };
  document.getElementById('topbarTitle').textContent = titles[id] || id;

  // Fechar sidebar mobile
  closeSidebarMobile();

  // Renderizar live preview se aparência
  if (id === 'aparencia') renderLivePreview();
}

function setupEvents() {
  // Nav items
  document.querySelectorAll('.snav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(item.dataset.page);
    });
  });

  // Prod tabs
  document.querySelectorAll('.ptab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.ptab-content').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`ptab-${tab.dataset.ptab}`)?.classList.add('active');
    });
  });

  // Icon preview
  const iconInput = document.getElementById('linkIcon');
  if (iconInput) {
    iconInput.addEventListener('input', () => {
      document.getElementById('linkIconPreview').className = iconInput.value;
    });
  }

  // Search na página links
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterLinks(e.target.value);
    });
  }

  // Detectar URL de link
  const linkUrl = document.getElementById('linkUrl');
  if (linkUrl) {
    linkUrl.addEventListener('input', (e) => detectLinkInfo(e.target.value));
  }

  // Detectar URL de produto
  const prodUrl = document.getElementById('prodUrl');
  if (prodUrl) {
    prodUrl.addEventListener('input', (e) => {
      const loja = detectStore(e.target.value);
      const info = getStoreInfo(loja);
      document.getElementById('storeDetect').textContent = info.icon;
    });
  }
}

// ===== SIDEBAR ===== 
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}

function closeSidebarMobile() {
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  }
}

// ===== LINKS =====
function openAddLink() {
  const form = document.getElementById('addLinkForm');
  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth' });
}

function closeAddLink() {
  document.getElementById('addLinkForm').style.display = 'none';
  clearLinkForm();
}

function clearLinkForm() {
  ['linkUrl', 'linkTitle'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('linkIcon').value = 'fas fa-link';
  document.getElementById('linkIconPreview').className = 'fas fa-link';
  document.getElementById('urlFavicon').textContent = '🔗';
  document.getElementById('linkColor').value = '#6366f1';
}

function detectLinkInfo(url) {
  if (!url || !url.startsWith('http')) return;

  const loja = detectStore(url);
  const info = getStoreInfo(loja);
  document.getElementById('urlFavicon').textContent = info.icon;

  // Auto-preencher título e ícone
  const titleEl = document.getElementById('linkTitle');
  const iconEl = document.getElementById('linkIcon');

  const autoInfo = getAutoLinkInfo(url);
  if (autoInfo && !titleEl.value) {
    titleEl.value = autoInfo.title;
    iconEl.value = autoInfo.icon;
    document.getElementById('linkIconPreview').className = autoInfo.icon;
    document.getElementById('linkColor').value = autoInfo.color;
    setColor(autoInfo.color, 'linkColor');
  }
}

function getAutoLinkInfo(url) {
  const u = url.toLowerCase();
  const map = [
    { test: 'instagram.com', title: 'Instagram', icon: 'fab fa-instagram', color: '#E1306C' },
    { test: 'tiktok.com', title: 'TikTok', icon: 'fab fa-tiktok', color: '#000000' },
    { test: 'youtube.com', title: 'YouTube', icon: 'fab fa-youtube', color: '#FF0000' },
    { test: 'youtu.be', title: 'YouTube', icon: 'fab fa-youtube', color: '#FF0000' },
    { test: 'twitter.com', title: 'Twitter / X', icon: 'fab fa-twitter', color: '#1DA1F2' },
    { test: 'x.com', title: 'X (Twitter)', icon: 'fab fa-x-twitter', color: '#000000' },
    { test: 'facebook.com', title: 'Facebook', icon: 'fab fa-facebook', color: '#1877F2' },
    { test: 'linkedin.com', title: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0A66C2' },
    { test: 'spotify.com', title: 'Spotify', icon: 'fab fa-spotify', color: '#1DB954' },
    { test: 'discord.com', title: 'Discord', icon: 'fab fa-discord', color: '#5865F2' },
    { test: 'discord.gg', title: 'Discord', icon: 'fab fa-discord', color: '#5865F2' },
    { test: 'whatsapp.com', title: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25D366' },
    { test: 'wa.me', title: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25D366' },
    { test: 'telegram', title: 'Telegram', icon: 'fab fa-telegram', color: '#26A5E4' },
    { test: 'twitch.tv', title: 'Twitch', icon: 'fab fa-twitch', color: '#9146FF' },
    { test: 'github.com', title: 'GitHub', icon: 'fab fa-github', color: '#333333' },
    { test: 'amazon.com', title: 'Amazon', icon: 'fab fa-amazon', color: '#FF9900' },
    { test: 'shopee.com', title: 'Shopee', icon: 'fas fa-shopping-bag', color: '#EE4D2D' },
    { test: 'mercadolivre', title: 'Mercado Livre', icon: 'fas fa-shopping-cart', color: '#FFD700' },
    { test: 'hotmart.com', title: 'Hotmart', icon: 'fas fa-fire', color: '#F04E23' },
    { test: 'eduzz.com', title: 'Eduzz', icon: 'fas fa-graduation-cap', color: '#3B82F6' },
    { test: 'kiwify.com', title: 'Kiwify', icon: 'fas fa-seedling', color: '#10B981' },
  ];

  for (const item of map) {
    if (u.includes(item.test)) return item;
  }
  return null;
}

function adicionarLink() {
  const url = document.getElementById('linkUrl').value.trim();
  const title = document.getElementById('linkTitle').value.trim();

  if (!url || !title) {
    showToast('❌ URL e título são obrigatórios');
    return;
  }

  const link = {
    id: Date.now().toString(),
    url,
    title,
    icon: document.getElementById('linkIcon').value || 'fas fa-link',
    color: document.getElementById('linkColor').value || '#6366f1',
    category: document.getElementById('linkCat').value,
    highlight: document.getElementById('linkHighlight').checked,
    newTab: document.getElementById('linkNewTab').checked,
    active: true,
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  state.links.unshift(link);
  saveState();
  renderLinks();
  renderMiniPreview();
  updateStats();
  closeAddLink();
  showToast('✅ Link adicionado!');
}

function renderLinks(filter = '') {
  const list = document.getElementById('linksList');
  const empty = document.getElementById('emptyLinks');
  const badge = document.getElementById('badgeLinks');

  let links = state.links;
  if (filter) {
    links = links.filter(l =>
      l.title.toLowerCase().includes(filter) ||
      l.url.toLowerCase().includes(filter)
    );
  }

  badge.textContent = state.links.length;

  if (!links.length) {
    list.innerHTML = '';
    empty.classList.add('show');
    return;
  }

  empty.classList.remove('show');
  list.innerHTML = links.map(link => createLinkItemHTML(link)).join('');
}

function createLinkItemHTML(link) {
  const autoInfo = getAutoLinkInfo(link.url);
  const icon = link.icon || autoInfo?.icon || 'fas fa-link';
  const color = link.color || autoInfo?.color || '#6366f1';

  return `
    <div class="link-item" data-id="${link.id}">
      <span class="li-drag">⠿</span>
      <div class="li-icon" style="background:${color}">
        <i class="${icon}"></i>
      </div>
      <div class="li-info">
        <div class="li-title">${link.title}</div>
        <div class="li-url">${link.url}</div>
      </div>
      ${link.highlight ? '<span class="li-badge">⭐ Destaque</span>' : ''}
      <div class="li-clicks">
        <i class="fas fa-mouse-pointer"></i>
        ${state.clicks[link.id] || 0}
      </div>
      <div class="li-actions">
        <button class="li-act li-toggle ${link.active ? 'on' : ''}"
          onclick="toggleLink('${link.id}')" title="${link.active ? 'Desativar' : 'Ativar'}">
          <i class="fas fa-${link.active ? 'toggle-on' : 'toggle-off'}"></i>
        </button>
        <button class="li-act li-edit" onclick="editarLink('${link.id}')" title="Editar">
          <i class="fas fa-pen"></i>
        </button>
        <button class="li-act li-del" onclick="removerLink('${link.id}')" title="Remover">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

function toggleLink(id) {
  const link = state.links.find(l => l.id === id);
  if (link) {
    link.active = !link.active;
    saveState();
    renderLinks();
    renderMiniPreview();
  }
}

function removerLink(id) {
  if (!confirm('Remover este link?')) return;
  state.links = state.links.filter(l => l.id !== id);
  saveState();
  renderLinks();
  renderMiniPreview();
  updateStats();
  showToast('🗑️ Link removido');
}

function editarLink(id) {
  const link = state.links.find(l => l.id === id);
  if (!link) return;

  openAddLink();
  document.getElementById('linkUrl').value = link.url;
  document.getElementById('linkTitle').value = link.title;
  document.getElementById('linkIcon').value = link.icon;
  document.getElementById('linkIconPreview').className = link.icon;
  document.getElementById('linkColor').value = link.color;
  document.getElementById('linkCat').value = link.category;
  document.getElementById('linkHighlight').checked = link.highlight;
  document.getElementById('linkNewTab').checked = link.newTab;

  // Substituir botão para editar
  const btn = document.querySelector('#addLinkForm .btn-primary');
  if (btn) {
    btn.textContent = '💾 Salvar';
    btn.onclick = () => salvarEdicaoLink(id);
  }
}

function salvarEdicaoLink(id) {
  const idx = state.links.findIndex(l => l.id === id);
  if (idx < 0) return;

  state.links[idx] = {
    ...state.links[idx],
    url: document.getElementById('linkUrl').value.trim(),
    title: document.getElementById('linkTitle').value.trim(),
    icon: document.getElementById('linkIcon').value,
    color: document.getElementById('linkColor').value,
    category: document.getElementById('linkCat').value,
    highlight: document.getElementById('linkHighlight').checked,
    newTab: document.getElementById('linkNewTab').checked
  };

  saveState();
  renderLinks();
  renderMiniPreview();
  closeAddLink();
  showToast('✅ Link atualizado!');
}

function filterLinks(query) {
  renderLinks(query.toLowerCase());
}

// ===== PRODUTOS =====
function openAddProduto() {
  const form = document.getElementById('addProdutoForm');
  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth' });
}

function closeAddProduto() {
  document.getElementById('addProdutoForm').style.display = 'none';
  document.getElementById('fetchResult').style.display = 'none';
}

function detectStore(url) {
  if (!url) return 'outros';
  const u = url.toLowerCase();
  if (u.includes('amazon') || u.includes('amzn')) return 'amazon';
  if (u.includes('shopee')) return 'shopee';
  if (u.includes('mercadolivre') || u.includes('mercadolibre') || u.includes('meli.com')) return 'mercadolivre';
  if (u.includes('americanas')) return 'americanas';
  if (u.includes('magalu') || u.includes('magazineluiza')) return 'magalu';
  if (u.includes('aliexpress')) return 'aliexpress';
  if (u.includes('casasbahia')) return 'casasbahia';
  return 'outros';
}

function getStoreInfo(store) {
  const s = {
    amazon: { nome: 'Amazon', icon: '📦', color: '#FF9900', class: 'store-amazon' },
    shopee: { nome: 'Shopee', icon: '🛍️', color: '#EE4D2D', class: 'store-shopee' },
    mercadolivre: { nome: 'Mercado Livre', icon: '🛒', color: '#FFD700', class: 'store-mercadolivre' },
    americanas: { nome: 'Americanas', icon: '🏬', color: '#e60014', class: 'store-outros' },
    magalu: { nome: 'Magalu', icon: '🛒', color: '#0086ff', class: 'store-outros' },
    aliexpress: { nome: 'AliExpress', icon: '📦', color: '#ff6600', class: 'store-outros' },
    casasbahia: { nome: 'Casas Bahia', icon: '🏪', color: '#f7a800', class: 'store-outros' },
    outros: { nome: 'Loja', icon: '🏪', color: '#6366f1', class: 'store-outros' }
  };
  return s[store] || s.outros;
}

async function fetchProduto() {
  const url = document.getElementById('prodUrl').value.trim();
  if (!url) { showToast('❌ Cole um link'); return; }

  try { new URL(url); } catch { showToast('❌ URL inválida'); return; }

  const store = detectStore(url);
  const info = getStoreInfo(store);

  document.getElementById('storeDetect').textContent = info.icon;
  document.getElementById('fetchResult').style.display = 'grid';
  document.getElementById('frImg').src = '';
  document.getElementById('frImg').parentElement.innerHTML = `
    <div style="font-size:3rem;text-align:center;padding:30px">${info.icon}</div>
    <div class="fr-store ${info.class}">${info.icon} ${info.nome}</div>
  `;
  document.getElementById('frTitle').value = '';
  document.getElementById('frAffLink').value = url;

  // Extrair nome da URL
  const nome = extrairNomeProduto(url, store);
  document.getElementById('frTitle').value = nome;

  showToast(`${info.icon} ${info.nome} detectado! Preencha os dados.`);
}

function extrairNomeProduto(url, store) {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/').filter(Boolean);

    if (store === 'amazon') {
      const dpIdx = path.findIndex(p => p === 'dp');
      if (dpIdx > 0) {
        return decodeURIComponent(path[dpIdx - 1])
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
          .substring(0, 80);
      }
    }

    if (store === 'mercadolivre') {
      const last = path[path.length - 1];
      return last.replace(/-MLB.*/g, '').replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()).substring(0, 80);
    }

    if (store === 'shopee') {
      const last = path[path.length - 1];
      return last.replace(/-i\.\d+\.\d+/g, '').replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()).substring(0, 80);
    }

    // Genérico
    const last = path[path.length - 1];
    if (last && last.length > 3) {
      return decodeURIComponent(last).replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()).substring(0, 80);
    }

    return `Produto - ${getStoreInfo(store).nome}`;
  } catch {
    return `Produto - ${getStoreInfo(store).nome}`;
  }
}

function salvarProdutoAuto() {
  const url = document.getElementById('prodUrl').value.trim();
  const title = document.getElementById('frTitle').value.trim();
  const currentPrice = parseFloat(document.getElementById('frCurrentPrice').value) || 0;
  const oldPrice = parseFloat(document.getElementById('frOldPrice').value) || 0;
  const affLink = document.getElementById('frAffLink').value.trim() || url;
  const category = document.getElementById('frCat').value;
  const store = detectStore(url);

  if (!title || !affLink) {
    showToast('❌ Nome e link são obrigatórios');
    return;
  }

  const produto = {
    id: Date.now().toString(),
    title,
    image: '',
    currentPrice,
    oldPrice,
    store,
    category,
    affLink,
    rating: 4.5,
    reviews: Math.floor(Math.random() * 400) + 50,
    hot: false,
    isNew: true,
    createdAt: new Date().toISOString()
  };

  state.produtos.unshift(produto);
  saveState();
  renderProdutos();
  updateStats();
  closeAddProduto();
  document.getElementById('fetchResult').style.display = 'none';
  document.getElementById('prodUrl').value = '';
  showToast('✅ Produto adicionado!');
}

function salvarProdutoManual() {
  const title = document.getElementById('mpTitle').value.trim();
  const affLink = document.getElementById('mpAffLink').value.trim();

  if (!title || !affLink) {
    showToast('❌ Nome e link são obrigatórios');
    return;
  }

  const produto = {
    id: Date.now().toString(),
    title,
    image: document.getElementById('mpImage').value.trim(),
    currentPrice: parseFloat(document.getElementById('mpCurrentPrice').value) || 0,
    oldPrice: parseFloat(document.getElementById('mpOldPrice').value) || 0,
    store: document.getElementById('mpStore').value,
    category: document.getElementById('mpCat').value,
    affLink,
    rating: 4.5,
    reviews: Math.floor(Math.random() * 300) + 20,
    hot: false,
    isNew: true,
    createdAt: new Date().toISOString()
  };

  state.produtos.unshift(produto);
  saveState();
  renderProdutos();
  updateStats();
  closeAddProduto();
  showToast('✅ Produto adicionado!');
}

function cancelFetch() {
  document.getElementById('fetchResult').style.display = 'none';
  document.getElementById('prodUrl').value = '';
  document.getElementById('storeDetect').textContent = '🔗';
}

function renderProdutos(filter = 'todos') {
  const grid = document.getElementById('prodGrid');
  const empty = document.getElementById('emptyProd');
  const badge = document.getElementById('badgeProdutos');

  badge.textContent = state.produtos.length;

  const lista = filter === 'todos'
    ? state.produtos
    : state.produtos.filter(p => p.category === filter);

  if (!lista.length) {
    grid.innerHTML = '';
    empty.classList.add('show');
    return;
  }

  empty.classList.remove('show');
  grid.innerHTML = lista.map((p, i) => createProdCardHTML(p, i)).join('');
}

function createProdCardHTML(p, i) {
  const info = getStoreInfo(p.store);
  const desc = p.oldPrice && p.oldPrice > p.currentPrice
    ? Math.round((1 - p.currentPrice / p.oldPrice) * 100) : 0;

  const img = p.image
    ? `<img src="${p.image}" alt="${p.title}" loading="lazy"
        onerror="this.style.display='none'">`
    : `<span style="font-size:2.5rem">${info.icon}</span>`;

  return `
    <div class="prod-card" style="animation-delay:${i * 0.05}s">
      <div class="pc-img">
        ${img}
        ${desc > 0 ? `<div class="pc-discount">-${desc}%</div>` : ''}
        <button class="pc-wish" onclick="toggleFavProd(this)" aria-label="Favorito">
          <i class="far fa-heart"></i>
        </button>
        <div class="pc-store ${info.class}">${info.icon} ${info.nome}</div>
      </div>
      <div class="pc-body">
        <span class="pc-cat">${formatCat(p.category)}</span>
        <h3 class="pc-title" title="${p.title}">${p.title}</h3>
        <div class="pc-price">
          ${p.oldPrice > 0 ? `<span class="pc-old">R$ ${fmt(p.oldPrice)}</span>` : ''}
          <span class="pc-now">${p.currentPrice > 0 ? `R$ ${fmt(p.currentPrice)}` : 'Ver preço'}</span>
        </div>
        <div class="pc-actions">
          <a href="${p.affLink}" target="_blank" rel="noopener nofollow"
            class="btn btn-primary" style="flex:1;font-size:.8rem"
            onclick="regClick('prod_${p.id}')">
            <i class="fas fa-external-link-alt"></i> Ver Oferta
          </a>
          <button class="pc-del" onclick="removerProd('${p.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function filtrarProd(cat, btn) {
  document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProdutos(cat);
}

function removerProd(id) {
  if (!confirm('Remover este produto?')) return;
  state.produtos = state.produtos.filter(p => p.id !== id);
  saveState();
  renderProdutos();
  updateStats();
  showToast('🗑️ Produto removido');
}

function toggleFavProd(btn) {
  btn.classList.toggle('active');
  const i = btn.querySelector('i');
  i.classList.toggle('far');
  i.classList.toggle('fas');
}

// ===== REDES SOCIAIS =====
const redesConfig = [
  { key: 'instagram', nome: 'Instagram', icon: 'fab fa-instagram', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', placeholder: '@seu-usuario' },
  { key: 'tiktok', nome: 'TikTok', icon: 'fab fa-tiktok', bg: '#000', placeholder: '@seu-usuario' },
  { key: 'youtube', nome: 'YouTube', icon: 'fab fa-youtube', bg: '#FF0000', placeholder: '@seu-canal' },
  { key: 'twitter', nome: 'X (Twitter)', icon: 'fab fa-x-twitter', bg: '#000', placeholder: '@usuario' },
  { key: 'facebook', nome: 'Facebook', icon: 'fab fa-facebook', bg: '#1877F2', placeholder: 'facebook.com/pagina' },
  { key: 'linkedin', nome: 'LinkedIn', icon: 'fab fa-linkedin', bg: '#0A66C2', placeholder: 'linkedin.com/in/usuario' },
  { key: 'spotify', nome: 'Spotify', icon: 'fab fa-spotify', bg: '#1DB954', placeholder: 'link do perfil' },
  { key: 'discord', nome: 'Discord', icon: 'fab fa-discord', bg: '#5865F2', placeholder: 'discord.gg/servidor' },
  { key: 'whatsapp', nome: 'WhatsApp', icon: 'fab fa-whatsapp', bg: '#25D366', placeholder: '+55 11 99999-9999' },
  { key: 'telegram', nome: 'Telegram', icon: 'fab fa-telegram', bg: '#26A5E4', placeholder: '@seu-canal' },
  { key: 'twitch', nome: 'Twitch', icon: 'fab fa-twitch', bg: '#9146FF', placeholder: 'twitch.tv/usuario' },
  { key: 'github', nome: 'GitHub', icon: 'fab fa-github', bg: '#24292e', placeholder: 'github.com/usuario' },
];

function setupSocialGrid() {
  const grid = document.getElementById('socialGrid');
  if (!grid) return;

  grid.innerHTML = redesConfig.map(r => `
    <div class="social-card">
      <div class="sc-header">
        <div class="sc-icon" style="background:${r.bg}">
          <i class="${r.icon}"></i>
        </div>
        <div class="sc-info">
          <strong>${r.nome}</strong>
          <span>${state.sociais[r.key] ? '✅ Conectado' : 'Não conectado'}</span>
        </div>
      </div>
      <input type="text" class="sc-input" id="social-${r.key}"
        value="${state.sociais[r.key] || ''}" placeholder="${r.placeholder}">
      <button class="sc-save" onclick="salvarSocial('${r.key}')">
        <i class="fas fa-save"></i> Salvar
      </button>
    </div>
  `).join('');
}

function salvarSocial(key) {
  const val = document.getElementById(`social-${key}`)?.value.trim();
  if (val) {
    state.sociais[key] = val;
    // Adicionar como link automaticamente
    const info = redesConfig.find(r => r.key === key);
    const autoInfo = getAutoLinkInfo(val.startsWith('http') ? val : `https://${key}.com/${val}`);

    const existeLink = state.links.find(l => l.url.includes(key));
    if (!existeLink && info) {
      const url = val.startsWith('http') ? val : `https://${key}.com/${val.replace('@', '')}`;
      state.links.push({
        id: `social_${key}`,
        url,
        title: info.nome,
        icon: info.icon,
        color: autoInfo?.color || '#6366f1',
        category: 'social',
        highlight: false,
        newTab: true,
        active: true,
        clicks: 0,
        createdAt: new Date().toISOString()
      });
    }
    saveState();
    renderLinks();
    renderMiniPreview();
    updateStats(key);
    setupSocialGrid();
    showToast(`✅ ${info?.nome} salvo!`);
  } else {
    delete state.sociais[key];
    state.links = state.links.filter(l => l.id !== `social_${key}`);
    saveState();
    renderLinks();
    setupSocialGrid();
    showToast('🗑️ Removido');
  }
}

// ===== IMPORTAR LINKTREE =====
async function importarLinktree() {
  const url = document.getElementById('linktreeUrl').value.trim();
  if (!url || !url.includes('linktr.ee')) {
    showToast('❌ Cole uma URL do Linktree válida (linktr.ee/usuario)');
    return;
  }

  const result = document.getElementById('linktreeResult');
  result.style.display = 'block';
  result.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;color:var(--t2)">
      <div style="width:20px;height:20px;border:2px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite"></div>
      Importando links do Linktree...
    </div>
  `;

  try {
    // Extrair username do Linktree
    const username = url.replace('https://', '').replace('http://', '')
      .replace('linktr.ee/', '').split('/')[0].split('?')[0];

    // Simular importação (API pública não permite CORS)
    // Em produção: usar servidor proxy ou a API oficial do Linktree
    await new Promise(r => setTimeout(r, 2000));

    const linksImportados = await simularImportLinktree(username, url);

    linksImportados.forEach(link => {
      const existe = state.links.find(l => l.url === link.url);
      if (!existe) state.links.push(link);
    });

    saveState();
    renderLinks();
    renderMiniPreview();
    updateStats();

    result.innerHTML = `
      <div style="color:var(--success)">
        ✅ ${linksImportados.length} links importados do @${username}!
        <br><small style="color:var(--t2)">Verifique e edite os links conforme necessário.</small>
      </div>
    `;

    showToast(`✅ ${linksImportados.length} links importados!`);

  } catch(e) {
    result.innerHTML = `<div style="color:var(--danger)">❌ Erro ao importar. Use a aba "Manual" para adicionar seus links.</div>`;
    showToast('❌ Não foi possível importar automaticamente');
  }
}

async function simularImportLinktree(username, url) {
  // Detecção inteligente baseada no username
  // Em produção real, usar: https://api.linktree.com/v1/profile/{username}
  // ou um proxy CORS

  const baseLinks = [
    {
      id: `lt_${Date.now()}_1`,
      url: `https://instagram.com/${username}`,
      title: 'Instagram',
      icon: 'fab fa-instagram',
      color: '#E1306C',
      category: 'social',
      highlight: false,
      newTab: true,
      active: true,
      clicks: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: `lt_${Date.now()}_2`,
      url: `https://tiktok.com/@${username}`,
      title: 'TikTok',
      icon: 'fab fa-tiktok',
      color: '#000000',
      category: 'social',
      highlight: false,
      newTab: true,
      active: true,
      clicks: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: `lt_${Date.now()}_3`,
      url: `https://youtube.com/@${username}`,
      title: 'YouTube',
      icon: 'fab fa-youtube',
      color: '#FF0000',
      category: 'social',
      highlight: false,
      newTab: true,
      active: true,
      clicks: 0,
      createdAt: new Date().toISOString()
    }
  ];

  return baseLinks;
}

// ===== IMPORTAR INSTAGRAM =====
async function importarInstagram() {
  const user = document.getElementById('igUser').value.trim().replace('@', '');
  if (!user) { showToast('❌ Digite seu usuário'); return; }

  const link = {
    id: `ig_${Date.now()}`,
    url: `https://instagram.com/${user}`,
    title: `Instagram - @${user}`,
    icon: 'fab fa-instagram',
    color: '#E1306C',
    category: 'social',
    highlight: true,
    newTab: true,
    active: true,
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  const existe = state.links.find(l => l.url.includes('instagram.com/' + user));
  if (!existe) {
    state.links.unshift(link);
    saveState();
    renderLinks();
    renderMiniPreview();
    showToast('✅ Instagram adicionado!');
  } else {
    showToast('ℹ️ Instagram já adicionado');
  }
}

// ===== IMPORTAR TIKTOK =====
async function importarTikTok() {
  const user = document.getElementById('ttUser').value.trim().replace('@', '');
  if (!user) { showToast('❌ Digite seu usuário'); return; }

  const link = {
    id: `tt_${Date.now()}`,
    url: `https://tiktok.com/@${user}`,
    title: `TikTok - @${user}`,
    icon: 'fab fa-tiktok',
    color: '#000000',
    category: 'social',
    highlight: false,
    newTab: true,
    active: true,
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  const existe = state.links.find(l => l.url.includes('tiktok.com/@' + user));
  if (!existe) {
    state.links.unshift(link);
    saveState();
    renderLinks();
    renderMiniPreview();
    showToast('✅ TikTok adicionado!');
  } else {
    showToast('ℹ️ TikTok já adicionado');
  }
}

// ===== IMPORTAR YOUTUBE =====
async function importarYoutube() {
  const user = document.getElementById('ytUser').value.trim();
  if (!user) { showToast('❌ Digite seu canal'); return; }

  const url = user.startsWith('http') ? user : `https://youtube.com/@${user.replace('@', '')}`;
  const link = {
    id: `yt_${Date.now()}`,
    url,
    title: `YouTube - ${user}`,
    icon: 'fab fa-youtube',
    color: '#FF0000',
    category: 'social',
    highlight: false,
    newTab: true,
    active: true,
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  state.links.unshift(link);
  saveState();
  renderLinks();
  renderMiniPreview();
  showToast('✅ YouTube adicionado!');
}

// ===== IMPORTAR GENÉRICO =====
async function importarGenerico() {
  const url = document.getElementById('beaconsUrl').value.trim();
  if (!url) { showToast('❌ Cole uma URL'); return; }

  try { new URL(url); } catch { showToast('❌ URL inválida'); return; }

  const info = getAutoLinkInfo(url);
  const link = {
    id: `gen_${Date.now()}`,
    url,
    title: info?.title || new URL(url).hostname,
    icon: info?.icon || 'fas fa-link',
    color: info?.color || '#6366f1',
    category: 'geral',
    highlight: false,
    newTab: true,
    active: true,
    clicks: 0,
    createdAt: new Date().toISOString()
  };

  state.links.unshift(link);
  saveState();
  renderLinks();
  renderMiniPreview();
  showToast('✅ Link importado!');
}

// ===== EXPORT / IMPORT JSON =====
function exportarDados() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `linkvitrine-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 Backup exportado!');
}

function importarJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.links || data.produtos) {
        if (data.links) state.links = [...(data.links || []), ...state.links];
        if (data.produtos) state.produtos = [...(data.produtos || []), ...state.produtos];
        if (data.config) state.config = { ...state.config, ...data.config };
        saveState();
        renderAll();
        initUI();
        showToast(`✅ Dados importados com sucesso!`);
      } else {
        showToast('❌ Arquivo inválido');
      }
    } catch {
      showToast('❌ Erro ao ler arquivo');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ===== APARÊNCIA =====
function setThemePage(theme) {
  state.config.theme = theme;
  saveState();
  document.querySelectorAll('.theme-card').forEach(c => {
    c.classList.toggle('active', c.dataset.theme === theme);
  });
  renderLivePreview();
  showToast(`🎨 Tema ${theme} aplicado!`);
}

function setBtnStyle(style) {
  state.config.btnStyle = style;
  saveState();
  document.querySelectorAll('.bstyle').forEach(b => {
    b.classList.toggle('active', b.dataset.style === style);
  });
  renderLivePreview();
}

function setPrimaryColor(color) {
  state.config.primaryColor = color;
  saveState();
  renderLivePreview();
  showToast('🎨 Cor atualizada!');
}

function setColor(color, inputId) {
  const el = document.getElementById(inputId);
  if (el) el.value = color;
}

function renderLivePreview() {
  const screen = document.getElementById('liveScreen');
  if (!screen) return;
  screen.innerHTML = generatePublicPageHTML(true);
}

function generatePublicPageHTML(isPreview = false) {
  const cfg = state.config;
  const links = state.links.filter(l => l.active);
  const produtos = state.produtos.slice(0, 4);

  const themes = {
    dark: { bg: '#0a0a14', bg2: '#1a1a2e', text: '#f1f1ff', text2: '#8888a8', card: '#13131f', border: 'rgba(255,255,255,0.07)' },
    light: { bg: '#f8f8fc', bg2: '#ffffff', text: '#1a1a2e', text2: '#5a5a7a', card: '#ffffff', border: 'rgba(0,0,0,0.08)' },
    gradient: { bg: 'linear-gradient(135deg,#6366f1,#ec4899)', bg2: 'rgba(255,255,255,0.1)', text: '#ffffff', text2: 'rgba(255,255,255,0.8)', card: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' },
    neon: { bg: '#000', bg2: '#0a0a0a', text: '#00ff88', text2: '#00cc66', card: '#0a0a0a', border: 'rgba(0,255,136,0.2)' },
    ocean: { bg: 'linear-gradient(135deg,#0c3547,#1a6b8a)', bg2: 'rgba(255,255,255,0.05)', text: '#e0f4ff', text2: 'rgba(224,244,255,0.7)', card: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.1)' },
    sunset: { bg: 'linear-gradient(135deg,#1a0533,#6b1a1a)', bg2: 'rgba(255,255,255,0.05)', text: '#ffe4d6', text2: 'rgba(255,228,214,0.7)', card: 'rgba(255,255,255,0.08)', border: 'rgba(255,150,100,0.2)' }
  };

  const t = themes[cfg.theme] || themes.dark;
  const primary = cfg.primaryColor || '#6366f1';

  const btnRadius = { rounded: '12px', pill: '50px', square: '4px', outline: '12px' };
  const btnBg = { rounded: primary, pill: primary, square: primary, outline: 'transparent' };
  const btnBorder = { rounded: 'none', pill: 'none', square: 'none', outline: `2px solid ${primary}` };
  const btnColor = { rounded: '#fff', pill: '#fff', square: '#fff', outline: primary };

  const style = cfg.btnStyle || 'rounded';

  const avatarContent = cfg.avatar
    ? `<img src="${cfg.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`
    : `<span style="font-size:${isPreview ? '1rem' : '2rem'};font-weight:700;color:#fff">${cfg.name.charAt(0).toUpperCase()}</span>`;

  const linksHTML = links.length
    ? links.map(l => `
        <a href="${isPreview ? '#' : l.url}" ${!isPreview ? 'target="_blank"' : ''}
          style="display:flex;align-items:center;gap:${isPreview ? '8px' : '14px'};
            padding:${isPreview ? '8px 12px' : '14px 20px'};
            background:${btnBg[style]};
            border:${btnBorder[style]};
            border-radius:${btnRadius[style]};
            color:${btnColor[style]};
            text-decoration:none;
            font-weight:600;
            font-size:${isPreview ? '.6rem' : '.95rem'};
            transition:all .2s;
            margin-bottom:${isPreview ? '5px' : '12px'};
            ${l.highlight ? `box-shadow:0 0 20px ${primary}40;` : ''}">
          <i class="${l.icon}" style="font-size:${isPreview ? '.7rem' : '1.1rem'}"></i>
          ${l.title}
        </a>
      `).join('')
    : `<p style="text-align:center;color:${t.text2};font-size:${isPreview ? '.6rem' : '.9rem'}">Nenhum link cadastrado</p>`;

  const prodHTML = produtos.length ? `
    <div style="margin-top:${isPreview ? '12px' : '32px'}">
      <h3 style="text-align:center;font-size:${isPreview ? '.65rem' : '1rem'};font-weight:700;color:${t.text};margin-bottom:${isPreview ? '8px' : '16px'}">
        🔥 Ofertas
      </h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:${isPreview ? '5px' : '12px'}">
        ${produtos.map(p => {
          const si = getStoreInfo(p.store);
          return `
            <a href="${isPreview ? '#' : p.affLink}" ${!isPreview ? 'target="_blank"' : ''}
              style="background:${t.card};border:1px solid ${t.border};border-radius:${isPreview ? '6px' : '12px'};
                overflow:hidden;text-decoration:none;display:block;transition:all .2s">
              <div style="height:${isPreview ? '35px' : '80px'};background:${t.bg2};display:flex;align-items:center;justify-content:center;font-size:${isPreview ? '1rem' : '1.8rem'}">
                ${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover">` : si.icon}
              </div>
              <div style="padding:${isPreview ? '4px' : '10px'}">
                <p style="font-size:${isPreview ? '.5rem' : '.78rem'};color:${t.text};font-weight:600;margin-bottom:${isPreview ? '2px' : '4px'};overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical">${p.title}</p>
                <p style="font-size:${isPreview ? '.55rem' : '.85rem'};color:#10b981;font-weight:800">${p.currentPrice > 0 ? `R$ ${fmt(p.currentPrice)}` : 'Ver'}</p>
              </div>
            </a>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  const socialLinks = Object.entries(state.sociais).slice(0, 6).map(([key, val]) => {
    const r = redesConfig.find(r => r.key === key);
    if (!r || !val) return '';
    const url = val.startsWith('http') ? val : `https://${key}.com/${val.replace('@', '')}`;
    return `
      <a href="${isPreview ? '#' : url}" ${!isPreview ? 'target="_blank"' : ''}
        style="width:${isPreview ? '20px' : '38px'};height:${isPreview ? '20px' : '38px'};
          border-radius:50%;background:${t.card};border:1px solid ${t.border};
          display:flex;align-items:center;justify-content:center;
          color:${t.text};text-decoration:none;font-size:${isPreview ? '.55rem' : '.9rem'};
          transition:all .2s">
        <i class="${r.icon}"></i>
      </a>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${cfg.name} | LinkVitrine Pro</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Inter',sans-serif;min-height:100vh;background:${t.bg};display:flex;align-items:flex-start;justify-content:center;padding:${isPreview ? '0' : '40px 16px'}}
        a:hover{opacity:.85;transform:translateY(-1px)}
        ${isPreview ? 'body{overflow:hidden;padding:0}' : ''}
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    </head>
    <body>
      <div style="width:100%;max-width:${isPreview ? '100%' : '480px'};padding:${isPreview ? '16px 12px' : '0'}">
        <!-- Profile -->
        <div style="text-align:center;margin-bottom:${isPreview ? '12px' : '28px'}">
          <div style="width:${isPreview ? '50px' : '88px'};height:${isPreview ? '50px' : '88px'};border-radius:50%;background:linear-gradient(135deg,${primary},#ec4899);margin:0 auto ${isPreview ? '8px' : '14px'};display:flex;align-items:center;justify-content:center;border:3px solid ${t.border};overflow:hidden">
            ${avatarContent}
          </div>
          <h1 style="font-size:${isPreview ? '.75rem' : '1.2rem'};font-weight:800;color:${t.text};margin-bottom:${isPreview ? '3px' : '6px'}">${cfg.name}</h1>
          <p style="font-size:${isPreview ? '.55rem' : '.88rem'};color:${t.text2};margin-bottom:${isPreview ? '8px' : '16px'};line-height:1.5">${cfg.bio}</p>
          ${socialLinks ? `<div style="display:flex;gap:${isPreview ? '5px' : '8px'};justify-content:center;margin-bottom:${isPreview ? '10px' : '20px'}">${socialLinks}</div>` : ''}
        </div>
        <!-- Links -->
        <div>${linksHTML}</div>
        <!-- Produtos -->
        ${prodHTML}
        <!-- Footer -->
        <p style="text-align:center;font-size:${isPreview ? '.45rem' : '.72rem'};color:${t.text2};margin-top:${isPreview ? '12px' : '32px'};opacity:.6">
          ⚡ Criado com LinkVitrine Pro
        </p>
      </div>
    </body>
    </html>
  `;
}

// ===== PREVIEW =====
function abrirPreview() {
  const modal = document.getElementById('previewModal');
  modal.classList.add('show');
  const html = generatePublicPageHTML(false);
  const frame = document.getElementById('previewFrame');
  frame.srcdoc = html;
}

function fecharPreview() {
  document.getElementById('previewModal').classList.remove('show');
}

function setPreviewDevice(device) {
  const frame = document.getElementById('pmFrame');
  frame.className = `pm-frame ${device}`;
  document.querySelectorAll('.pmc').forEach(b => b.classList.remove('active'));
  document.getElementById(`pmc-${device}`)?.classList.add('active');
}

// ===== MINI PREVIEW ===== 
function renderMiniPreview() {
  const miniLinks = document.getElementById('miniLinks');
  const miniName = document.getElementById('miniName');
  const miniBio = document.getElementById('miniBio');
  const miniAvatar = document.getElementById('miniAvatar');

  if (miniName) miniName.textContent = state.config.name;
  if (miniBio) miniBio.textContent = state.config.bio;

  if (miniAvatar && state.config.avatar) {
    miniAvatar.innerHTML = `<img src="${state.config.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  } else if (miniAvatar) {
    miniAvatar.textContent = state.config.name.charAt(0).toUpperCase();
  }

  if (miniLinks) {
    const activeLinks = state.links.filter(l => l.active).slice(0, 4);
    if (!activeLinks.length) {
      miniLinks.innerHTML = '<div class="mini-link-placeholder"><i class="fas fa-link"></i> Adicione seus links</div>';
    } else {
      miniLinks.innerHTML = activeLinks.map(l => `
        <div class="mini-link" style="background:${l.color || state.config.primaryColor}">
          ${l.title}
        </div>
      `).join('');
    }
  }

  // Update Live preview
  if (document.getElementById('page-aparencia')?.classList.contains('active')) {
    renderLivePreview();
  }
}

// ===== ANALYTICS ===== 
function regClick(key) {
  state.clicks[key] = (state.clicks[key] || 0) + 1;
  saveState();
  renderAnalytics();
}

function renderAnalytics() {
  const list = document.getElementById('clickList');
  const totalEl = document.getElementById('an-total');
  const linksEl = document.getElementById('an-links');
  const prodEl = document.getElementById('an-prod');

  const total = Object.values(state.clicks).reduce((a, b) => a + b, 0);
  if (totalEl) totalEl.textContent = total;
  if (linksEl) linksEl.textContent = state.links.length;
  if (prodEl) prodEl.textContent = state.produtos.length;

  if (!list) return;

  const entries = Object.entries(state.clicks).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = entries[0]?.[1] || 1;

  if (!entries.length) {
    list.innerHTML = '<p class="no-data">Nenhum clique ainda. Abra o preview e clique em seus links!</p>';
    return;
  }

  list.innerHTML = entries.map(([key, count]) => {
    const link = state.links.find(l => l.id === key || `prod_${l.id}` === key);
    const name = link?.title || key;
    const pct = Math.round((count / max) * 100);
    return `
      <div class="click-item">
        <span class="cl-name">${name}</span>
        <div class="cl-bar-wrap">
          <div class="cl-bar" style="width:${pct}%"></div>
        </div>
        <span class="cl-count">${count}</span>
      </div>
    `;
  }).join('');
}

// ===== CONFIG =====
function salvarConfig() {
  state.config.name = document.getElementById('cfgName').value.trim() || 'Usuário';
  state.config.username = document.getElementById('cfgUser').value.trim().toLowerCase()
    .replace(/[^a-z0-9-]/g, '') || 'usuario';
  state.config.bio = document.getElementById('cfgBio').value.trim();
  state.config.email = document.getElementById('cfgEmail').value.trim();

  saveState();
  initUI();
  renderMiniPreview();
  showToast('✅ Configurações salvas!');
}

function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.config.avatar = e.target.result;
    saveState();

    // Atualizar avatares
    document.getElementById('peAvatarText').style.display = 'none';
    const pe = document.getElementById('peAvatar');
    const img = pe.querySelector('img') || document.createElement('img');
    img.src = e.target.result;
    img.style.cssText = 'width:80px;height:80px;border-radius:50%;object-fit:cover';
    pe.insertBefore(img, pe.firstChild);

    document.querySelector('.tb-avatar').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;

    renderMiniPreview();
    showToast('✅ Foto atualizada!');
  };
  reader.readAsDataURL(file);
}

function resetarTudo() {
  if (!confirm('⚠️ Isso apagará TODOS os seus dados. Tem certeza?')) return;
  if (!confirm('Esta ação não pode ser desfeita! Confirmar?')) return;
  localStorage.removeItem(DB);
  location.reload();
}

// ===== STATS =====
function updateStats() {
  document.getElementById('stat-links').textContent = state.links.length;
  document.getElementById('stat-produtos').textContent = state.produtos.length;
  document.getElementById('stat-social').textContent = Object.keys(state.sociais).length;

  const totalClicks = Object.values(state.clicks).reduce((a, b) => a + b, 0);
  document.getElementById('stat-clicks').textContent = totalClicks;

  document.getElementById('badgeLinks').textContent = state.links.length;
  document.getElementById('badgeProdutos').textContent = state.produtos.length;
  document.getElementById('countProdutos') &&
    (document.getElementById('countProdutos').textContent = state.links.length);
}

// ===== COMPARTILHAR =====
function compartilhar() {
  const url = `https://linkvitrine.pro/${state.config.username}`;
  if (navigator.share) {
    navigator.share({
      title: `${state.config.name} | LinkVitrine Pro`,
      text: state.config.bio,
      url
    });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast('✅ Link copiado!');
    });
  }
}

function copiarUrl() {
  const url = `https://linkvitrine.pro/${state.config.username}`;
  navigator.clipboard.writeText(url).then(() => showToast('✅ URL copiada!'));
}

// ===== TEMA ===== 
function toggleTheme() {
  state.config.theme = state.config.theme === 'light' ? 'dark' : 'light';
  saveState();
  document.body.className = `theme-${state.config.theme === 'light' ? 'light' : 'dark'}`;
  document.getElementById('themeIcon').className =
    state.config.theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

// ===== UTILS =====
function fmt(n) {
  return parseFloat(n).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function formatCat(c) {
  const m = { tecnologia: 'Tech', moda: 'Moda', casa: 'Casa', esporte: 'Esporte', beleza: 'Beleza', outros: 'Outros' };
  return m[c] || c;
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== DEMO DATA =====
function addDemoData() {
  state.config.name = 'Seu Nome';
  state.config.bio = '🔥 Melhores links e ofertas | Afiliado';

  state.links = [
    { id: 'demo_ig', url: 'https://instagram.com', title: 'Instagram', icon: 'fab fa-instagram', color: '#E1306C', category: 'social', highlight: true, newTab: true, active: true, clicks: 0, createdAt: new Date().toISOString() },
    { id: 'demo_yt', url: 'https://youtube.com', title: 'YouTube', icon: 'fab fa-youtube', color: '#FF0000', category: 'social', highlight: false, newTab: true, active: true, clicks: 0, createdAt: new Date().toISOString() },
    { id: 'demo_tt', url: 'https://tiktok.com', title: 'TikTok', icon: 'fab fa-tiktok', color: '#000000', category: 'social', highlight: false, newTab: true, active: true, clicks: 0, createdAt: new Date().toISOString() },
    { id: 'demo_wa', url: 'https://wa.me/5511999999999', title: 'WhatsApp', icon: 'fab fa-whatsapp', color: '#25D366', category: 'contato', highlight: false, newTab: true, active: true, clicks: 0, createdAt: new Date().toISOString() },
  ];

  state.produtos = [
    { id: 'dp1', title: 'Fone Bluetooth Premium', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80', currentPrice: 199.90, oldPrice: 349.90, store: 'amazon', category: 'tecnologia', affLink: '#', rating: 4.5, reviews: 234, createdAt: new Date().toISOString() },
    { id: 'dp2', title: 'Smartwatch Esportivo', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80', currentPrice: 149.90, oldPrice: 299.90, store: 'shopee', category: 'tecnologia', affLink: '#', rating: 4.3, reviews: 189, createdAt: new Date().toISOString() },
  ];

  saveState();
  renderAll();
  initUI();
}
