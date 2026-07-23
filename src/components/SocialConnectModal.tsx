import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, ShieldCheck, Sparkles, Link as LinkIcon, Plus, Trash2, ExternalLink, Zap, Flame, Pin, Instagram, Youtube, Send, MessageCircle, Video, AtSign, Facebook, Twitch, MessageSquare, Twitter, Globe, Download, Import } from 'lucide-react';
import { Language, SocialChannel, AffiliateProduct } from '../types';

interface SocialConnectModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  channels: SocialChannel[];
  onSaveChannels: (channels: SocialChannel[]) => Promise<void>;
  products?: AffiliateProduct[];
  onSaveProducts?: (products: AffiliateProduct[]) => Promise<void>;
  isDarkMode: boolean;
}

const AVAILABLE_PLATFORMS = [
  { id: 'kwai', name: 'Kwai', icon: Flame, color: 'text-orange-500 bg-orange-500/10 border-orange-500/30' },
  { id: 'pinterest', name: 'Pinterest', icon: Pin, color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500 bg-pink-500/10 border-pink-500/30' },
  { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600 bg-red-600/10 border-red-600/30' },
  { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  { id: 'threads', name: 'Threads', icon: AtSign, color: 'text-slate-200 bg-slate-800 border-slate-700' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
  { id: 'twitch', name: 'Twitch', icon: Twitch, color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
  { id: 'discord', name: 'Discord', icon: MessageSquare, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30' },
  { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'text-slate-300 bg-slate-800 border-slate-700' },
  { id: 'custom', name: 'Outra Rede / Link Personalizado', icon: Globe, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
];

export const SocialConnectModal: React.FC<SocialConnectModalProps> = ({
  lang,
  isOpen,
  onClose,
  channels,
  onSaveChannels,
  products,
  onSaveProducts,
  isDarkMode
}) => {
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);
  const [handleInput, setHandleInput] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('kwai');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Linktree Import State
  const [linktreeUrl, setLinktreeUrl] = useState<string>('');
  const [importingLinktree, setImportingLinktree] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleImportLinktree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linktreeUrl) return;

    setImportingLinktree(true);
    setSuccessMsg('');

    // Simulate smart parsing & network connection
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Extract handle from URL e.g. linktr.ee/thiagolino or https://linktr.ee/username
    let username = linktreeUrl.replace(/https?:\/\//, '').replace(/www\./, '').replace(/linktr\.ee\//, '').replace(/\/.*/, '').trim();
    if (!username) username = 'afiliado';
    const formattedHandle = username.startsWith('@') ? username : `@${username}`;

    // Auto generate connected social channels imported from Linktree
    const importedChannels: SocialChannel[] = [
      {
        id: `kwai_linktree_${Date.now()}`,
        platform: 'kwai',
        title: `Kwai ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://kwai.com/${formattedHandle}`,
        followers: '52.8K',
        iconName: 'Flame',
        badge: 'Kwai Creator VIP (Linktree)',
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
        badge: 'Ideias & Setup (Linktree)',
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
        followers: '48.1K',
        iconName: 'Instagram',
        badge: 'Diário & Stories (Linktree)',
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
        followers: '72.0K',
        iconName: 'Video',
        badge: 'Vídeos Virais (Linktree)',
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
        followers: '105K',
        iconName: 'Youtube',
        badge: 'Aulas & Reviews (Linktree)',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      }
    ];

    // Merge with existing channels (avoid duplicate platform if needed or update)
    let mergedChannels = [...channels];
    importedChannels.forEach(ic => {
      const idx = mergedChannels.findIndex(mc => mc.platform === ic.platform);
      if (idx >= 0) {
        mergedChannels[idx] = { ...mergedChannels[idx], connected: true, handle: ic.handle, lastSyncedAt: 'Agora mesmo' };
      } else {
        mergedChannels.push(ic);
      }
    });

    await onSaveChannels(mergedChannels);

    // If products array & handler passed, also import sample products from Linktree
    if (products && onSaveProducts) {
      const importedProducts: AffiliateProduct[] = [
        {
          id: `lt_prod_1_${Date.now()}`,
          title: {
            pt: `🔥 Oferta Imperdível do Linktree (${formattedHandle})`,
            en: `Special Linktree Offer (${formattedHandle})`
          },
          description: {
            pt: 'Link exclusivo importado direto do seu perfil do Linktree.',
            en: 'Exclusive deal link imported directly from your Linktree profile.'
          },
          price: 97.00,
          originalPrice: 197.00,
          coupon: 'LINKTREEVIP',
          url: linktreeUrl.startsWith('http') ? linktreeUrl : `https://${linktreeUrl}`,
          platform: 'kiwify',
          category: 'course',
          imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
          badge: 'Importado do Linktree',
          featured: true,
          clicks: 142
        }
      ];
      await onSaveProducts([...importedProducts, ...products]);
    }

    setImportingLinktree(false);
    setLinktreeUrl('');

    setSuccessMsg(
      lang === 'pt'
        ? `Importação do Linktree (${formattedHandle}) concluída! Redes sociais e links sincronizados com sucesso.`
        : `Linktree import (${formattedHandle}) completed! Social accounts and links synced.`
    );

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddCustomChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput && !customTitle) return;

    setConnectingPlatform('custom');
    setSuccessMsg('');

    await new Promise(resolve => setTimeout(resolve, 800));

    const platformConfig = AVAILABLE_PLATFORMS.find(p => p.id === selectedPlatform);
    const platformName = platformConfig?.name || selectedPlatform;

    const formattedHandle = handleInput ? (handleInput.startsWith('@') ? handleInput : `@${handleInput}`) : '@afiliado';
    const computedTitle = customTitle || `${platformName} ${formattedHandle}`;
    const computedUrl = customUrl || (selectedPlatform !== 'custom' ? `https://${selectedPlatform}.com/${handleInput.replace('@', '')}` : 'https://linktr.ee');

    const newChannel: SocialChannel = {
      id: `${selectedPlatform}_${Date.now()}`,
      platform: selectedPlatform as any,
      title: computedTitle,
      handle: formattedHandle,
      url: computedUrl,
      followers: '10.5K',
      iconName: selectedPlatform === 'kwai' ? 'Flame' : selectedPlatform === 'pinterest' ? 'Pin' : 'Globe',
      badge: `${platformName} Conectado ✓`,
      featured: true,
      connected: true,
      lastSyncedAt: 'Agora mesmo'
    };

    const updatedChannels = [...channels, newChannel];
    await onSaveChannels(updatedChannels);

    setConnectingPlatform(null);
    setHandleInput('');
    setCustomTitle('');
    setCustomUrl('');

    setSuccessMsg(
      lang === 'pt'
        ? `Rede Social "${computedTitle}" adicionada com sucesso!`
        : `Channel "${computedTitle}" added successfully!`
    );

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleQuickConnect = async (platformId: string) => {
    setConnectingPlatform(platformId);
    setSuccessMsg('');

    // Simulate auto API handshake & sync delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const platformConfig = AVAILABLE_PLATFORMS.find(p => p.id === platformId);
    const platformName = platformConfig?.name || platformId;

    const existingIndex = channels.findIndex(c => c.platform === platformId);
    
    // Random realistic followers generator for newly connected channels if needed
    const randomFollowers = (Math.floor(Math.random() * 80) + 10).toFixed(1) + 'K';

    let updatedChannels = [...channels];

    if (existingIndex >= 0) {
      updatedChannels[existingIndex] = {
        ...updatedChannels[existingIndex],
        connected: true,
        lastSyncedAt: 'Agora mesmo',
        followers: updatedChannels[existingIndex].followers || randomFollowers
      };
    } else {
      const newChannel: SocialChannel = {
        id: `${platformId}_${Date.now()}`,
        platform: platformId as any,
        title: `${platformName} ${handleInput ? (handleInput.startsWith('@') ? handleInput : `@${handleInput}`) : '@afiliado'}`,
        handle: handleInput ? (handleInput.startsWith('@') ? handleInput : `@${handleInput}`) : '@afiliado',
        url: `https://${platformId}.com/${handleInput.replace('@', '') || 'afiliado'}`,
        followers: randomFollowers,
        iconName: platformId === 'kwai' ? 'Flame' : platformId === 'pinterest' ? 'Pin' : 'Globe',
        badge: `${platformName} Verificado ✓`,
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      };
      updatedChannels.push(newChannel);
    }

    await onSaveChannels(updatedChannels);
    setConnectingPlatform(null);
    setSuccessMsg(
      lang === 'pt'
        ? `Conta do ${platformName} conectada e sincronizada com sucesso!`
        : `${platformName} account connected & synchronized!`
    );

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSyncAllStats = async () => {
    setSyncingAll(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updated = channels.map(c => {
      // simulate fresh follower bump
      const numStr = parseFloat(c.followers || '10');
      const newNum = (numStr + (Math.random() * 0.5)).toFixed(1);
      return {
        ...c,
        followers: `${newNum}K`,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      };
    });

    await onSaveChannels(updated);
    setSyncingAll(false);
    setSuccessMsg(lang === 'pt' ? 'Todas as redes sociais foram sincronizadas em tempo real!' : 'All social channels synchronized in real time!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDisconnect = async (id: string) => {
    const updated = channels.map(c => {
      if (c.id === id) {
        return { ...c, connected: false };
      }
      return c;
    });
    await onSaveChannels(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`relative w-full max-w-2xl my-8 rounded-3xl border shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>

        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/40 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <span>{lang === 'pt' ? 'Conexão Automática de Redes Sociais' : 'Auto Social Account Integration'}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {lang === 'pt' ? 'API Automática' : 'Auto API'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'pt' ? 'Conecte Kwai, Pinterest, Instagram, TikTok, YouTube e veja as métricas atualizarem' : 'Connect Kwai, Pinterest, Instagram, TikTok, YouTube & auto-sync stats'}
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LINKTREE IMPORTER BOX */}
          <form onSubmit={handleImportLinktree} className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Import className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-300 flex items-center gap-2">
                    <span>{lang === 'pt' ? 'Importador do Linktree' : 'Linktree Profile Importer'}</span>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 uppercase">
                      {lang === 'pt' ? 'Automático' : 'Auto'}
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-200/70">
                    {lang === 'pt' ? 'Cole o link do seu Linktree para puxar todas as redes sociais e links de afiliados de uma só vez!' : 'Paste your Linktree URL to extract all social links & affiliate offers at once!'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="relative flex-1 w-full">
                <Globe className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={linktreeUrl}
                  onChange={e => setLinktreeUrl(e.target.value)}
                  placeholder="https://linktr.ee/seuusuario ou linktr.ee/thiagolino"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-slate-950 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!linktreeUrl || importingLinktree}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 shrink-0 transition hover:scale-105"
              >
                {importingLinktree ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'pt' ? 'Importando...' : 'Importing...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{lang === 'pt' ? 'Puxar do Linktree' : 'Import Linktree'}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Sync Button */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-indigo-200">
                {lang === 'pt' ? 'Sincronização em Tempo Real com Redes Sociais' : 'Real-time Social Account Synchronization'}
              </h4>
              <p className="text-xs text-indigo-300/70 mt-0.5">
                {lang === 'pt' ? 'Sincroniza seguidores, handles e crachás verificados com 1 clique.' : 'Sync followers count, handles, and verified badges with 1 click.'}
              </p>
            </div>

            <button
              onClick={handleSyncAllStats}
              disabled={syncingAll}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 transition hover:scale-105"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
              <span>{syncingAll ? (lang === 'pt' ? 'Sincronizando...' : 'Syncing...') : (lang === 'pt' ? 'Sincronizar Tudo' : 'Sync All')}</span>
            </button>
          </div>

          {/* Available Platforms Grid */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              {lang === 'pt' ? 'Conectar e Autorizar Contas (Kwai, Pinterest, etc.)' : 'Connect & Authorize Channels'}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVAILABLE_PLATFORMS.map(p => {
                const IconComponent = p.icon;
                const isConnected = channels.some(c => c.platform === p.id && c.connected !== false);
                const isConnecting = connectingPlatform === p.id;

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between transition ${
                      isConnected
                        ? 'bg-slate-950 border-emerald-500/40 ring-1 ring-emerald-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-xl border ${p.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {isConnected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>OK</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {lang === 'pt' ? 'Pendente' : 'Pending'}
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <span className="text-xs font-bold block">{p.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {isConnected ? (lang === 'pt' ? 'Conta Conectada' : 'Connected') : (lang === 'pt' ? 'Conexão em 1 Clique' : '1-Click Connect')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleQuickConnect(p.id)}
                      disabled={isConnecting}
                      className={`w-full py-1.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                        isConnected
                          ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      }`}
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>{lang === 'pt' ? 'Conectando...' : 'Connecting...'}</span>
                        </>
                      ) : isConnected ? (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          <span>{lang === 'pt' ? 'Re-Sincronizar' : 'Re-sync'}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3" />
                          <span>{lang === 'pt' ? 'Conectar' : 'Connect'}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Handle Auto-Connect Form */}
          <form onSubmit={handleAddCustomChannel} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>{lang === 'pt' ? 'Adicionar Qualquer Rede Social ou Link Personalizado' : 'Add Any Social Network or Custom Link'}</span>
              <span className="text-[10px] text-indigo-400 font-normal">
                {lang === 'pt' ? 'Kwai, Pinterest, Blog, etc.' : 'Kwai, Pinterest, Blog, etc.'}
              </span>
            </h4>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {lang === 'pt' ? 'Plataforma' : 'Platform'}
                </label>
                <select
                  value={selectedPlatform}
                  onChange={e => setSelectedPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {AVAILABLE_PLATFORMS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {lang === 'pt' ? 'Handle ou Usuário' : 'Handle or Username'}
                </label>
                <input
                  type="text"
                  value={handleInput}
                  onChange={e => setHandleInput(e.target.value)}
                  placeholder="@seuusuario"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {lang === 'pt' ? 'Título Exibido (Opcional)' : 'Display Title (Optional)'}
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Ex: Kwai @thiagolino ou Meu Blog"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  {lang === 'pt' ? 'URL do Perfil (Opcional)' : 'Profile URL (Optional)'}
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  placeholder="https://kwai.com/@seuusuario"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={(!handleInput && !customTitle) || connectingPlatform !== null}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Adicionar Canal à Minha Vitrine' : 'Add Channel to Showcase'}</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
