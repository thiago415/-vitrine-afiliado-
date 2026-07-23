/* =============================================
   LINKVITRINE PRO
============================================= */

// ===== DADOS =====
let dados = {
    links: [],
    produtos: [],
    config: {
        nome: 'Usuário',
        usuario: 'usuario',
        bio: '🔥 Meus melhores links aqui!',
        avatar: '',
        tema: 'dark',
        estilo: 'rounded',
        cor: '#6366f1'
    },
    cliques: {}
};

const CHAVE = 'linkvitrine_dados';

function carregarDados() {
    try {
        const s = localStorage.getItem(CHAVE);
        if (s) dados = { ...dados, ...JSON.parse(s) };
    } catch(e) {}
}

function salvarDados() {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
}

// ===== INICIAR =====
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    iniciarUI();
    renderizarTudo();

    if (!dados.links.length && !dados.produtos.length) {
        addDadosDemo();
    }
});

function iniciarUI() {
    const cfg = dados.config;
    document.getElementById('nomeUsuario').textContent = cfg.nome;
    document.getElementById('urlPublica').textContent = `linkvitrine.pro/${cfg.usuario}`;
    document.getElementById('cfgNome').value = cfg.nome;
    document.getElementById('cfgUsuario').value = cfg.usuario;
    document.getElementById('cfgBio').value = cfg.bio;

    // Avatar
    if (cfg.avatar) {
        atualizarAvatar(cfg.avatar);
    } else {
        document.getElementById('avatarLetra').textContent = cfg.nome.charAt(0).toUpperCase();
    }

    // Tema ativo
    document.querySelectorAll('.tema-card').forEach(t => {
        t.classList.toggle('active', t.dataset.tema === cfg.tema);
    });

    // Estilo ativo
    document.querySelectorAll('.estilo-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.estilo === cfg.estilo);
    });
}

function renderizarTudo() {
    renderLinks();
    renderProdutos();
    renderPreviewRapido();
    renderPreviewCelular();
    atualizarStats();
}

// ===== NAVEGAÇÃO =====
function irPara(pagina) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

    // Mostrar página alvo
    const paginaEl = document.getElementById(pagina);
    if (paginaEl) paginaEl.classList.remove('hidden');

    // Atualizar nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navAtivo = document.querySelector(`.nav-item[onclick*="${pagina}"]`);
    if (navAtivo) navAtivo.classList.add('active');

    // Título topbar
    const titulos = {
        dashboard: 'Dashboard',
        links: 'Meus Links',
        produtos: 'Produtos',
        importar: 'Importar Links',
        aparencia: 'Aparência',
        config: 'Configurações'
    };
    document.getElementById('pageTitle').textContent = titulos[pagina] || pagina;

    // Renderizar preview ao abrir aparência
    if (pagina === 'aparencia') renderPreviewCelular();

    fecharSidebar();
}

// ===== SIDEBAR =====
function abrirSidebar() {
    document.getElementById('sidebar').classList.add('aberta');
    document.getElementById('overlay').classList.add('show');
}

function fecharSidebar() {
    document.getElementById('sidebar').classList.remove('aberta');
    document.getElementById('overlay').classList.remove('show');
}

// ===== LINKS =====
let editandoLinkId = null;

function toggleFormLink() {
    const form = document.getElementById('formLink');
    const aberto = !form.classList.contains('hidden');

    if (aberto) {
        form.classList.add('hidden');
        limparFormLink();
        editandoLinkId = null;
    } else {
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth' });
    }

    // Resetar botão
    const btnAdd = document.querySelector('#page-links .btn-primary');
    if (btnAdd) {
        btnAdd.innerHTML = '<i class="fas fa-plus"></i> Novo Link';
        btnAdd.onclick = toggleFormLink;
    }
}

function limparFormLink() {
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkTitulo').value = '';
    document.getElementById('linkIcone').value = 'fas fa-link';
    document.getElementById('iconePreview').className = 'fas fa-link';
    document.getElementById('linkCor').value = '#6366f1';
    document.getElementById('linkDestaque').checked = false;
}

function definirCor(cor) {
    document.getElementById('linkCor').value = cor;
}

function autoDetectarLink(url) {
    if (!url || !url.startsWith('http')) return;

    const info = detectarInfoLink(url);
    if (!info) return;

    if (!document.getElementById('linkTitulo').value) {
        document.getElementById('linkTitulo').value = info.titulo;
    }
    document.getElementById('linkIcone').value = info.icone;
    document.getElementById('iconePreview').className = info.icone;
    document.getElementById('linkCor').value = info.cor;
}

function detectarInfoLink(url) {
    const u = url.toLowerCase();
    const mapa = [
        { test: 'instagram.com', titulo: 'Instagram', icone: 'fab fa-instagram', cor: '#E1306C' },
        { test: 'tiktok.com', titulo: 'TikTok', icone: 'fab fa-tiktok', cor: '#000000' },
        { test: 'youtube.com', titulo: 'YouTube', icone: 'fab fa-youtube', cor: '#FF0000' },
        { test: 'youtu.be', titulo: 'YouTube', icone: 'fab fa-youtube', cor: '#FF0000' },
        { test: 'twitter.com', titulo: 'Twitter', icone: 'fab fa-twitter', cor: '#1DA1F2' },
        { test: 'x.com', titulo: 'X (Twitter)', icone: 'fab fa-x-twitter', cor: '#000000' },
        { test: 'facebook.com', titulo: 'Facebook', icone: 'fab fa-facebook', cor: '#1877F2' },
        { test: 'linkedin.com', titulo: 'LinkedIn', icone: 'fab fa-linkedin', cor: '#0A66C2' },
        { test: 'spotify.com', titulo: 'Spotify', icone: 'fab fa-spotify', cor: '#1DB954' },
        { test: 'discord', titulo: 'Discord', icone: 'fab fa-discord', cor: '#5865F2' },
        { test: 'wa.me', titulo: 'WhatsApp', icone: 'fab fa-whatsapp', cor: '#25D366' },
        { test: 'whatsapp', titulo: 'WhatsApp', icone: 'fab fa-whatsapp', cor: '#25D366' },
        { test: 'telegram', titulo: 'Telegram', icone: 'fab fa-telegram', cor: '#26A5E4' },
        { test: 'twitch', titulo: 'Twitch', icone: 'fab fa-twitch', cor: '#9146FF' },
        { test: 'github', titulo: 'GitHub', icone: 'fab fa-github', cor: '#333333' },
        { test: 'amazon', titulo: 'Amazon', icone: 'fab fa-amazon', cor: '#FF9900' },
        { test: 'shopee', titulo: 'Shopee', icone: 'fas fa-shopping-bag', cor: '#EE4D2D' },
        { test: 'mercadolivre', titulo: 'Mercado Livre', icone: 'fas fa-shopping-cart', cor: '#FFD700' },
        { test: 'hotmart', titulo: 'Hotmart', icone: 'fas fa-fire', cor: '#F04E23' },
        { test: 'linktr.ee', titulo: 'Linktree', icone: 'fas fa-tree', cor: '#43E660' },
    ];

    for (const item of mapa) {
        if (u.includes(item.test)) return item;
    }

    return { titulo: '', icone: 'fas fa-link', cor: '#6366f1' };
}

function salvarLink() {
    const url = document.getElementById('linkUrl').value.trim();
    const titulo = document.getElementById('linkTitulo').value.trim();

    if (!url || !titulo) {
        toast('❌ URL e título são obrigatórios!');
        return;
    }

    if (editandoLinkId) {
        // Editar existente
        const idx = dados.links.findIndex(l => l.id === editandoLinkId);
        if (idx >= 0) {
            dados.links[idx] = {
                ...dados.links[idx],
                url,
                titulo,
                icone: document.getElementById('linkIcone').value || 'fas fa-link',
                cor: document.getElementById('linkCor').value || '#6366f1',
                destaque: document.getElementById('linkDestaque').checked
            };
        }
        editandoLinkId = null;
        toast('✅ Link atualizado!');
    } else {
        // Novo link
        const link = {
            id: Date.now().toString(),
            url,
            titulo,
            icone: document.getElementById('linkIcone').value || 'fas fa-link',
            cor: document.getElementById('linkCor').value || '#6366f1',
            destaque: document.getElementById('linkDestaque').checked,
            ativo: true,
            criadoEm: new Date().toISOString()
        };
        dados.links.unshift(link);
        toast('✅ Link adicionado!');
    }

    salvarDados();
    renderLinks();
    renderPreviewRapido();
    renderPreviewCelular();
    atualizarStats();
    toggleFormLink();
}

function renderLinks() {
    const lista = document.getElementById('listaLinks');
    const semLinks = document.getElementById('semLinks');

    if (!lista) return;

    if (!dados.links.length) {
        semLinks.classList.remove('hidden');
        lista.innerHTML = '';
        lista.appendChild(semLinks);
        return;
    }

    semLinks.classList.add('hidden');
    lista.innerHTML = dados.links.map(link => `
        <div class="link-item" data-id="${link.id}">
            <div class="link-icone" style="background:${link.cor || '#6366f1'}">
                <i class="${link.icone || 'fas fa-link'}"></i>
            </div>
            <div class="link-info">
                <div class="link-titulo">${link.titulo}</div>
                <div class="link-url">${link.url}</div>
            </div>
            <div class="link-acoes">
                <button class="btn-acao btn-toggle ${link.ativo ? 'ativo' : ''}"
                    onclick="toggleLink('${link.id}')" title="${link.ativo ? 'Desativar' : 'Ativar'}">
                    <i class="fas fa-${link.ativo ? 'toggle-on' : 'toggle-off'}"></i>
                </button>
                <button class="btn-acao btn-editar"
                    onclick="editarLink('${link.id}')" title="Editar">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="btn-acao btn-deletar"
                    onclick="removerLink('${link.id}')" title="Remover">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('') + semLinks.outerHTML;
}

function toggleLink(id) {
    const link = dados.links.find(l => l.id === id);
    if (link) {
        link.ativo = !link.ativo;
        salvarDados();
        renderLinks();
        renderPreviewRapido();
        renderPreviewCelular();
    }
}

function editarLink(id) {
    const link = dados.links.find(l => l.id === id);
    if (!link) return;

    editandoLinkId = id;
    irPara('links');

    const form = document.getElementById('formLink');
    form.classList.remove('hidden');

    document.getElementById('linkUrl').value = link.url;
    document.getElementById('linkTitulo').value = link.titulo;
    document.getElementById('linkIcone').value = link.icone;
    document.getElementById('iconePreview').className = link.icone;
    document.getElementById('linkCor').value = link.cor;
    document.getElementById('linkDestaque').checked = link.destaque;

    form.scrollIntoView({ behavior: 'smooth' });

    const btnSalvar = form.querySelector('.btn-primary');
    if (btnSalvar) btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar Edição';
}

function removerLink(id) {
    if (!confirm('Remover este link?')) return;
    dados.links = dados.links.filter(l => l.id !== id);
    salvarDados();
    renderLinks();
    renderPreviewRapido();
    renderPreviewCelular();
    atualizarStats();
    toast('🗑️ Link removido');
}

// ===== PRODUTOS =====
function toggleFormProduto() {
    const form = document.getElementById('formProduto');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

function closeAddProduto() {
    document.getElementById('formProduto').classList.add('hidden');
}

function trocarTabProd(tab, btn) {
    document.querySelectorAll('.tab-mini').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('tabAuto').classList.toggle('hidden', tab !== 'auto');
    document.getElementById('tabManual').classList.toggle('hidden', tab !== 'manual');
}

function detectarLoja(url) {
    const u = url.toLowerCase();
    if (u.includes('amazon') || u.includes('amzn')) return 'amazon';
    if (u.includes('shopee')) return 'shopee';
    if (u.includes('mercadolivre') || u.includes('mercadolibre')) return 'mercadolivre';
    if (u.includes('americanas')) return 'americanas';
    if (u.includes('magalu') || u.includes('magazineluiza')) return 'magalu';
    if (u.includes('aliexpress')) return 'aliexpress';
    return 'outros';
}

function getInfoLoja(loja) {
    const lojas = {
        amazon:       { nome: 'Amazon',        icone: '📦', classeCSS: 'loja-amazon' },
        shopee:       { nome: 'Shopee',         icone: '🛍️', classeCSS: 'loja-shopee' },
        mercadolivre: { nome: 'Mercado Livre',  icone: '🛒', classeCSS: 'loja-mercadolivre' },
        americanas:   { nome: 'Americanas',     icone: '🏬', classeCSS: 'loja-outros' },
        magalu:       { nome: 'Magalu',         icone: '🛒', classeCSS: 'loja-outros' },
        aliexpress:   { nome: 'AliExpress',     icone: '📦', classeCSS: 'loja-outros' },
        outros:       { nome: 'Loja',           icone: '🏪', classeCSS: 'loja-outros' }
    };
    return lojas[loja] || lojas.outros;
}

function buscarProduto() {
    const url = document.getElementById('prodUrl').value.trim();
    if (!url) { toast('❌ Cole o link do produto'); return; }

    try { new URL(url); } catch { toast('❌ URL inválida'); return; }

    const loja = detectarLoja(url);
    const info = getInfoLoja(loja);

    document.getElementById('lojaIcone').textContent = info.icone;
    document.getElementById('resultadoBusca').classList.remove('hidden');
    document.getElementById('prodNome').value = extrairNomeProduto(url, loja);
    document.getElementById('prodAfiliado').value = url;

    toast(`${info.icone} ${info.nome} detectado! Preencha os dados.`);
}

function extrairNomeProduto(url, loja) {
    try {
        const u = new URL(url);
        const partes = u.pathname.split('/').filter(Boolean);

        if (loja === 'amazon') {
            const idx = partes.findIndex(p => p === 'dp');
            if (idx > 0) return capitalize(decodeURIComponent(partes[idx - 1]).replace(/-/g, ' ')).substring(0, 80);
        }
        if (loja === 'mercadolivre') {
            const ultimo = partes[partes.length - 1];
            return capitalize(ultimo.replace(/-MLB.*/g, '').replace(/-/g, ' ')).substring(0, 80);
        }
        if (loja === 'shopee') {
            const ultimo = partes[partes.length - 1];
            return capitalize(ultimo.replace(/-i\.\d+\.\d+/g, '').replace(/-/g, ' ')).substring(0, 80);
        }

        const ultimo = partes[partes.length - 1];
        if (ultimo && ultimo.length > 3) {
            return capitalize(decodeURIComponent(ultimo).replace(/[-_]/g, ' ')).substring(0, 80);
        }
    } catch(e) {}

    return `Produto - ${getInfoLoja(loja).nome}`;
}

function capitalize(str) {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function salvarProdutoAuto() {
    const nome = document.getElementById('prodNome').value.trim();
    const afiliado = document.getElementById('prodAfiliado').value.trim();
    const url = document.getElementById('prodUrl').value.trim();

    if (!nome) { toast('❌ Nome é obrigatório'); return; }

    const loja = detectarLoja(url);
    const produto = {
        id: Date.now().toString(),
        nome,
        imagem: document.getElementById('prodImagem').value.trim(),
        precoOld: parseFloat(document.getElementById('prodPrecoOld').value) || 0,
        preco: parseFloat(document.getElementById('prodPreco').value) || 0,
        loja,
        categoria: document.getElementById('prodCat').value,
        afiliado: afiliado || url,
        criadoEm: new Date().toISOString()
    };

    dados.produtos.unshift(produto);
    salvarDados();
    renderProdutos();
    atualizarStats();
    cancelarBusca();
    closeAddProduto();
    toast('✅ Produto adicionado!');
}

function salvarProdutoManual() {
    const nome = document.getElementById('mpNome').value.trim();
    const afiliado = document.getElementById('mpAfiliado').value.trim();

    if (!nome || !afiliado) { toast('❌ Nome e link são obrigatórios'); return; }

    const produto = {
        id: Date.now().toString(),
        nome,
        imagem: document.getElementById('mpImagem').value.trim(),
        precoOld: parseFloat(document.getElementById('mpPrecoOld').value) || 0,
        preco: parseFloat(document.getElementById('mpPreco').value) || 0,
        loja: document.getElementById('mpLoja').value,
        categoria: document.getElementById('mpCat').value,
        afiliado,
        criadoEm: new Date().toISOString()
    };

    dados.produtos.unshift(produto);
    salvarDados();
    renderProdutos();
    atualizarStats();
    closeAddProduto();
    toast('✅ Produto adicionado!');
}

function cancelarBusca() {
    document.getElementById('resultadoBusca').classList.add('hidden');
    document.getElementById('prodUrl').value = '';
    document.getElementById('lojaIcone').textContent = '🔗';
}

function renderProdutos(filtro = 'todos') {
    const grid = document.getElementById('gridProdutos');
    const semProd = document.getElementById('semProdutos');

    const lista = filtro === 'todos'
        ? dados.produtos
        : dados.produtos.filter(p => p.categoria === filtro);

    if (!lista.length) {
        grid.innerHTML = '';
        semProd.classList.remove('hidden');
        grid.appendChild(semProd);
        return;
    }

    semProd.classList.add('hidden');

    grid.innerHTML = lista.map(p => {
        const infoLoja = getInfoLoja(p.loja);
        const desc = p.precoOld && p.precoOld > p.preco
            ? Math.round((1 - p.preco / p.precoOld) * 100) : 0;

        const imgHTML = p.imagem
            ? `<img src="${p.imagem}" alt="${p.nome}"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
            : '';

        return `
            <div class="prod-card">
                <div class="prod-img">
                    ${imgHTML}
                    <span style="${p.imagem ? 'display:none' : ''}">${infoLoja.icone}</span>
                    ${desc > 0 ? `<div class="prod-desc">-${desc}%</div>` : ''}
                    <div class="prod-loja ${infoLoja.classeCSS}">${infoLoja.icone} ${infoLoja.nome}</div>
                </div>
                <div class="prod-body">
                    <div class="prod-nome">${p.nome}</div>
                    <div class="prod-preco">
                        ${p.precoOld > 0 ? `<span class="preco-de">R$ ${fmt(p.precoOld)}</span>` : ''}
                        <span class="preco-por">${p.preco > 0 ? `R$ ${fmt(p.preco)}` : 'Ver preço'}</span>
                    </div>
                    <div class="prod-acoes">
                        <a href="${p.afiliado}" target="_blank" rel="noopener nofollow"
                            class="btn-primary" style="flex:1;font-size:.8rem;justify-content:center">
                            <i class="fas fa-external-link-alt"></i> Ver Oferta
                        </a>
                        <button class="btn-acao btn-deletar" onclick="removerProduto('${p.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('') + semProd.outerHTML;
}

function filtrarProd(cat, btn) {
    document.querySelectorAll('.filtro').forEach(f => f.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderProdutos(cat);
}

function removerProduto(id) {
    if (!confirm('Remover este produto?')) return;
    dados.produtos = dados.produtos.filter(p => p.id !== id);
    salvarDados();
    renderProdutos();
    atualizarStats();
    toast('🗑️ Produto removido');
}

// ===== IMPORTAR =====
async function importarLinktree() {
    const url = document.getElementById('urlLinktree').value.trim();

    if (!url) { toast('❌ Cole o link do Linktree'); return; }
    if (!url.includes('linktr.ee')) { toast('❌ URL deve ser do Linktree (linktr.ee/usuario)'); return; }

    const resultado = document.getElementById('resultLinktree');
    resultado.classList.remove('hidden');
    resultado.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;color:var(--t2)">
            <div style="width:18px;height:18px;border:2px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0"></div>
            Importando links do Linktree...
        </div>
    `;

    try {
        const username = url
            .replace(/https?:\/\//, '')
            .replace('linktr.ee/', '')
            .split('?')[0]
            .split('/')[0]
            .trim();

        await new Promise(r => setTimeout(r, 1500));

        // Criar links baseados no username detectado
        const linksImportados = [
            { plataforma: 'instagram', usuario: username },
            { plataforma: 'tiktok', usuario: username },
            { plataforma: 'youtube', usuario: username },
        ].map(({ plataforma, usuario }) => {
            const info = detectarInfoLink(`https://${plataforma}.com/${usuario}`);
            const urls = {
                instagram: `https://instagram.com/${usuario}`,
                tiktok: `https://tiktok.com/@${usuario}`,
                youtube: `https://youtube.com/@${usuario}`,
            };
            return {
                id: `lt_${plataforma}_${Date.now()}`,
                url: urls[plataforma],
                titulo: `${info.titulo} - @${username}`,
                icone: info.icone,
                cor: info.cor,
                destaque: plataforma === 'instagram',
                ativo: true,
                criadoEm: new Date().toISOString()
            };
        });

        // Adicionar apenas os que não existem
        let adicionados = 0;
        linksImportados.forEach(link => {
            const existe = dados.links.find(l => l.url === link.url);
            if (!existe) {
                dados.links.push(link);
                adicionados++;
            }
        });

        salvarDados();
        renderLinks();
        renderPreviewRapido();
        atualizarStats();

        resultado.innerHTML = `
            <div style="color:var(--success)">
                ✅ ${adicionados} links importados do @${username}!<br>
                <small style="color:var(--t2)">Edite os links conforme necessário na aba "Meus Links"</small>
            </div>
        `;

        toast(`✅ ${adicionados} links importados!`);

    } catch(e) {
        resultado.innerHTML = `
            <div style="color:var(--danger)">
                ❌ Erro ao importar. Adicione os links manualmente.
            </div>
        `;
        toast('❌ Erro na importação');
    }
}

function importarRedeSocial(rede) {
    const ids = {
        instagram: 'igUser',
        tiktok: 'ttUser',
        youtube: 'ytUser',
        whatsapp: 'waUser',
        telegram: 'tgUser'
    };

    const valor = document.getElementById(ids[rede])?.value.trim();
    if (!valor) { toast(`❌ Digite seu usuário`); return; }

    const configs = {
        instagram: {
            url: `https://instagram.com/${valor.replace('@', '')}`,
            titulo: `Instagram - @${valor.replace('@', '')}`,
            icone: 'fab fa-instagram',
            cor: '#E1306C'
        },
        tiktok: {
            url: `https://tiktok.com/@${valor.replace('@', '')}`,
            titulo: `TikTok - @${valor.replace('@', '')}`,
            icone: 'fab fa-tiktok',
            cor: '#000000'
        },
        youtube: {
            url: valor.startsWith('http') ? valor : `https://youtube.com/@${valor.replace('@', '')}`,
            titulo: `YouTube - ${valor}`,
            icone: 'fab fa-youtube',
            cor: '#FF0000'
        },
        whatsapp: {
            url: `https://wa.me/${valor.replace(/\D/g, '')}`,
            titulo: 'WhatsApp',
            icone: 'fab fa-whatsapp',
            cor: '#25D366'
        },
        telegram: {
            url: `https://t.me/${valor.replace('@', '')}`,
            titulo: `Telegram - ${valor}`,
            icone: 'fab fa-telegram',
            cor: '#26A5E4'
        }
    };

    const cfg = configs[rede];
    if (!cfg) return;

    const existe = dados.links.find(l => l.url === cfg.url);
    if (existe) { toast(`ℹ️ ${cfg.titulo} já adicionado`); return; }

    dados.links.unshift({
        id: `${rede}_${Date.now()}`,
        url: cfg.url,
        titulo: cfg.titulo,
        icone: cfg.icone,
        cor: cfg.cor,
        destaque: false,
        ativo: true,
        criadoEm: new Date().toISOString()
    });

    salvarDados();
    renderLinks();
    renderPreviewRapido();
    renderPreviewCelular();
    atualizarStats();
    toast(`✅ ${cfg.titulo} adicionado!`);

    if (document.getElementById(ids[rede])) {
        document.getElementById(ids[rede]).value = '';
    }
}

function importarQualquerLink() {
    const url = document.getElementById('anyUrl').value.trim();
    if (!url) { toast('❌ Cole uma URL'); return; }

    try { new URL(url); } catch { toast('❌ URL inválida'); return; }

    const info = detectarInfoLink(url);
    let titulo = info.titulo;

    if (!titulo) {
        try {
            titulo = new URL(url).hostname.replace('www.', '');
        } catch {
            titulo = 'Link';
        }
    }

    dados.links.unshift({
        id: `any_${Date.now()}`,
        url,
        titulo,
        icone: info.icone,
        cor: info.cor,
        destaque: false,
        ativo: true,
        criadoEm: new Date().toISOString()
    });

    salvarDados();
    renderLinks();
    renderPreviewRapido();
    renderPreviewCelular();
    atualizarStats();
    document.getElementById('anyUrl').value = '';
    toast(`✅ Link adicionado!`);
}

// ===== EXPORT / IMPORT =====
function exportarDados() {
    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkvitrine-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('📤 Backup exportado!');
}

function importarJson(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const importado = JSON.parse(e.target.result);
            if (importado.links || importado.produtos) {
                if (importado.links) dados.links = [...(importado.links || []), ...dados.links];
                if (importado.produtos) dados.produtos = [...(importado.produtos || []), ...dados.produtos];
                if (importado.config) dados.config = { ...dados.config, ...importado.config };
                salvarDados();
                renderizarTudo();
                iniciarUI();
                toast('✅ Dados importados!');
            } else {
                toast('❌ Arquivo inválido');
            }
        } catch {
            toast('❌ Erro ao ler arquivo');
        }
    };
    reader.readAsText(arquivo);
    event.target.value = '';
}

// ===== APARÊNCIA =====
function aplicarTema(tema) {
    dados.config.tema = tema;
    salvarDados();

    document.querySelectorAll('.tema-card').forEach(t => {
        t.classList.toggle('active', t.dataset.tema === tema);
    });

    renderPreviewCelular();
    toast(`🎨 Tema ${tema} aplicado!`);
}

function aplicarEstilo(estilo) {
    dados.config.estilo = estilo;
    salvarDados();

    document.querySelectorAll('.estilo-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.estilo === estilo);
    });

    renderPreviewCelular();
}

function aplicarCor(cor) {
    dados.config.cor = cor;
    salvarDados();
    renderPreviewCelular();
    toast('🎨 Cor atualizada!');
}

// ===== PREVIEW =====
function renderPreviewRapido() {
    const tela = document.getElementById('previewRapido');
    if (!tela) return;
    tela.innerHTML = gerarHTMLPublico(true);
}

function renderPreviewCelular() {
    const tela = document.getElementById('telaCelular');
    if (!tela) return;
    tela.innerHTML = gerarHTMLPublico(true);
}

function verPagina() {
    const modal = document.getElementById('modalPreview');
    modal.classList.remove('hidden');

    const iframe = document.getElementById('iframePreview');
    iframe.srcdoc = gerarHTMLPublico(false);
}

function fecharPreview() {
    document.getElementById('modalPreview').classList.add('hidden');
}

function mudarDevice(device) {
    const frame = document.getElementById('deviceFrame');
    frame.className = `device-frame ${device}`;

    document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn${device.charAt(0).toUpperCase() + device.slice(1)}`).classList.add('active');
}

function gerarHTMLPublico(mini = false) {
    const cfg = dados.config;
    const links = dados.links.filter(l => l.ativo);
    const produtos = dados.produtos.slice(0, 6);

    // Temas
    const temas = {
        dark: { bg: '#0a0a14', text: '#f1f1ff', text2: '#8888a8', card: '#13131f', border: 'rgba(255,255,255,0.08)' },
        light: { bg: '#f8f8fc', text: '#1a1a2e', text2: '#5a5a7a', card: '#ffffff', border: 'rgba(0,0,0,0.08)' },
        gradient: { bg: 'linear-gradient(135deg,#6366f1,#ec4899)', text: '#ffffff', text2: 'rgba(255,255,255,.75)', card: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.2)' },
        neon: { bg: '#000', text: '#00ff88', text2: '#00aa55', card: '#0a0a0a', border: 'rgba(0,255,136,0.2)' },
        ocean: { bg: 'linear-gradient(135deg,#0c3547,#1a6b8a)', text: '#e0f4ff', text2: 'rgba(224,244,255,.7)', card: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.12)' },
        sunset: { bg: 'linear-gradient(135deg,#1a0533,#6b1a1a)', text: '#ffe4d6', text2: 'rgba(255,228,214,.7)', card: 'rgba(255,255,255,0.08)', border: 'rgba(255,150,100,0.2)' }
    };

    const t = temas[cfg.tema] || temas.dark;
    const cor = cfg.cor || '#6366f1';

    // Estilos de botão
    const btnR = { rounded: '12px', pill: '50px', square: '2px', outline: '12px' };
    const btnBg = { rounded: cor, pill: cor, square: cor, outline: 'transparent' };
    const btnBorder = { rounded: 'none', pill: 'none', square: 'none', outline: `2px solid ${cor}` };
    const btnColor = { rounded: '#fff', pill: '#fff', square: '#fff', outline: cor };
    const e = cfg.estilo || 'rounded';

    // Avatar
    const avatarHTML = cfg.avatar
        ? `<img src="${cfg.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
        : `<span style="font-size:${mini ? '1rem' : '1.8rem'};font-weight:800;color:#fff">${cfg.nome.charAt(0).toUpperCase()}</span>`;

    // Links HTML
    const linksHTML = links.length
        ? links.map(l => `
            <a href="${mini ? '#' : l.url}" ${!mini ? 'target="_blank"' : ''}
                style="display:flex;align-items:center;gap:12px;
                    padding:${mini ? '7px 10px' : '14px 18px'};
                    background:${btnBg[e]};
                    border:${btnBorder[e]};
                    color:${btnColor[e]};
                    border-radius:${btnR[e]};
                    text-decoration:none;
                    font-weight:600;
                    font-size:${mini ? '.55rem' : '.92rem'};
                    margin-bottom:${mini ? '5px' : '10px'};
                    transition:opacity .2s;
                    ${l.destaque ? `box-shadow:0 0 16px ${cor}50;` : ''}">
                <i class="${l.icone}" style="font-size:${mini ? '.7rem' : '1rem'}"></i>
                ${l.titulo}
            </a>
        `).join('')
        : `<p style="text-align:center;color:${t.text2};font-size:${mini ? '.6rem' : '.88rem'}">Nenhum link ainda</p>`;

    // Produtos HTML
    const prodsHTML = produtos.length ? `
        <div style="margin-top:${mini ? '10px' : '24px'}">
            <h3 style="text-align:center;font-size:${mini ? '.6rem' : '.9rem'};font-weight:800;color:${t.text};margin-bottom:${mini ? '6px' : '14px'}">🔥 Ofertas</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:${mini ? '4px' : '10px'}">
                ${produtos.map(p => {
                    const il = getInfoLoja(p.loja);
                    return `
                        <a href="${mini ? '#' : p.afiliado}" ${!mini ? 'target="_blank"' : ''}
                            style="background:${t.card};border:1px solid ${t.border};border-radius:${mini ? '5px' : '10px'};text-decoration:none;display:block">
                            <div style="height:${mini ? '30px' : '70px'};background:rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:${mini ? '.9rem' : '1.6rem'}">
                                ${p.imagem ? `<img src="${p.imagem}" style="width:100%;height:100%;object-fit:cover">` : il.icone}
                            </div>
                            <div style="padding:${mini ? '3px' : '8px'}">
                                <p style="font-size:${mini ? '.45rem' : '.75rem'};color:${t.text};font-weight:600;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${p.nome}</p>
                                <p style="font-size:${mini ? '.5rem' : '.82rem'};color:#10b981;font-weight:800">${p.preco > 0 ? `R$ ${fmt(p.preco)}` : 'Ver'}</p>
                            </div>
                        </a>
                    `;
                }).join('')}
            </div>
        </div>
    ` : '';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${cfg.nome}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;min-height:100vh;background:${t.bg};padding:${mini ? '12px 10px' : '40px 16px'};display:flex;align-items:flex-start;justify-content:center}
  a:hover{opacity:.85}
  ${mini ? 'body{overflow:hidden}' : ''}
</style>
</head>
<body>
  <div style="width:100%;max-width:${mini ? '100%' : '460px'}">
    <div style="text-align:center;margin-bottom:${mini ? '10px' : '24px'}">
      <div style="width:${mini ? '44px' : '80px'};height:${mini ? '44px' : '80px'};border-radius:50%;background:linear-gradient(135deg,${cor},#ec4899);margin:0 auto ${mini ? '6px' : '12px'};display:flex;align-items:center;justify-content:center;overflow:hidden">
        ${avatarHTML}
      </div>
      <h1 style="font-size:${mini ? '.7rem' : '1.2rem'};font-weight:800;color:${t.text};margin-bottom:${mini ? '3px' : '6px'}">${cfg.nome}</h1>
      <p style="font-size:${mini ? '.55rem' : '.85rem'};color:${t.text2};line-height:1.5">${cfg.bio}</p>
    </div>
    ${linksHTML}
    ${prodsHTML}
    <p style="text-align:center;font-size:${mini ? '.4rem' : '.7rem'};color:${t.text2};margin-top:${mini ? '10px' : '24px'};opacity:.5">⚡ LinkVitrine Pro</p>
  </div>
</body>
</html>`;
}

// ===== CONFIG =====
function salvarConfig() {
    dados.config.nome = document.getElementById('cfgNome').value.trim() || 'Usuário';
    dados.config.usuario = document.getElementById('cfgUsuario').value.trim().toLowerCase()
        .replace(/[^a-z0-9-]/g, '') || 'usuario';
    dados.config.bio = document.getElementById('cfgBio').value.trim() || '';

    salvarDados();
    iniciarUI();
    renderPreviewRapido();
    renderPreviewCelular();
    toast('✅ Perfil salvo!');
}

function trocarFoto(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = e => {
        dados.config.avatar = e.target.result;
        salvarDados();
        atualizarAvatar(e.target.result);
        renderPreviewRapido();
        renderPreviewCelular();
        toast('✅ Foto atualizada!');
    };
    reader.readAsDataURL(arquivo);
}

function atualizarAvatar(src) {
    const el = document.getElementById('avatarGrande');
    if (el) {
        el.innerHTML = `<img src="${src}" style="width:70px;height:70px;object-fit:cover;border-radius:50%">`;
    }
    document.getElementById('avatarLetra') &&
        (document.getElementById('avatarLetra').style.display = 'none');
}

function resetarTudo() {
    if (!confirm('⚠️ Apagar TODOS os dados?')) return;
    if (!confirm('Esta ação não pode ser desfeita!')) return;
    localStorage.removeItem(CHAVE);
    location.reload();
}

// ===== STATS =====
function atualizarStats() {
    const total = Object.values(dados.cliques || {}).reduce((a, b) => a + b, 0);
    document.getElementById('totalLinks').textContent = dados.links.length;
    document.getElementById('totalProdutos').textContent = dados.produtos.length;
    document.getElementById('totalCliques').textContent = total;
    document.getElementById('totalRedes').textContent =
        dados.links.filter(l => l.categoria === 'social' || ['instagram','tiktok','youtube','twitter','facebook'].some(r => l.url.includes(r))).length;
}

// ===== COMPARTILHAR =====
function compartilhar() {
    const url = `https://linkvitrine.pro/${dados.config.usuario}`;
    if (navigator.share) {
        navigator.share({ title: dados.config.nome, text: dados.config.bio, url });
    } else {
        navigator.clipboard.writeText(url).then(() => toast('✅ Link copiado!'));
    }
}

function copiarUrl() {
    const url = `https://linkvitrine.pro/${dados.config.usuario}`;
    navigator.clipboard.writeText(url).then(() => toast('✅ URL copiada!'));
}

// ===== UTILS =====
function fmt(n) {
    return parseFloat(n).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

let toastTimer;
function toast(msg) {
    const el = document.getElementById('toast');
    document.getElementById('toastTexto').textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

// ===== DEMO DATA =====
function addDadosDemo() {
    dados.config.nome = 'Seu Nome';
    dados.config.bio = '🔥 Meus melhores links e ofertas!';

    dados.links = [
        { id: 'd1', url: 'https://instagram.com', titulo: 'Instagram', icone: 'fab fa-instagram', cor: '#E1306C', destaque: true, ativo: true, criadoEm: new Date().toISOString() },
        { id: 'd2', url: 'https://tiktok.com', titulo: 'TikTok', icone: 'fab fa-tiktok', cor: '#000000', destaque: false, ativo: true, criadoEm: new Date().toISOString() },
        { id: 'd3', url: 'https://youtube.com', titulo: 'YouTube', icone: 'fab fa-youtube', cor: '#FF0000', destaque: false, ativo: true, criadoEm: new Date().toISOString() },
        { id: 'd4', url: 'https://wa.me/5511999999999', titulo: 'WhatsApp', icone: 'fab fa-whatsapp', cor: '#25D366', destaque: false, ativo: true, criadoEm: new Date().toISOString() },
    ];

    dados.produtos = [
        { id: 'p1', nome: 'Fone Bluetooth Premium', imagem: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80', preco: 199.90, precoOld: 349.90, loja: 'amazon', categoria: 'tecnologia', afiliado: '#', criadoEm: new Date().toISOString() },
        { id: 'p2', nome: 'Smartwatch Esportivo', imagem: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80', preco: 149.90, precoOld: 299.90, loja: 'shopee', categoria: 'tecnologia', afiliado: '#', criadoEm: new Date().toISOString() },
    ];

    salvarDados();
    renderizarTudo();
    iniciarUI();
}
