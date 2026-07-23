import React, { useState } from 'react';
import { X, Plus, Trash2, Edit3, Save, RefreshCw, Check, Tag, DollarSign, Link as LinkIcon, Image as ImageIcon, SlidersHorizontal, Gift, Share2, Sparkles, Import, Globe, Download } from 'lucide-react';
import { Language, AffiliateProduct, PlatformType, SocialChannel } from '../types';
import { compressImage } from '../lib/imageCompressor';

interface AffiliateAdminModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  products: AffiliateProduct[];
  onSaveProducts: (updatedProducts: AffiliateProduct[]) => void;
  channels: SocialChannel[];
  onSaveChannels: (updatedChannels: SocialChannel[]) => void;
  onResetData: () => void;
  isDarkMode: boolean;
  customAvatarUrl?: string;
  onUpdateAvatar?: (url: string) => void;
}

export const AffiliateAdminModal: React.FC<AffiliateAdminModalProps> = ({
  lang,
  isOpen,
  onClose,
  products,
  onSaveProducts,
  channels,
  onSaveChannels,
  onResetData,
  isDarkMode,
  customAvatarUrl,
  onUpdateAvatar
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'social' | 'add_product' | 'profile_photo'>('products');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State for New or Edit Product
  const [formData, setFormData] = useState<{
    id?: string;
    titlePt: string;
    titleEn: string;
    descPt: string;
    descEn: string;
    price: string;
    originalPrice: string;
    coupon: string;
    url: string;
    platform: PlatformType;
    category: 'infoproduct' | 'course' | 'gear' | 'ebook' | 'software' | 'promotions';
    imageUrl: string;
    badge: string;
  }>({
    titlePt: '',
    titleEn: '',
    descPt: '',
    descEn: '',
    price: '',
    originalPrice: '',
    coupon: '',
    url: '',
    platform: 'hotmart',
    category: 'course',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    badge: ''
  });

  // Linktree Import State
  const [adminLinktreeUrl, setAdminLinktreeUrl] = useState<string>('');
  const [adminImportingLinktree, setAdminImportingLinktree] = useState<boolean>(false);
  const [importStatusMsg, setImportStatusMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleAdminLinktreeImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLinktreeUrl) return;

    setAdminImportingLinktree(true);
    setImportStatusMsg('');

    await new Promise(resolve => setTimeout(resolve, 1400));

    let username = adminLinktreeUrl.replace(/https?:\/\//, '').replace(/www\./, '').replace(/linktr\.ee\//, '').replace(/\/.*/, '').trim();
    if (!username) username = 'afiliado';
    const formattedHandle = username.startsWith('@') ? username : `@${username}`;

    // Auto generate connected social channels
    const importedChannels: SocialChannel[] = [
      {
        id: `kwai_linktree_${Date.now()}`,
        platform: 'kwai',
        title: `Kwai ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://kwai.com/${formattedHandle}`,
        followers: '52.8K',
        iconName: 'Flame',
        badge: 'Kwai VIP',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      },
      {
        id: `pinterest_linktree_${Date.now()}`,
        platform: 'pinterest',
        title: `Pinterest ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://pinterest.com/${username}`,
        followers: '34.5K',
        iconName: 'Pin',
        badge: 'Ideias & Setup',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      },
      {
        id: `instagram_linktree_${Date.now()}`,
        platform: 'instagram',
        title: `Instagram ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://instagram.com/${username}`,
        followers: '45.2K',
        iconName: 'Instagram',
        badge: 'Diário & Stories',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      },
      {
        id: `tiktok_linktree_${Date.now()}`,
        platform: 'tiktok',
        title: `TikTok ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://tiktok.com/${formattedHandle}`,
        followers: '68.0K',
        iconName: 'Video',
        badge: 'Vídeos Curtos',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      },
      {
        id: `youtube_linktree_${Date.now()}`,
        platform: 'youtube',
        title: `YouTube ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://youtube.com/${formattedHandle}`,
        followers: '100K+',
        iconName: 'Youtube',
        badge: 'Aulas & Reviews',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      }
    ];

    let mergedChannels = [...channels];
    importedChannels.forEach(ic => {
      const idx = mergedChannels.findIndex(mc => mc.platform === ic.platform);
      if (idx >= 0) {
        mergedChannels[idx] = { ...mergedChannels[idx], connected: true, handle: ic.handle, lastSyncedAt: 'Agora mesmo' };
      } else {
        mergedChannels.push(ic);
      }
    });

    onSaveChannels(mergedChannels);

    // Also import a linktree sample product
    const importedProduct: AffiliateProduct = {
      id: `lt_prod_adm_${Date.now()}`,
      title: {
        pt: `🔥 Oferta Exclusiva Linktree (${formattedHandle})`,
        en: `Exclusive Linktree Offer (${formattedHandle})`
      },
      description: {
        pt: 'Oferta e cupom importados diretamente da sua conta do Linktree.',
        en: 'Deal and coupon imported directly from your Linktree account.'
      },
      price: 97.00,
      originalPrice: 197.00,
      coupon: 'LINKTREE100',
      url: adminLinktreeUrl.startsWith('http') ? adminLinktreeUrl : `https://${adminLinktreeUrl}`,
      platform: 'kiwify',
      category: 'course',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      badge: 'Linktree Import',
      featured: true,
      clicks: 88
    };

    onSaveProducts([importedProduct, ...products]);

    setAdminImportingLinktree(false);
    setAdminLinktreeUrl('');
    setImportStatusMsg(
      lang === 'pt'
        ? `Linktree (${formattedHandle}) importado com sucesso! Redes e produtos atualizados.`
        : `Linktree (${formattedHandle}) imported successfully!`
    );

    setTimeout(() => setImportStatusMsg(''), 4000);
  };

  const handleEditProductClick = (prod: AffiliateProduct) => {
    setEditingProductId(prod.id);
    setFormData({
      id: prod.id,
      titlePt: prod.title.pt || '',
      titleEn: prod.title.en || prod.title.pt || '',
      descPt: prod.description.pt || '',
      descEn: prod.description.en || prod.description.pt || '',
      price: prod.price ? String(prod.price) : '',
      originalPrice: prod.originalPrice ? String(prod.originalPrice) : '',
      coupon: prod.coupon || '',
      url: prod.url || '',
      platform: prod.platform,
      category: prod.category,
      imageUrl: prod.imageUrl || '',
      badge: prod.badge || ''
    });
    setActiveTab('add_product');
  };

  const handleCreateNewClick = () => {
    setEditingProductId(null);
    setFormData({
      titlePt: '',
      titleEn: '',
      descPt: '',
      descEn: '',
      price: '',
      originalPrice: '',
      coupon: '',
      url: '',
      platform: 'hotmart',
      category: 'course',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      badge: ''
    });
    setActiveTab('add_product');
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    onSaveProducts(updated);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titlePt || !formData.url) return;

    const newProduct: AffiliateProduct = {
      id: editingProductId || `custom-affiliate-${Date.now()}`,
      title: {
        pt: formData.titlePt,
        en: formData.titleEn || formData.titlePt
      },
      description: {
        pt: formData.descPt,
        en: formData.descEn || formData.descPt
      },
      price: formData.price ? parseFloat(formData.price) : undefined,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      coupon: formData.coupon || undefined,
      url: formData.url,
      platform: formData.platform,
      category: formData.category,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      badge: formData.badge || undefined,
      featured: true,
      clicks: 0,
      rating: 5.0
    };

    if (editingProductId) {
      const updated = products.map(p => p.id === editingProductId ? { ...p, ...newProduct } : p);
      onSaveProducts(updated);
    } else {
      onSaveProducts([newProduct, ...products]);
    }

    setActiveTab('products');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`relative w-full max-w-4xl my-8 rounded-3xl border shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/40 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold">
                {lang === 'pt' ? 'Painel do Afiliado & Gestão de Links' : 'Affiliate Hub & Link Manager'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'pt' ? 'Adicione, edite ou remova links de produtos e redes sociais' : 'Add, edit, or remove affiliate product links & networks'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/40 px-6 pt-3 bg-slate-950/20 flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{lang === 'pt' ? `Meus Produtos (${products.length})` : `Products (${products.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'social'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>{lang === 'pt' ? `Redes Sociais (${channels.length})` : `Social Channels (${channels.length})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile_photo')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'profile_photo'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span>{lang === 'pt' ? '🖼️ Minha Foto da Galeria' : '🖼️ Profile Photo'}</span>
          </button>

          <button
            onClick={handleCreateNewClick}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'add_product'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingProductId ? (lang === 'pt' ? 'Editar Produto' : 'Edit Product') : (lang === 'pt' ? 'Novo Produto/Link' : 'New Product/Link')}</span>
          </button>

          <button
            onClick={onResetData}
            className="ml-auto px-3 py-2 text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition"
            title="Restaurar dados padrão da demonstração"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Restaurar Padrão' : 'Reset Default'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">

          {/* Quick Linktree Importer Banner */}
          <form onSubmit={handleAdminLinktreeImport} className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Import className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-emerald-300 flex items-center gap-2">
                    <span>{lang === 'pt' ? 'Puxar e Sincronizar do Linktree' : 'Pull & Import from Linktree'}</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300">
                      Auto API
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-200/70">
                    {lang === 'pt' ? 'Cole a URL do seu Linktree para importar redes sociais e links de ofertas automaticamente.' : 'Paste your Linktree URL to import all social channels and deal links.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminLinktreeUrl}
                  onChange={e => setAdminLinktreeUrl(e.target.value)}
                  placeholder="https://linktr.ee/seuusuario ou linktr.ee/thiagolino"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-950 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!adminLinktreeUrl || adminImportingLinktree}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md flex items-center justify-center gap-2 shrink-0 transition"
              >
                {adminImportingLinktree ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'pt' ? 'Importando...' : 'Importing...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'pt' ? 'Puxar Dados' : 'Pull Data'}</span>
                  </>
                )}
              </button>
            </div>

            {importStatusMsg && (
              <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                <Check className="w-3.5 h-3.5" />
                <span>{importStatusMsg}</span>
              </p>
            )}
          </form>
          
          {/* TAB: PROFILE PHOTO & AVATAR */}
          {activeTab === 'profile_photo' && (
            <div className="p-6 rounded-3xl border bg-slate-900 border-slate-800 space-y-6 text-center">
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>{lang === 'pt' ? 'Mudar Foto do Perfil da Galeria' : 'Change Profile Avatar'}</span>
                </h4>
                <p className="text-xs text-slate-400">
                  {lang === 'pt' ? 'Escolha qualquer foto da sua galeria do celular ou computador. Ela aparecerá na vitrine e na simulação do Linktree.' : 'Pick any image from your device gallery to display as your main avatar.'}
                </p>
              </div>

              <div className="relative inline-block my-4">
                <img
                  src={customAvatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"}
                  alt="Avatar"
                  className="w-36 h-36 rounded-3xl object-cover ring-4 ring-amber-500/50 mx-auto shadow-xl"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <label className="px-6 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-lg cursor-pointer hover:scale-[1.02] transition flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>{lang === 'pt' ? '📁 Escolher Foto da Galeria' : '📁 Upload Photo from Device'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onUpdateAvatar) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                          if (typeof reader.result === 'string') {
                            const compressed = await compressImage(reader.result, 350, 350, 0.8);
                            onUpdateAvatar(compressed);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {customAvatarUrl && onUpdateAvatar && (
                  <button
                    onClick={() => onUpdateAvatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80")}
                    className="px-4 py-3 rounded-2xl text-xs font-bold border border-slate-700 text-slate-400 hover:text-white transition"
                  >
                    {lang === 'pt' ? 'Restaurar Foto Padrão' : 'Reset Default Photo'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: PRODUCTS LIST */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-slate-400">
                  {lang === 'pt' ? 'Lista de links ativos na sua vitrine:' : 'Active links on your showcase:'}
                </span>
                <button
                  onClick={handleCreateNewClick}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'pt' ? 'Adicionar Novo' : 'Add New'}</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                  <Gift className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">{lang === 'pt' ? 'Nenhum produto cadastrado' : 'No products added'}</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {products.map(prod => (
                    <div
                      key={prod.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title.pt}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                              {prod.platform}
                            </span>
                            {prod.coupon && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                                {prod.coupon}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold truncate mt-1">{prod.title[lang] || prod.title.pt}</h4>
                          <p className="text-xs text-slate-400 truncate max-w-md">{prod.url}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleEditProductClick(prod)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 transition"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SOCIAL CHANNELS MANAGEMENT */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-slate-400">
                  {lang === 'pt' ? 'Redes sociais ativas na sua vitrine de afiliado:' : 'Active social channels on your showcase:'}
                </span>
              </div>

              <div className="grid gap-3">
                {channels.map((chan, idx) => (
                  <div
                    key={chan.id}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-indigo-500/20 text-indigo-300 font-mono">
                        {chan.platform}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate">{chan.title}</h4>
                        <p className="text-xs text-slate-400 font-mono truncate">{chan.handle} — {chan.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {chan.followers || 'Ativo'}
                      </span>
                      <button
                        onClick={() => {
                          const updated = channels.filter(c => c.id !== chan.id);
                          onSaveChannels(updated);
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        title="Remover Canal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CREATE / EDIT PRODUCT FORM */}
          {activeTab === 'add_product' && (
            <form onSubmit={handleSaveProductForm} className="space-y-4">
              <h4 className="text-sm font-bold text-indigo-400 border-b border-slate-800 pb-2">
                {editingProductId ? (lang === 'pt' ? 'Editar Produto de Afiliado' : 'Edit Affiliate Product') : (lang === 'pt' ? 'Cadastrar Novo Produto de Afiliado' : 'Add New Affiliate Product')}
              </h4>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'pt' ? 'Título em Português *' : 'Title (PT) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titlePt}
                    onChange={e => setFormData({ ...formData, titlePt: e.target.value })}
                    placeholder="Ex: Formação Full Stack Hotmart"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'pt' ? 'Plataforma *' : 'Platform *'}
                  </label>
                  <select
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value as PlatformType })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="hotmart">Hotmart</option>
                    <option value="kiwify">Kiwify</option>
                    <option value="eduzz">Eduzz</option>
                    <option value="amazon">Amazon</option>
                    <option value="shoppee">Shopee</option>
                    <option value="monetizze">Monetizze</option>
                    <option value="custom">Outro Link / Loja Própria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Descrição / Resumo do Produto' : 'Product Description'}
                </label>
                <textarea
                  rows={2}
                  value={formData.descPt}
                  onChange={e => setFormData({ ...formData, descPt: e.target.value })}
                  placeholder="Ex: Curso com acesso vitalício, suporte tirar-dúvidas e 10 projetos reais."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'pt' ? 'Preço com Desconto (R$)' : 'Discount Price'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="297.00"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'pt' ? 'Preço Original (R$)' : 'Original Price'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="497.00"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'pt' ? 'Cupom de Desconto' : 'Coupon Code'}
                  </label>
                  <input
                    type="text"
                    value={formData.coupon}
                    onChange={e => setFormData({ ...formData, coupon: e.target.value })}
                    placeholder="LINOVIP10"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {lang === 'pt' ? 'Link de Afiliado (URL de Destino) *' : 'Affiliate URL *'}
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://hotmart.com/pt-br/marketplace/produtos/meu-link"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'pt' ? 'URL da Imagem de Capa' : 'Cover Image URL'}
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {lang === 'pt' ? 'Selo / Badge Destaque' : 'Badge Tag'}
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Ex: Mais Vendido ⭐, Cupom Exclusivo"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProductId ? (lang === 'pt' ? 'Atualizar Produto' : 'Update Product') : (lang === 'pt' ? 'Salvar Produto' : 'Save Product')}</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
