import React, { useState } from 'react';
import { X, Smartphone, Share2, Copy, Check, Sparkles, SlidersHorizontal, QrCode, ExternalLink, Globe, DollarSign, Flame, Pin, Instagram, Youtube, Send, Video, ShoppingBag, Eye, MousePointerClick, TrendingUp, ShieldCheck } from 'lucide-react';
import { Language, SocialChannel, AffiliateProduct } from '../types';
import { PROFILE } from '../data/websiteData';

interface LinktreeMobilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  channels: SocialChannel[];
  products: AffiliateProduct[];
  pixKey: string;
  onOpenAdmin: () => void;
  isDarkMode: boolean;
  customAvatarUrl?: string;
}

type ThemeType = 'emerald' | 'dark' | 'gold' | 'cyber' | 'milk';

export const LinktreeMobilePreviewModal: React.FC<LinktreeMobilePreviewModalProps> = ({
  isOpen,
  onClose,
  lang,
  channels,
  products,
  pixKey,
  onOpenAdmin,
  isDarkMode,
  customAvatarUrl
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('emerald');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCopyCoupon = (coupon: string) => {
    navigator.clipboard.writeText(coupon);
    setCopiedCoupon(coupon);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const getThemeStyles = () => {
    switch (selectedTheme) {
      case 'emerald':
        return {
          bg: 'bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950',
          cardBg: 'bg-emerald-900/40 border-emerald-500/30 text-white hover:bg-emerald-800/50',
          accentBtn: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          textMuted: 'text-emerald-200/70',
        };
      case 'dark':
        return {
          bg: 'bg-gradient-to-b from-slate-950 via-slate-900 to-black',
          cardBg: 'bg-slate-900/80 border-slate-800 text-slate-100 hover:bg-slate-800',
          accentBtn: 'bg-indigo-600 text-white hover:bg-indigo-500 font-bold',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          textMuted: 'text-slate-400',
        };
      case 'gold':
        return {
          bg: 'bg-gradient-to-b from-slate-950 via-amber-950/80 to-slate-950',
          cardBg: 'bg-amber-950/40 border-amber-500/40 text-amber-100 hover:bg-amber-900/50',
          accentBtn: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 font-black',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          textMuted: 'text-amber-200/70',
        };
      case 'cyber':
        return {
          bg: 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950',
          cardBg: 'bg-purple-900/40 border-pink-500/40 text-pink-100 hover:bg-purple-800/50',
          accentBtn: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black hover:opacity-90',
          badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
          textMuted: 'text-purple-200/70',
        };
      case 'milk':
        return {
          bg: 'bg-gradient-to-b from-slate-100 via-slate-50 to-white',
          cardBg: 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-sm',
          accentBtn: 'bg-slate-900 text-white hover:bg-slate-800 font-extrabold',
          badge: 'bg-slate-200 text-slate-700 border-slate-300',
          textMuted: 'text-slate-500',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'pt' ? 'Simulador do App Linktree (Mobile Live Preview)' : 'Linktree App Smartphone Simulator'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'pt'
                  ? 'Veja em tempo real como seus visitantes navegam no seu perfil do Linktree no celular.'
                  : 'See in real-time how mobile visitors interact with your Linktree showcase.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'pt' ? 'Editar Links' : 'Edit Links'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body Grid */}
        <div className="grid lg:grid-cols-12 gap-6 p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950">
          
          {/* LEFT SIDE: CONTROL PANEL & ANALYTICS BAR */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Quick Analytics Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'pt' ? 'Métricas do Linktree' : 'Linktree Metrics'}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  +24.5% CTR
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'pt' ? 'Visualizações' : 'Views'}</span>
                  </div>
                  <div className="text-lg font-black text-white mt-1">14.8K</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'pt' ? 'Cliques Únicos' : 'Unique Clicks'}</span>
                  </div>
                  <div className="text-lg font-black text-emerald-400 mt-1">4.520</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-300 uppercase font-bold">Comissões Estimadas:</span>
                  <p className="text-base font-extrabold text-emerald-400">R$ 5.480,00</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Theme Customizer Switcher */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'pt' ? 'Estilo do Perfil no Celular' : 'Mobile Theme Style'}</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'emerald', name: 'Emerald VIP', color: 'from-emerald-600 to-teal-800' },
                  { id: 'dark', name: 'Dark Luxury', color: 'from-slate-800 to-indigo-950' },
                  { id: 'gold', name: 'Gold Pro', color: 'from-amber-500 to-yellow-700' },
                  { id: 'cyber', name: 'Cyberpunk', color: 'from-pink-600 to-purple-800' },
                  { id: 'milk', name: 'Milk Light', color: 'from-slate-200 to-white' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id as ThemeType)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      selectedTheme === t.id
                        ? 'border-indigo-500 ring-2 ring-indigo-500/50 bg-slate-800 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${t.color} shrink-0`} />
                    <span className="text-xs font-bold truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Share Profile Button */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-extrabold text-slate-200">
                  {lang === 'pt' ? 'Link Direto da Vitrine' : 'Showcase Link'}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                  {window.location.href}
                </p>
              </div>

              <button
                onClick={handleShareProfile}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Compartilhar' : 'Share')}</span>
              </button>
            </div>

          </div>

          {/* RIGHT SIDE: SMARTPHONE DEVICE MOCKUP */}
          <div className="lg:col-span-7 flex justify-center items-center py-2">
            
            {/* Phone Outer Shell */}
            <div className="w-[340px] sm:w-[370px] h-[650px] rounded-[48px] bg-slate-950 border-[10px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-slate-700/50">
              
              {/* iPhone Notch / Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-black z-30 flex items-center justify-end px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
              </div>

              {/* Inside Phone Screen Scrollable Area */}
              <div className={`w-full h-full overflow-y-auto pt-10 pb-8 px-4 space-y-4 ${theme.bg} transition-colors duration-300 no-scrollbar`}>
                
                {/* Profile Header */}
                <div className="text-center space-y-2">
                  <div className="relative inline-block">
                    <img
                      src={customAvatarUrl || PROFILE.avatarUrl}
                      alt={PROFILE.name}
                      className="w-20 h-20 rounded-2xl object-cover mx-auto ring-2 ring-emerald-400/80 shadow-lg"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] shadow-md">
                      ✓
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white">{PROFILE.name}</h3>
                    <p className={`text-xs ${theme.textMuted}`}>{PROFILE.role[lang]}</p>
                  </div>

                  {/* Social Buttons Row */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {channels.slice(0, 5).map((ch) => (
                      <a
                        key={ch.id}
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-xl border text-xs transition ${theme.cardBg}`}
                        title={ch.title}
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* PROMINENT PIX SUPPORT BOX INSIDE MOBILE */}
                <div className={`p-3.5 rounded-2xl border space-y-2 ${theme.cardBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black uppercase text-emerald-400">
                        Pix do Linktree
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      Oficial
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-slate-300 truncate">
                    Chave: {pixKey}
                  </p>

                  <button
                    onClick={handleCopyPix}
                    className={`w-full py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition ${theme.accentBtn}`}
                  >
                    {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPix ? (lang === 'pt' ? 'Chave Copiada!' : 'Copied!') : (lang === 'pt' ? 'Copiar Pix' : 'Copy Pix')}</span>
                  </button>
                </div>

                {/* LINKTREE LINKS LIST */}
                <div className="space-y-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1 ${theme.textMuted}`}>
                    {lang === 'pt' ? 'Links & Redes Sociais' : 'Links & Accounts'}
                  </span>

                  {channels.map((chan) => (
                    <a
                      key={chan.id}
                      href={chan.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold transition hover:scale-[1.02] ${theme.cardBg}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-indigo-500/20 text-indigo-300 uppercase">
                          {chan.platform}
                        </span>
                        <span className="truncate">{chan.title}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </a>
                  ))}
                </div>

                {/* FEATURED AFFILIATE PRODUCTS */}
                <div className="space-y-2 pt-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1 ${theme.textMuted}`}>
                    {lang === 'pt' ? '🔥 Ofertas & Cursos de Afiliado' : '🔥 Affiliate Deals'}
                  </span>

                  {products.slice(0, 3).map((prod) => (
                    <div
                      key={prod.id}
                      className={`p-3 rounded-2xl border space-y-2 text-xs ${theme.cardBg}`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title[lang]}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold truncate text-white">{prod.title[lang] || prod.title.pt}</h5>
                          <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                            <span className="text-emerald-400 font-extrabold">R$ {(prod.price || 0).toFixed(2)}</span>
                            {prod.originalPrice && (
                              <span className="line-through text-slate-500 text-[10px]">
                                R$ {prod.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {prod.coupon && (
                        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] font-mono text-amber-300 font-bold">
                            Cupom: {prod.coupon}
                          </span>
                          <button
                            onClick={() => handleCopyCoupon(prod.coupon!)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                          >
                            {copiedCoupon === prod.coupon ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      )}

                      <a
                        href={prod.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${theme.accentBtn}`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{lang === 'pt' ? 'Acessar Oferta' : 'Get Offer'}</span>
                      </a>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-3 pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Vitrine Oficial de Afiliados © 2026
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
