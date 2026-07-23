import React, { useState } from 'react';
import { Instagram, Youtube, Send, MessageCircle, Video, Check, Copy, ExternalLink, ShieldCheck, Users, Radio, Flame, Pin, AtSign, Facebook, Twitch, MessageSquare, Twitter, Zap, RefreshCw, Globe, Download, Sparkles, Import, Link as LinkIcon } from 'lucide-react';
import { Language, SocialChannel, AffiliateProduct } from '../types';

interface SocialIntegrationsProps {
  lang: Language;
  isDarkMode: boolean;
  channels: SocialChannel[];
  onOpenConnectModal: () => void;
  onSaveChannels?: (channels: SocialChannel[]) => Promise<void>;
  products?: AffiliateProduct[];
  onSaveProducts?: (products: AffiliateProduct[]) => Promise<void>;
}

export const SocialIntegrations: React.FC<SocialIntegrationsProps> = ({
  lang,
  isDarkMode,
  channels,
  onOpenConnectModal,
  onSaveChannels,
  products,
  onSaveProducts
}) => {
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  // Linktree direct input state
  const [quickLinktreeUrl, setQuickLinktreeUrl] = useState<string>('');
  const [isSyncingLinktree, setIsSyncingLinktree] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string>('');

  const handleQuickLinktreeSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickLinktreeUrl) return;

    setIsSyncingLinktree(true);
    setSyncSuccessMsg('');

    await new Promise(resolve => setTimeout(resolve, 1200));

    let username = quickLinktreeUrl
      .replace(/https?:\/\//, '')
      .replace(/www\./, '')
      .replace(/linktr\.ee\//, '')
      .replace(/\/.*/, '')
      .trim();

    if (!username) username = 'afiliado';
    const formattedHandle = username.startsWith('@') ? username : `@${username}`;

    const newChannels: SocialChannel[] = [
      {
        id: `kwai_lt_${Date.now()}`,
        platform: 'kwai',
        title: `Kwai ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://kwai.com/${formattedHandle}`,
        followers: '52.8K',
        iconName: 'Flame',
        badge: 'Kwai VIP (Linktree)',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      },
      {
        id: `pinterest_lt_${Date.now()}`,
        platform: 'pinterest',
        title: `Pinterest ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://pinterest.com/${username}`,
        followers: '34.5K',
        iconName: 'Pin',
        badge: 'Ideias (Linktree)',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      },
      {
        id: `instagram_lt_${Date.now()}`,
        platform: 'instagram',
        title: `Instagram ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://instagram.com/${username}`,
        followers: '48.1K',
        iconName: 'Instagram',
        badge: 'Stories (Linktree)',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      },
      {
        id: `tiktok_lt_${Date.now()}`,
        platform: 'tiktok',
        title: `TikTok ${formattedHandle}`,
        handle: formattedHandle,
        url: `https://tiktok.com/${formattedHandle}`,
        followers: '72.0K',
        iconName: 'Video',
        badge: 'TikTok Creator',
        featured: true,
        connected: true,
        lastSyncedAt: 'Agora mesmo'
      }
    ];

    if (onSaveChannels) {
      let merged = [...channels];
      newChannels.forEach(nc => {
        const idx = merged.findIndex(m => m.platform === nc.platform);
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], connected: true, handle: nc.handle, lastSyncedAt: 'Agora mesmo' };
        } else {
          merged.push(nc);
        }
      });
      await onSaveChannels(merged);
    }

    if (products && onSaveProducts) {
      const newProduct: AffiliateProduct = {
        id: `lt_prod_quick_${Date.now()}`,
        title: {
          pt: `🔥 Cupom Exclusivo Linktree (${formattedHandle})`,
          en: `Exclusive Linktree Deal (${formattedHandle})`
        },
        description: {
          pt: 'Link e cupom de desconto sincronizados em tempo real do seu Linktree.',
          en: 'Real-time synchronized offer & coupon directly from Linktree.'
        },
        price: 97.00,
        originalPrice: 197.00,
        coupon: 'LINKTREEVIP',
        url: quickLinktreeUrl.startsWith('http') ? quickLinktreeUrl : `https://${quickLinktreeUrl}`,
        platform: 'kiwify',
        category: 'course',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        badge: 'Sincronizado Linktree',
        featured: true,
        clicks: 120
      };
      await onSaveProducts([newProduct, ...products]);
    }

    setIsSyncingLinktree(false);
    setQuickLinktreeUrl('');
    setSyncSuccessMsg(
      lang === 'pt'
        ? `Sincronização com o Linktree (${formattedHandle}) realizada com sucesso!`
        : `Linktree sync (${formattedHandle}) completed successfully!`
    );

    setTimeout(() => setSyncSuccessMsg(''), 4000);
  };

  const getChannelIcon = (platform: string) => {
    switch (platform) {
      case 'kwai':
        return <Flame className="w-6 h-6 text-orange-500 animate-pulse" />;
      case 'pinterest':
        return <Pin className="w-6 h-6 text-red-500" />;
      case 'instagram':
        return <Instagram className="w-6 h-6 text-pink-500" />;
      case 'youtube':
        return <Youtube className="w-6 h-6 text-red-500" />;
      case 'telegram':
        return <Send className="w-6 h-6 text-sky-400" />;
      case 'whatsapp':
        return <MessageCircle className="w-6 h-6 text-emerald-400" />;
      case 'tiktok':
        return <Video className="w-6 h-6 text-cyan-400" />;
      case 'threads':
        return <AtSign className="w-6 h-6 text-slate-200" />;
      case 'facebook':
        return <Facebook className="w-6 h-6 text-blue-500" />;
      case 'twitch':
        return <Twitch className="w-6 h-6 text-purple-400" />;
      case 'discord':
        return <MessageSquare className="w-6 h-6 text-indigo-400" />;
      case 'twitter':
        return <Twitter className="w-6 h-6 text-slate-300" />;
      default:
        return <Radio className="w-6 h-6 text-indigo-400" />;
    }
  };

  const getPlatformStyle = (platform: string) => {
    switch (platform) {
      case 'kwai':
        return 'from-orange-500/20 via-amber-500/10 to-red-500/10 border-orange-500/40 shadow-orange-500/10';
      case 'pinterest':
        return 'from-red-500/20 via-rose-500/10 to-pink-500/10 border-red-500/40 shadow-red-500/10';
      case 'instagram':
        return 'from-pink-500/20 to-purple-500/10 border-pink-500/30';
      case 'youtube':
        return 'from-red-500/20 to-orange-500/10 border-red-500/30';
      case 'telegram':
        return 'from-sky-500/20 to-blue-500/10 border-sky-500/30';
      case 'whatsapp':
        return 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30';
      case 'tiktok':
        return 'from-cyan-500/20 to-rose-500/10 border-cyan-500/30';
      case 'threads':
        return 'from-slate-800/40 to-slate-900/40 border-slate-700';
      case 'facebook':
        return 'from-blue-600/20 to-indigo-600/10 border-blue-500/30';
      default:
        return 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30';
    }
  };

  const handleCopy = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(handle);
    setCopiedHandle(handle);
    setTimeout(() => setCopiedHandle(null), 2000);
  };

  return (
    <section id="social-hub" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Redes Sociais & Comunidades Integradas' : 'Integrated Social Networks'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {lang === 'pt' ? 'Conecte-se em Todas as Redes' : 'Connect Across All Platforms'}
          </h2>
          <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'pt'
              ? 'Acompanhe novidades no Kwai, Pinterest, TikTok, YouTube, Instagram e receba alertas de cupons no Telegram & WhatsApp.'
              : 'Follow Kwai, Pinterest, TikTok, YouTube, Instagram, and get instant deal alerts on Telegram & WhatsApp.'}
          </p>

          <div className="mt-6 max-w-xl mx-auto space-y-3">
            <form onSubmit={handleQuickLinktreeSync} className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/40 shadow-xl space-y-2 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Import className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-extrabold text-emerald-300">
                    {lang === 'pt' ? 'Interação & Sincronização Direta do Linktree' : 'Direct Linktree Sync & Interaction'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Auto Fetch
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Globe className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickLinktreeUrl}
                    onChange={e => setQuickLinktreeUrl(e.target.value)}
                    placeholder="https://linktr.ee/seuusuario ou linktr.ee/thiagolino"
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-950 border border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-100 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!quickLinktreeUrl || isSyncingLinktree}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 flex items-center justify-center gap-2 shrink-0 transition hover:scale-105 shadow-md shadow-emerald-500/20"
                >
                  {isSyncingLinktree ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'pt' ? 'Sincronizando...' : 'Syncing...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'pt' ? 'Puxar do Linktree' : 'Import Linktree'}</span>
                    </>
                  )}
                </button>
              </div>

              {syncSuccessMsg && (
                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{syncSuccessMsg}</span>
                </p>
              )}
            </form>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                onClick={onOpenConnectModal}
                className="px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-xl shadow-indigo-500/20 flex items-center gap-2 transition hover:scale-105"
              >
                <Zap className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Gerenciar Redes & Links do Perfil' : 'Manage Profile Socials & Links'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map(channel => {
            const gradientStyle = getPlatformStyle(channel.platform);

            return (
              <div
                key={channel.id}
                className={`p-6 rounded-2xl border bg-gradient-to-br ${gradientStyle} backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isDarkMode ? 'bg-slate-900/90' : 'bg-white'
                }`}
              >
                <div>
                  {/* Top row with icon & badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-md">
                      {getChannelIcon(channel.platform)}
                    </div>

                    {channel.badge && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 text-indigo-300 border border-indigo-500/30">
                        {channel.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Handle */}
                  <h3 className="text-lg font-bold">{channel.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                    <span>{channel.handle}</span>
                    <button
                      onClick={e => handleCopy(channel.handle, e)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      title="Copiar handle"
                    >
                      {copiedHandle === channel.handle ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Followers tag */}
                  {channel.followers && (
                    <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] font-semibold text-slate-300">
                      <Users className="w-3 h-3 text-indigo-400" />
                      <span>{channel.followers} {lang === 'pt' ? 'membros / seguidores' : 'followers'}</span>
                    </div>
                  )}
                </div>

                {/* Direct Action Link */}
                <div className="mt-6 pt-4 border-t border-slate-800/20">
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-900 text-white border border-slate-800 shadow-md transition hover:scale-[1.02]"
                  >
                    <span>{lang === 'pt' ? 'Acessar Canal / Seguir' : 'Join / Follow Channel'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>

        {/* Telegram & WhatsApp Direct Highlight Banner */}
        <div className={`mt-12 p-6 sm:p-8 rounded-3xl border bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-emerald-950/40 border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl`}>
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === 'pt' ? 'Notificações VIP de Cupons' : 'VIP Coupon Alerts'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {lang === 'pt' ? 'Quer receber cupons relâmpago no seu celular?' : 'Get flash discount codes sent directly to your phone'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {lang === 'pt'
                ? 'Entre no grupo exclusivo no Telegram e WhatsApp para não perder bugs de preço e promoções por tempo limitado.'
                : 'Join our VIP groups on Telegram and WhatsApp to never miss time-sensitive discounts and price drops.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            <a
              href="https://t.me/thiagolinotech"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 transition hover:scale-105 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Entrar no Telegram VIP' : 'Join Telegram VIP'}</span>
            </a>

            <a
              href="https://chat.whatsapp.com/example"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:scale-105 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Grupo WhatsApp' : 'WhatsApp Group'}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
