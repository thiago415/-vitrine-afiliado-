/* ===================================================
   VITRINE PRO - Sistema Completo de Afiliados
   Detecta Amazon, Shopee, Mercado Livre e outros
=================================================== */

// ===== STORAGE & STATE =====
const DB_KEY = 'vitrinepro_products';
let produtos = JSON.parse(localStorage.getItem(DB_KEY)) || [];
let filtroAtual = 'todos';
let produtosExibidos = 0;
const POR_PAGINA = 9;

function salvarDB() {
    localStorage.setItem(DB_KEY, JSON.stringify(produtos));
}

// ===== DETECTAR LOJA PELO LINK =====
function detectarLoja(url) {
    if (!url) return 'outros';
    const u = url.toLowerCase();
    if (u.includes('amazon.com') || u.includes('amzn.to') || u.includes('amzn.com')) return 'amazon';
    if (u.includes('shopee.com') || u.includes('s.shopee.com')) return 'shopee';
    if (u.includes('mercadolivre') || u.includes('mercadolibre') || u.includes('ml.com') || u.includes('meli.com')) return 'mercadolivre';
    if (u.includes('americanas.com')) return 'americanas';
    if (u.includes('magalu.com') || u.includes('magazineluiza.com')) return 'magalu';
    if (u.includes('aliexpress.com')) return 'aliexpress';
    return 'outros';
}

function getLojaInfo(loja) {
    const lojas = {
        amazon: { nome: 'Amazon', icon: '📦', cor: '#FF9900', class: 'store-amazon' },
        shopee: { nome: 'Shopee', icon: '🛍️', cor: '#EE4D2D', class: 'store-shopee' },
        mercadolivre: { nome: 'Mercado Livre', icon: '🛒', cor: '#FFD700', class: 'store-mercadolivre' },
        americanas: { nome: 'Americanas', icon: '🏬', cor: '#e60014', class: 'store-outros' },
        magalu: { nome: 'Magazine Luiza', icon: '🛍️', cor: '#0086ff', class: 'store-outros' },
        aliexpress: { nome: 'AliExpress', icon: '📦', cor: '#ff6600', class: 'store-outros' },
        outros: { nome: 'Loja', icon: '🏪', cor: '#6b6b80', class: 'store-outros' }
    };
    return lojas[loja] || lojas.outros;
}

// ===== DETECTAR LINK (Simulação + APIs públicas) =====
async function detectarLink() {
    const url = document.getElementById('linkInput').value.trim();
    if (!url) {
        showToast('❌ Cole um link de produto primeiro');
        return;
    }

    // Validar URL
    try { new URL(url); }
    catch { showToast('❌ URL inválida'); return; }

    const loja = detectarLoja(url);
    const lojaInfo = getLojaInfo(loja);

    // Atualizar ícone
    document.getElementById('linkIcon').textContent = lojaInfo.icon;

    // Mostrar preview com loading
    const preview = document.getElementById('linkPreview');
    const loading = document.getElementById('previewLoading');
    const result = document.getElementById('previewResult');

    preview.style.display = 'block';
    loading.style.display = 'flex';
    result.style.display = 'none';

    try {
        // Tentar buscar dados via Link Preview API (pública)
        const dados = await buscarDadosProduto(url, loja);
        mostrarPreview(dados, url, loja, lojaInfo);
    } catch (err) {
        // Se falhar, usar dados padrão para edição manual
        mostrarPreviewVazio(url, loja, lojaInfo);
    }
}

async function buscarDadosProduto(url, loja) {
    // Usar APIs públicas de Link Preview
    const apis = [
        `https://api.linkpreview.net/?key=free&q=${encodeURIComponent(url)}`,
        `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`
    ];

    // Simular dados com base no tipo de loja (fallback inteligente)
    // Em produção, usar sua própria API ou servidor proxy
    const dados = await simularBuscaProduto(url, loja);
    return dados;
}

function simularBuscaProduto(url, loja) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Extrair dados básicos da URL
            const lojaInfo = getLojaInfo(loja);
            let titulo = 'Produto Encontrado';
            let imagem = '';

            // Tentar extrair nome do produto da URL
            try {
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/').filter(Boolean);

                if (loja === 'amazon') {
                    // Amazon: /dp/ASIN ou /gp/product/ASIN
                    const dpIndex = pathParts.indexOf('dp');
                    if (dpIndex >= 0 && pathParts[dpIndex - 1]) {
                        titulo = decodeURIComponent(pathParts[dpIndex - 1]).replace(/-/g, ' ');
                    }
                } else if (loja === 'mercadolivre') {
                    // ML: /nome-do-produto-MLB-...
                    const lastPart = pathParts[pathParts.length - 1];
                    if (lastPart) {
                        titulo = lastPart.replace(/-/g, ' ').replace(/\d+/g, '').trim();
                    }
                } else if (loja === 'shopee') {
                    // Shopee: /produto-nome-i.123.456
                    const lastPart = pathParts[pathParts.length - 1];
                    if (lastPart) {
                        titulo = lastPart.replace(/-i\.\d+\.\d+/g, '').replace(/-/g, ' ').trim();
                    }
                }

                // Capitalizar
                titulo = titulo.split(' ')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')
                    .substring(0, 80);

                if (!titulo || titulo.length < 3) {
                    titulo = `Produto - ${lojaInfo.nome}`;
                }

            } catch (e) {
                titulo = `Produto - ${lojaInfo.nome}`;
            }

            resolve({
                title: titulo,
                image: '',
                price: 0,
                oldPrice: 0,
                store: loja
            });
        }, 1500); // Simular delay de rede
    });
}

function mostrarPreview(dados, url, loja, lojaInfo) {
    const loading = document.getElementById('previewLoading');
    const result = document.getElementById('previewResult');

    loading.style.display = 'none';
    result.style.display = 'grid';

    // Imagem
    const img = document.getElementById('prevImg');
    if (dados.image) {
        img.src = dados.image;
        img.style.display = 'block';
    } else {
        img.src = '';
        img.style.display = 'none';
        img.parentElement.innerHTML = `<div style="font-size:4rem;text-align:center;padding:30px">${lojaInfo.icon}</div>`;
    }

    // Store badge
    document.getElementById('prevStore').innerHTML = `
        <span class="store-badge ${lojaInfo.class.replace('store-', '')} ${lojaInfo.class}">
            ${lojaInfo.icon} ${lojaInfo.nome}
        </span>
    `;

    // Título
    document.getElementById('prevTitle').textContent = dados.title || 'Produto da ' + lojaInfo.nome;

    // Preços (preencher se disponível)
    if (dados.price) {
        document.getElementById('prevCurrent').textContent = formatPrice(dados.price);
        document.getElementById('editCurrentPrice').value = dados.price;
    }
    if (dados.oldPrice) {
        document.getElementById('prevOld').textContent = formatPrice(dados.oldPrice);
        document.getElementById('editOldPrice').value = dados.oldPrice;
    }

    // Desconto
    if (dados.price && dados.oldPrice && dados.oldPrice > dados.price) {
        const desc = Math.round((1 - dados.price / dados.oldPrice) * 100);
        document.getElementById('prevDiscount').textContent = `-${desc}%`;
    }

    // Preencher link de afiliado
    document.getElementById('editAffLink').value = url;

    // Guardar dados no form
    document.getElementById('prevTitle').dataset.url = url;
    document.getElementById('prevTitle').dataset.store = loja;
    document.getElementById('prevTitle').dataset.img = dados.image || '';
}

function mostrarPreviewVazio(url, loja, lojaInfo) {
    mostrarPreview({ title: `Produto - ${lojaInfo.nome}`, image: '', price: 0, oldPrice: 0 }, url, loja, lojaInfo);
}

function cancelarPreview() {
    document.getElementById('linkPreview').style.display = 'none';
    document.getElementById('linkInput').value = '';
    document.getElementById('linkIcon').textContent = '🔗';
}

// ===== ADICIONAR PRODUTO (via link) =====
function adicionarProduto() {
    const titleEl = document.getElementById('prevTitle');
    const titulo = titleEl.textContent;
    const url = titleEl.dataset.url;
    const loja = titleEl.dataset.store;
    const imgUrl = titleEl.dataset.img;

    const currentPrice = parseFloat(document.getElementById('editCurrentPrice').value) || 0;
    const oldPrice = parseFloat(document.getElementById('editOldPrice').value) || 0;
    const category = document.getElementById('editCategory').value;
    const affLink = document.getElementById('editAffLink').value || url;
    const imgInput = document.getElementById('editCurrentPrice').closest('.prev-fields')
        ? document.querySelector('#previewResult img')?.src : '';

    if (!titulo || !affLink) {
        showToast('❌ Preencha os campos obrigatórios');
        return;
    }

    const produto = {
        id: Date.now().toString(),
        title: titulo,
        image: imgUrl || '',
        currentPrice,
        oldPrice,
        category,
        store: loja,
        affLink,
        rating: 4.5,
        reviews: Math.floor(Math.random() * 500) + 50,
        hot: false,
        isNew: true,
        createdAt: new Date().toISOString()
    };

    produtos.unshift(produto);
    salvarDB();
    renderProdutos();
    atualizarContadores();
    atualizarTabela();
    cancelarPreview();
    showToast('✅ Produto adicionado com sucesso!');
}

// ===== ADICIONAR MANUAL =====
function adicionarManual() {
    const titulo = document.getElementById('mTitle').value.trim();
    const affLink = document.getElementById('mAffLink').value.trim();

    if (!titulo || !affLink) {
        showToast('❌ Nome e link são obrigatórios');
        return;
    }

    const produto = {
        id: Date.now().toString(),
        title: titulo,
        image: document.getElementById('mImage').value.trim(),
        currentPrice: parseFloat(document.getElementById('mCurrentPrice').value) || 0,
        oldPrice: parseFloat(document.getElementById('mOldPrice').value) || 0,
        category: document.getElementById('mCategory').value,
        store: document.getElementById('mStore').value,
        affLink,
        rating: parseFloat(document.getElementById('mRating').value) || 4.5,
        reviews: parseInt(document.getElementById('mReviews').value) || 0,
        hot: document.getElementById('mHot').checked,
        isNew: document.getElementById('mNew').checked,
        createdAt: new Date().toISOString()
    };

    produtos.unshift(produto);
    salvarDB();
    renderProdutos();
    atualizarContadores();
    atualizarTabela();

    // Limpar form
    ['mTitle', 'mImage', 'mCurrentPrice', 'mOldPrice', 'mAffLink', 'mRating', 'mReviews'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('mHot').checked = false;
    document.getElementById('mNew').checked = false;
    document.getElementById('manualImgPreview').innerHTML = '';

    showToast('✅ Produto adicionado!');
    document.getElementById('produtosGrid').scrollIntoView({ behavior: 'smooth' });
}

// ===== ADICIONAR EM MASSA =====
async function adicionarEmMassa() {
    const textarea = document.getElementById('bulkLinks');
    const links = textarea.value.trim().split('\n').filter(l => l.trim());

    if (!links.length) {
        showToast('❌ Cole pelo menos um link');
        return;
    }

    const progress = document.getElementById('bulkProgress');
    let adicionados = 0;

    for (let i = 0; i < links.length; i++) {
        const url = links[i].trim();
        if (!url) continue;

        progress.textContent = `Processando ${i + 1}/${links.length}...`;

        try {
            new URL(url); // Validar
            const loja = detectarLoja(url);
            const dados = await simularBuscaProduto(url, loja);
            const lojaInfo = getLojaInfo(loja);

            const produto = {
                id: Date.now().toString() + i,
                title: dados.title || `Produto ${i + 1}`,
                image: dados.image || '',
                currentPrice: dados.price || 0,
                oldPrice: dados.oldPrice || 0,
                category: 'outros',
                store: loja,
                affLink: url,
                rating: 4.5,
                reviews: Math.floor(Math.random() * 300) + 20,
                hot: false,
                isNew: true,
                createdAt: new Date().toISOString()
            };

            produtos.unshift(produto);
            adicionados++;

        } catch (e) {
            console.warn(`Link inválido: ${url}`);
        }
    }

    salvarDB();
    renderProdutos();
    atualizarContadores();
    atualizarTabela();
    textarea.value = '';
    progress.textContent = '';

    showToast(`✅ ${adicionados} produto(s) adicionado(s)!`);
}

// ===== RENDERIZAR PRODUTOS =====
function renderProdutos(reset = true) {
    const grid = document.getElementById('produtosGrid');
    const emptyState = document.getElementById('emptyState');
    const loadMore = document.getElementById('loadMoreWrap');

    const filtrados = filtroAtual === 'todos'
        ? produtos
        : produtos.filter(p => p.category === filtroAtual);

    // Busca
    const search = document.getElementById('searchInput').value.toLowerCase();
    const resultado = search
        ? filtrados.filter(p => p.title.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search))
        : filtrados;

    // Ordenação
    const sort = document.getElementById('sortSelect').value;
    resultado.sort((a, b) => {
        if (sort === 'menor-preco') return (a.currentPrice || 0) - (b.currentPrice || 0);
        if (sort === 'maior-desconto') {
            const dA = a.oldPrice ? (1 - a.currentPrice / a.oldPrice) : 0;
            const dB = b.oldPrice ? (1 - b.currentPrice / b.oldPrice) : 0;
            return dB - dA;
        }
        if (sort === 'avaliacao') return (b.rating || 0) - (a.rating || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (reset) {
        produtosExibidos = POR_PAGINA;
        grid.innerHTML = '';
    }

    const slice = resultado.slice(0, produtosExibidos);

    if (resultado.length === 0) {
        emptyState.classList.add('show');
        loadMore.style.display = 'none';
        grid.innerHTML = '';
        return;
    }

    emptyState.classList.remove('show');
    grid.innerHTML = '';

    slice.forEach((p, i) => {
        grid.insertAdjacentHTML('beforeend', criarCardHTML(p, i));
    });

    // Load more
    if (resultado.length > produtosExibidos) {
        loadMore.style.display = 'block';
    } else {
        loadMore.style.display = 'none';
    }

    // Contador vitrine
    document.getElementById('countProdutos').textContent = produtos.length;
}

function criarCardHTML(p, index) {
    const lojaInfo = getLojaInfo(p.store);
    const desconto = p.oldPrice && p.oldPrice > p.currentPrice
        ? Math.round((1 - p.currentPrice / p.oldPrice) * 100)
        : 0;

    const badges = `
        ${desconto > 0 ? `<span class="cbadge cbadge-disc">-${desconto}%</span>` : ''}
        ${p.hot ? `<span class="cbadge cbadge-hot">🔥 HOT</span>` : ''}
        ${p.isNew ? `<span class="cbadge cbadge-new">✨ NOVO</span>` : ''}
    `;

    const stars = renderStars(p.rating || 4.5);

    const imgContent = p.image
        ? `<img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=font-size:2.5rem;text-align:center;padding:40px>${lojaInfo.icon}</div>'">`
        : `<div style="font-size:3rem;text-align:center;padding:50px">${lojaInfo.icon}</div>`;

    return `
        <div class="produto-card" data-id="${p.id}" data-category="${p.category}" style="animation-delay:${index * 0.05}s">
            <div class="card-badges">${badges}</div>
            <button class="card-wish" onclick="toggleFav('${p.id}',this)" aria-label="Favorito">
                <i class="far fa-heart"></i>
            </button>
            <div class="card-img">
                ${imgContent}
                <div class="card-store-tag ${lojaInfo.class}">${lojaInfo.icon} ${lojaInfo.nome}</div>
            </div>
            <div class="card-body">
                <span class="card-cat">${formatCat(p.category)}</span>
                <h3 class="card-title" title="${p.title}">${p.title}</h3>
                <div class="card-rating">
                    <div class="card-stars">${stars}</div>
                    <span>(${p.rating || 4.5}) ${p.reviews || 0} avaliações</span>
                </div>
                <div class="card-price">
                    ${p.oldPrice > 0 ? `<span class="price-old">R$ ${formatNumber(p.oldPrice)}</span>` : ''}
                    <span class="price-now">${p.currentPrice > 0 ? `R$ ${formatNumber(p.currentPrice)}` : 'Ver preço'}</span>
                </div>
                ${p.currentPrice > 0 ? `
                <div class="card-install">
                    <i class="far fa-credit-card"></i>
                    em até 12x de R$ ${formatNumber(p.currentPrice / 12)}
                </div>` : ''}
                <a href="${p.affLink}" target="_blank" rel="noopener noreferrer nofollow"
                   class="btn btn-primary btn-block" onclick="registrarClique('${p.id}')">
                    <i class="fas fa-external-link-alt"></i> Ver Oferta na ${lojaInfo.nome}
                </a>
            </div>
        </div>
    `;
}

function renderStars(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) html += '<i class="fas fa-star"></i>';
        else if (rating >= i - 0.5) html += '<i class="fas fa-star-half-alt"></i>';
        else html += '<i class="far fa-star"></i>';
    }
    return html;
}

// ===== LOAD MORE =====
function loadMore() {
    produtosExibidos += POR_PAGINA;
    renderProdutos(false);
}

// ===== FILTRO =====
function filtrar(cat) {
    filtroAtual = cat;
    document.querySelectorAll('.cat-card').forEach(c => {
        c.classList.toggle('active', c.dataset.cat === cat);
    });
    renderProdutos();
    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
}

// ===== SORT =====
function sortProdutos() {
    renderProdutos();
}

// ===== CONTADORES =====
function atualizarContadores() {
    const cats = ['tecnologia', 'moda', 'casa', 'esporte', 'beleza', 'livros', 'outros'];
    const el = document.getElementById('count-todos');
    if (el) el.textContent = produtos.length;

    cats.forEach(cat => {
        const count = produtos.filter(p => p.category === cat).length;
        const el = document.getElementById(`count-${cat}`);
        if (el) el.textContent = count;
    });

    // Hero counter
    const heroCount = document.getElementById('countProdutos');
    if (heroCount) heroCount.textContent = produtos.length;
}

// ===== TABELA ADMIN =====
function atualizarTabela() {
    const tbody = document.getElementById('adminTableBody');
    const empty = document.getElementById('adminEmpty');

    if (!produtos.length) {
        tbody.innerHTML = '';
        empty.classList.add('show');
        return;
    }

    empty.classList.remove('show');

    tbody.innerHTML = produtos.map(p => {
        const lojaInfo = getLojaInfo(p.store);
        const imgEl = p.image
            ? `<img src="${p.image}" alt="" onerror="this.style.display='none'">`
            : lojaInfo.icon;

        return `
            <tr>
                <td>
                    <div class="at-product">
                        <div class="at-img">${p.image ? `<img src="${p.image}" alt="">` : lojaInfo.icon}</div>
                        <span class="at-name" title="${p.title}">${p.title}</span>
                    </div>
                </td>
                <td class="at-price">
                    ${p.currentPrice > 0 ? `R$ ${formatNumber(p.currentPrice)}` : '–'}
                </td>
                <td>${lojaInfo.icon} ${lojaInfo.nome}</td>
                <td>${formatCat(p.category)}</td>
                <td>
                    <div class="at-actions">
                        <button class="at-edit" onclick="abrirEdicao('${p.id}')" title="Editar">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="at-del" onclick="removerProduto('${p.id}')" title="Remover">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== EDIÇÃO =====
function abrirEdicao(id) {
    const p = produtos.find(x => x.id === id);
    if (!p) return;

    document.getElementById('editId').value = id;
    document.getElementById('editTitle').value = p.title;
    document.getElementById('editImageUrl').value = p.image || '';
    document.getElementById('editOldPriceM').value = p.oldPrice || '';
    document.getElementById('editCurrentPriceM').value = p.currentPrice || '';
    document.getElementById('editCategoryM').value = p.category;
    document.getElementById('editStoreM').value = p.store;
    document.getElementById('editAffLinkM').value = p.affLink;

    document.getElementById('modalOverlay').classList.add('show');
}

function fecharModal() {
    document.getElementById('modalOverlay').classList.remove('show');
}

function salvarEdicao() {
    const id = document.getElementById('editId').value;
    const idx = produtos.findIndex(p => p.id === id);
    if (idx < 0) return;

    produtos[idx] = {
        ...produtos[idx],
        title: document.getElementById('editTitle').value,
        image: document.getElementById('editImageUrl').value,
        oldPrice: parseFloat(document.getElementById('editOldPriceM').value) || 0,
        currentPrice: parseFloat(document.getElementById('editCurrentPriceM').value) || 0,
        category: document.getElementById('editCategoryM').value,
        store: document.getElementById('editStoreM').value,
        affLink: document.getElementById('editAffLinkM').value
    };

    salvarDB();
    renderProdutos();
    atualizarContadores();
    atualizarTabela();
    fecharModal();
    showToast('✅ Produto atualizado!');
}

function removerProduto(id) {
    if (!confirm('Remover este produto?')) return;
    produtos = produtos.filter(p => p.id !== id);
    salvarDB();
    renderProdutos();
    atualizarContadores();
    atualizarTabela();
    showToast('🗑️ Produto removido');
}

// ===== FAVORITO =====
function toggleFav(id, btn) {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.classList.replace('far', 'fas');
        showToast('❤️ Adicionado aos favoritos!');
    } else {
        icon.classList.replace('fas', 'far');
        showToast('💔 Removido dos favoritos');
    }
}

// ===== REGISTRAR CLIQUE (Analytics básico) =====
function registrarClique(id) {
    const clicks = JSON.parse(localStorage.getItem('vitrinepro_clicks') || '{}');
    clicks[id] = (clicks[id] || 0) + 1;
    localStorage.setItem('vitrinepro_clicks', JSON.stringify(clicks));
}

// ===== EXPORTAR / IMPORTAR =====
function exportarJSON() {
    const data = JSON.stringify(produtos, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitrinepro-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 Exportado com sucesso!');
}

function importarJSON() {
    document.getElementById('importFile').click();
}

function processarImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importados = JSON.parse(e.target.result);
            if (Array.isArray(importados)) {
                produtos = [...importados, ...produtos];
                salvarDB();
                renderProdutos();
                atualizarContadores();
                atualizarTabela();
                showToast(`✅ ${importados.length} produtos importados!`);
            } else {
                showToast('❌ Arquivo inválido');
            }
        } catch {
            showToast('❌ Erro ao importar arquivo');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function limparTudo() {
    if (!confirm('Tem certeza? Todos os produtos serão removidos!')) return;
    produtos = [];
    salvarDB();
    renderProdutos();
    atualizarContadores();
    atualizarTabela();
    showToast('🗑️ Tudo limpo!');
}

// ===== LINKS DE EXEMPLO =====
function setExampleLink(tipo) {
    const links = {
        amazon: 'https://www.amazon.com.br/dp/B08L5V2HHK',
        shopee: 'https://shopee.com.br/produto-exemplo-i.123456.789',
        ml: 'https://produto.mercadolivre.com.br/MLB-fone-de-ouvido-bluetooth'
    };
    document.getElementById('linkInput').value = links[tipo] || '';
    detectarLink();
}

// ===== PREVIEW IMAGEM MANUAL =====
function previewManualImg(url) {
    const container = document.getElementById('manualImgPreview');
    if (url && url.startsWith('http')) {
        container.innerHTML = `<img src="${url}" alt="preview" onerror="this.parentElement.innerHTML=''">`;
    } else {
        container.innerHTML = '';
    }
}

// ===== UTILS =====
function formatPrice(n) {
    return `R$ ${formatNumber(n)}`;
}

function formatNumber(n) {
    return parseFloat(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCat(cat) {
    const cats = {
        tecnologia: 'Tecnologia', moda: 'Moda', casa: 'Casa & Deco',
        esporte: 'Esportes', beleza: 'Beleza', livros: 'Livros', outros: 'Outros'
    };
    return cats[cat] || cat;
}

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== NAVBAR =====
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    const btt = document.getElementById('btt');

    if (window.scrollY > 60) {
        nav.classList.add('scrolled');
        btt.classList.add('show');
    } else {
        nav.classList.remove('scrolled');
        btt.classList.remove('show');
    }
});

// Mobile menu
document.getElementById('menuBtn').addEventListener('click', () => {
    const links = document.getElementById('navLinks');
    links.classList.toggle('open');
});

// Fechar menu ao clicar em link
document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('open');
    });
});

// ===== SEARCH =====
document.getElementById('searchInput').addEventListener('input', () => {
    renderProdutos();
});

// ===== TABS =====
document.querySelectorAll('.add-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.add-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
});

// ===== MODAL FECHAR ====
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) fecharModal();
});

// ESC para fechar modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModal();
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    renderProdutos();
    atualizarContadores();
    atualizarTabela();

    // Adicionar produtos demo se vazio
    if (!produtos.length) {
        adicionarDemo();
    }
});

// ===== PRODUTOS DEMO =====
function adicionarDemo() {
    const demos = [
        {
            id: 'demo1',
            title: 'Fone Bluetooth JBL Tune 520BT',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
            currentPrice: 199.90, oldPrice: 349.90,
            category: 'tecnologia', store: 'amazon',
            affLink: 'https://amzn.to/exemplo',
            rating: 4.5, reviews: 234, hot: true, isNew: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo2',
            title: 'Tênis Nike Air Max Plus',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
            currentPrice: 299.90, oldPrice: 599.90,
            category: 'moda', store: 'shopee',
            affLink: 'https://shopee.com.br/exemplo',
            rating: 4.8, reviews: 512, hot: true, isNew: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo3',
            title: 'Smartwatch Xiaomi Mi Band 8',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
            currentPrice: 149.90, oldPrice: 249.90,
            category: 'tecnologia', store: 'mercadolivre',
            affLink: 'https://mercadolivre.com.br/exemplo',
            rating: 4.3, reviews: 189, hot: false, isNew: true,
            createdAt: new Date().toISOString()
        }
    ];

    produtos = demos;
    salvarDB();
    renderProdutos();
    atualizarContadores();
    atualizarTabela();
}
