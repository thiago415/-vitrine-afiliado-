import React, { useState } from 'react';
import { Language, SocialChannel, AffiliateProduct } from '../types';
import {
  Youtube,
  Instagram,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Search,
  Share2,
  Copy,
  Check,
  ShoppingBag,
  Video,
  Code,
  Globe,
  Radio,
  ChevronRight,
  QrCode,
  DollarSign,
  Sparkles,
  Heart,
  Send,
  Flame,
  Pin,
  X,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface LinksSectionProps {
  lang: Language;
  isDarkMode: boolean;
  channels?: SocialChannel[];
  products?: AffiliateProduct[];
  pixKey?: string;
  onOpenConnectModal?: () => void;
}

export const LinksSection: React.FC<LinksSectionProps> = ({
  lang,
  isDarkMode,
  channels = [],
  products = [],
  pixKey = 'thiagolino974@gmail.com',
  onOpenConnectModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'pix' | 'social' | 'deals' | 'gear'>('all');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Linktree default curated links
  const defaultLinks = [
    {
      id: 'youtube',
      category: 'social',
      title: lang === 'pt' ? 'Canal Oficial no YouTube' : 'Official YouTube Channel',
      desc: lang === 'pt' ? 'Tutoriais semanais de código, dicas e reviews' : 'Weekly dev tutorials, tech reviews & code walkthroughs',
      url: 'https://youtube.com',
      icon: <Youtube className="w-5 h-5 text-red-500" />,
      badge: '100K Subs'
    },
    {
      id: 'telegram',
      category: 'social',
      title: lang === 'pt' ? 'Grupo VIP no Telegram (Alertas de Cupons)' : 'VIP Telegram Deal Channel',
      desc: lang === 'pt' ? 'Receba cupons e ofertas em primeira mão' : 'Get instant coupon alerts & tech discounts',
      url: 'https://t.me',
      icon: <Send className="w-5 h-5 text-sky-400" />,
      badge: 'Alertas 24/7'
    },
    {
      id: 'gear-setup',
      category: 'gear',
      title: lang === 'pt' ? 'Meu Setup de Trabalho & Equipamentos' : 'Desk & Studio Gear Setup',
      desc: lang === 'pt' ? 'Monitores, teclados mecânicos, microfones e periféricos' : 'Top monitors, mechanical keyboards, audio mics & ergonomic gear',
      url: '#affiliate-deals',
      icon: <ShoppingBag className="w-5 h-5 text-amber-400" />,
      badge: lang === 'pt' ? 'Recomendado' : 'Recommended'
    },
    {
      id: 'masterclass',
      category: 'gear',
      title: lang === 'pt' ? 'Curso Full Stack JavaScript' : 'Full-Stack JavaScript Masterclass',
      desc: lang === 'pt' ? 'Aprenda React, TypeScript, Node.js e Serverless do zero' : 'Learn React, TypeScript, Node.js & Serverless from scratch',
      url: '#affiliate-deals',
      icon: <Code className="w-5 h-5 text-emerald-400" />,
      badge: 'Masterclass'
    },
    {
      id: 'github',
      category: 'social',
      title: lang === 'pt' ? 'Repositórios no GitHub' : 'GitHub Open Source Projects',
      desc: lang === 'pt' ? 'Projetos open-source, templates e trechos de código' : 'Open-source tools, app templates & code repositories',
      url: 'https://github.com',
      icon: <Github className="w-5 h-5 text-slate-200" />,
      badge: '40+ Repos'
    }
  ];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const filteredLinks = defaultLinks.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || l.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="links" className="py-20 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header / Linktree Avatar Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Hub Estilo Linktree & Pix' : 'Linktree Hub & Pix Support'}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {lang === 'pt' ? 'Todos os Links em Um Só Lugar' : 'All Links & Support in One Place'}
          </h2>
          <p className={`text-sm max-w-xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'pt'
              ? 'Navegue por categorias separadas: Apoio via Pix, redes sociais conectadas, cupons de afiliados e recomendados.'
              : 'Separated categories: Pix support, connected social accounts, deal coupons & top resources.'}
          </p>
        </div>

        {/* PROMINENT PIX DO LINKTREE CARD */}
        {(activeCategory === 'all' || activeCategory === 'pix') && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <DollarSign className="w-8 h-8 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                      PIX OFICIAL
                    </span>
                    <span className="text-xs font-semibold text-emerald-400/80">
                      {lang === 'pt' ? 'Apoio Direto ao Projetos' : 'Direct Support'}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white mt-1">
                    {lang === 'pt' ? 'Pix do Linktree (Apoie o Criador)' : 'Linktree Pix Support'}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5 break-all">
                    Chave: <span className="text-emerald-300 font-bold">{pixKey}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                <button
                  onClick={handleCopyPix}
                  className={`flex-1 md:flex-none px-5 py-3 rounded-2xl text-xs font-extrabold shadow-xl flex items-center justify-center gap-2 transition hover:scale-105 ${
                    copiedPix
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{lang === 'pt' ? 'Chave PIX Copiada!' : 'PIX Key Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{lang === 'pt' ? 'Copiar Chave PIX' : 'Copy PIX Key'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-3 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-2 transition hover:scale-105 shrink-0"
                  title="Ver QR Code PIX"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{lang === 'pt' ? 'QR Code' : 'QR Code'}</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* CATEGORY SEPARATION TABS (Linktree Style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {[
            { id: 'all', label: lang === 'pt' ? 'Todos os Links' : 'All Links', icon: <Globe className="w-3.5 h-3.5" /> },
            { id: 'pix', label: lang === 'pt' ? '💸 Pix do Linktree' : '💸 Pix Support', icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> },
            { id: 'social', label: lang === 'pt' ? '📱 Redes Sociais' : '📱 Social Accounts', icon: <Zap className="w-3.5 h-3.5 text-indigo-400" /> },
            { id: 'deals', label: lang === 'pt' ? '🔥 Ofertas & Cupons' : '🔥 Affiliate Deals', icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> },
            { id: 'gear', label: lang === 'pt' ? '💻 Setup & Cursos' : '💻 Setup & Courses', icon: <Code className="w-3.5 h-3.5 text-blue-400" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 border transition flex items-center gap-1.5 ${
                activeCategory === tab.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search & Share Control Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'pt' ? 'Buscar nos links...' : 'Search links...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                isDarkMode
                  ? 'bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500'
                  : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
              }`}
            />
          </div>

          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 border transition ${
              copiedLink
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Compartilhar' : 'Share')}</span>
          </button>
        </div>

        {/* INDIVIDUAL AFFILIATE PRODUCTS LIST (IF CATEGORY IS 'ALL' OR 'DEALS' OR 'GEAR') */}
        {(activeCategory === 'all' || activeCategory === 'deals' || activeCategory === 'gear') && products.length > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'pt' ? 'Produtos & Links de Afiliado Cadastrados' : 'Posted Individual Affiliate Products'}</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">
                {products.length} {lang === 'pt' ? 'links ativos' : 'active links'}
              </span>
            </div>

            <div className="grid gap-3">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 hover:scale-[1.01] ${
                    isDarkMode
                      ? 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-amber-500/40'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <img
                      src={prod.imageUrl}
                      alt={prod.title[lang] || prod.title.pt}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-slate-800"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          {prod.platform}
                        </span>
                        {prod.badge && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-300">
                            {prod.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-extrabold truncate mt-1 text-white">
                        {prod.title[lang] || prod.title.pt}
                      </h4>

                      <div className="flex items-center gap-3 mt-1 text-xs font-mono">
                        <span className="text-emerald-400 font-extrabold">
                          R$ {(prod.price || 0).toFixed(2)}
                        </span>
                        {prod.coupon && (
                          <span className="text-[11px] text-indigo-300 font-bold">
                            Cupom: <span className="text-white underline">{prod.coupon}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href={prod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 transition shrink-0 shadow-md shadow-amber-500/10"
                  >
                    <span>{lang === 'pt' ? 'Ir ao Produto' : 'Open Link'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONNECTED SOCIAL CHANNELS LIST (IF CATEGORY IS 'ALL' OR 'SOCIAL') */}
        {(activeCategory === 'all' || activeCategory === 'social') && channels.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'pt' ? 'Redes Sociais Conectadas' : 'Connected Social Accounts'}</span>
              </span>
              {onOpenConnectModal && (
                <button
                  onClick={onOpenConnectModal}
                  className="text-xs text-indigo-400 font-bold hover:underline"
                >
                  + {lang === 'pt' ? 'Gerenciar' : 'Manage'}
                </button>
              )}
            </div>

            <div className="grid gap-2.5">
              {channels.map((chan) => (
                <a
                  key={chan.id}
                  href={chan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-200 hover:scale-[1.01] ${
                    isDarkMode
                      ? 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                      {chan.platform}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold truncate">{chan.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{chan.handle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {chan.badge && (
                      <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {chan.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* MAIN QUICK LINKS LIST */}
        <div className="space-y-3">
          {(activeCategory === 'all' || activeCategory === 'social' || activeCategory === 'gear') && (
            <div className="flex items-center px-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span>{lang === 'pt' ? 'Links Importantes & Recomendados' : 'Important Links & Resources'}</span>
              </span>
            </div>
          )}

          {filteredLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] ${
                isDarkMode
                  ? 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/40'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
                isDarkMode ? 'bg-slate-800 border border-slate-700/50' : 'bg-slate-100 border border-slate-200'
              }`}>
                {link.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate group-hover:text-indigo-400 transition">
                    {link.title}
                  </h3>
                  {link.badge && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {link.badge}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {link.desc}
                </p>
              </div>

              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                isDarkMode ? 'text-slate-500 group-hover:text-indigo-400' : 'text-slate-400 group-hover:text-indigo-600'
              }`} />
            </a>
          ))}
        </div>

      </div>

      {/* QR CODE PIX MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center space-y-5 shadow-2xl relative">
            
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">
                {lang === 'pt' ? 'Escaneie para Pagar via PIX' : 'Scan to Pay via PIX'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'pt' ? 'Abra o app do seu banco e escolha Pagamento via QR Code' : 'Open your banking app and scan the code below'}
              </p>
            </div>

            {/* Generated Mock QR Code graphic */}
            <div className="p-4 rounded-2xl bg-white mx-auto inline-block border-4 border-emerald-500 shadow-inner">
              <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="white" />
                <path d="M10 10H40V40H10V10ZM15 15V35H35V15H15ZM20 20H30V30H20V20Z" fill="#020617" />
                <path d="M60 10H90V40H60V10ZM65 15V35H85V15H65ZM70 20H80V30H70V20Z" fill="#020617" />
                <path d="M10 60H40V90H10V60ZM15 65V85H35V65H15ZM20 70H30V80H20V70Z" fill="#020617" />
                <rect x="50" y="50" width="10" height="10" fill="#020617" />
                <rect x="70" y="50" width="10" height="20" fill="#020617" />
                <rect x="50" y="70" width="20" height="10" fill="#020617" />
                <rect x="80" y="80" width="10" height="10" fill="#020617" />
                <circle cx="50" cy="30" r="5" fill="#10b981" />
              </svg>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Chave PIX:</span>
              <p className="text-xs font-mono font-bold text-emerald-400 select-all break-all">{pixKey}</p>
            </div>

            <button
              onClick={handleCopyPix}
              className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition"
            >
              {copiedPix ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPix ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Copiar Chave PIX' : 'Copy PIX Key')}</span>
            </button>

          </div>
        </div>
      )}

    </section>
  );
};

