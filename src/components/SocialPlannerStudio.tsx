import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, Send, Share2, RefreshCw, Check, Copy, Flame, Pin, Instagram, Youtube, Video, MessageCircle, Globe, Wand2, BarChart2, ShieldCheck, Tag, Zap, ArrowRight, Layers, SlidersHorizontal } from 'lucide-react';
import { Language, SocialChannel, AffiliateProduct } from '../types';

interface SocialPlannerStudioProps {
  lang: Language;
  isDarkMode: boolean;
  channels: SocialChannel[];
  products: AffiliateProduct[];
  onOpenContact: () => void;
}

interface ScheduledPost {
  id: string;
  title: string;
  platforms: string[];
  date: string;
  time: string;
  content: string;
  hashtags: string[];
  affiliateUrl: string;
  status: 'scheduled' | 'published' | 'draft';
  impressions?: string;
  clicks?: number;
}

export const SocialPlannerStudio: React.FC<SocialPlannerStudioProps> = ({
  lang,
  isDarkMode,
  channels,
  products,
  onOpenContact
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['kwai', 'tiktok', 'instagram', 'pinterest']);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [postTone, setPostTone] = useState<'viral' | 'persuasive' | 'curiosity' | 'unboxing'>('viral');
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [scheduleDate, setScheduleDate] = useState<string>('2026-07-24');
  const [scheduleTime, setScheduleTime] = useState<string>('18:00');
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ai_generator' | 'calendar' | 'analytics'>('ai_generator');

  // Pre-populated planned calendar posts (Metricool / Publer style)
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([
    {
      id: 'post_1',
      title: '🔥 Cupom Secreto Shopee Achadinhos',
      platforms: ['kwai', 'tiktok', 'instagram'],
      date: '2026-07-24',
      time: '12:00',
      content: '🚨 Achadinho Secreto que NINGUÉM te contou! Link com 40% OFF no perfil do Linktree ou use o cupom LINKTREEVIP! 🛒👇',
      hashtags: ['#achadinhos', '#shopee', '#ofertas', '#promocao', '#afiliado'],
      affiliateUrl: 'https://linktr.ee/thiagolino?utm_source=kwai&utm_medium=viral',
      status: 'scheduled',
      clicks: 340
    },
    {
      id: 'post_2',
      title: '💻 Review Setup de Trabalho & Teclado Mecânico',
      platforms: ['youtube', 'pinterest', 'instagram'],
      date: '2026-07-25',
      time: '18:30',
      content: 'Mostrei em detalhes o setup dos sonhos para quem trabalha remoto. Todos os links das peças estão na nossa vitrine!',
      hashtags: ['#setup', '#desksetup', '#tecnologia', '#homeoffice', '#dicas'],
      affiliateUrl: 'https://linktr.ee/thiagolino?utm_source=youtube',
      status: 'scheduled',
      clicks: 580
    },
    {
      id: 'post_3',
      title: '🚀 Curso Full Stack JavaScript - Vagas Abertas',
      platforms: ['telegram', 'whatsapp', 'kwai'],
      date: '2026-07-23',
      time: '09:00',
      content: 'Aprenda React, Node e TypeScript do zero ao avançado. Desconto exclusivo liberado via PIX ou Cartão em 12x!',
      hashtags: ['#programacao', '#javascript', '#reactjs', '#desenvolvedor'],
      affiliateUrl: 'https://linktr.ee/thiagolino?utm_source=telegram',
      status: 'published',
      impressions: '18.4K',
      clicks: 1240
    }
  ]);

  const togglePlatform = (pId: string) => {
    if (selectedPlatforms.includes(pId)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter(p => p !== pId));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, pId]);
    }
  };

  const handleGenerateAICopy = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1000));

    const product = products.find(p => p.id === selectedProductId) || products[0];
    const prodTitle = product ? (product.title[lang] || product.title.pt) : 'Produto Especial Vitrine';
    const prodCoupon = product?.coupon ? `\n\n🎟️ **Cupom de Desconto Exclusivo:** ${product.coupon}` : '';
    const prodPrice = product?.price ? ` por apenas **R$ ${product.price.toFixed(2)}**!` : '!';

    let caption = '';
    let tags = '#afiliado #ofertas #achadinhos #promocao #linknabio #desconto';

    if (postTone === 'viral') {
      caption = `🚨 PARE TUDO! Você precisa ver isso antes que acabe! 🔥\n\nAcabei de liberar o link direto do **${prodTitle}**${prodPrice} Essa é a melhor oportunidade para você economizar hoje mesmo!${prodCoupon}\n\n👉 **Como garantir o seu:**\n1. Clique no Linktree no perfil\n2. Pegue o cupom exclusivo e aproveite o frete grátis!\n\nSalve este post e envie para um amigo que precisa disso! 🚀`;
      tags = '#viral #achadinhos #promocao #desconto #shopee #hotmart #linktree';
    } else if (postTone === 'persuasive') {
      caption = `💡 Se você busca transformar seus resultados, o **${prodTitle}** foi feito sob medida para você!${prodPrice}\n\nRecomendado por especialistas e testado na prática.${prodCoupon}\n\n🔗 Clique no link da Bio / Linktree e garanta com condição especial válida por tempo limitado!`;
      tags = '#dicas #produtividade #sucesso #transformacao #afiliado #kiwify';
    } else if (postTone === 'curiosity') {
      caption = `👀 Ninguém te conta a verdade sobre o **${prodTitle}**... Até agora! 🤫\n\nTestei pessoalmente e o resultado me surpreendeu demais! Vale cada centavo${prodPrice}${prodCoupon}\n\nConfira todos os detalhes e o link oficial na minha vitrine do Linktree! ⬇️`;
      tags = '#curiosidades #review #tecnologia #unboxing #recomendo';
    } else {
      caption = `📦 UNBOXING & REVIEW HONESTO: **${prodTitle}**! ⚡\n\nChegou super rápido e a qualidade é sensacional!${prodPrice}${prodCoupon}\n\nGaranta o seu direto na minha vitrine oficial pelo link do perfil! 🛒✨`;
      tags = '#unboxing #review #compras #achados #linknobio';
    }

    setGeneratedCaption(caption);
    setGeneratedHashtags(tags);
    setIsGenerating(false);
  };

  const handleAddScheduledPost = () => {
    if (!generatedCaption) return;

    const selectedProd = products.find(p => p.id === selectedProductId) || products[0];
    const directProductUrl = selectedProd?.url || window.location.href;

    const newPost: ScheduledPost = {
      id: `post_${Date.now()}`,
      title: generatedCaption.slice(0, 35) + '...',
      platforms: selectedPlatforms,
      date: scheduleDate,
      time: scheduleTime,
      content: generatedCaption,
      hashtags: generatedHashtags.split(' '),
      affiliateUrl: directProductUrl,
      status: 'scheduled',
      clicks: 0
    };

    setScheduledPosts([newPost, ...scheduledPosts]);
    setGeneratedCaption('');
    setActiveTab('calendar');
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(`${generatedCaption}\n\n${generatedHashtags}`);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  return (
    <section id="social-planner" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
            <Wand2 className="w-3.5 h-3.5 text-pink-400" />
            <span>{lang === 'pt' ? 'Estúdio de Conteúdo & Agendador Multi-Redes' : 'Multi-Channel AI Studio & Publisher'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {lang === 'pt'
              ? 'Poder de Metricool, Publer e Blog2Social em Um Só Lugar'
              : 'Metricool, Publer & Blog2Social AI Studio Combination'}
          </h2>

          <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'pt'
              ? 'Gere legendas virais, hashtages otimizadas e agende postagens simultâneas para Kwai, TikTok, Instagram, Pinterest, YouTube e Telegram.'
              : 'Generate viral AI captions, optimized hashtags and multi-publish across Kwai, TikTok, Instagram, Pinterest, YouTube & Telegram.'}
          </p>

          {/* 1-CLICK AUTOMATION PUBLICITY BANNER */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-amber-500/20 border border-purple-500/30 max-w-3xl mx-auto my-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-400 text-slate-950 font-black shrink-0">
                <Zap className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'pt' ? '🤖 Não sabe fazer divulgação? Ative o Piloto Automático' : '🤖 Don\'t know marketing? Activate Auto-Pilot'}</span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {lang === 'pt' ? 'O sistema escolhe os melhores produtos, cria textos virais com cupons e agenda a postagem em Kwai, TikTok, Instagram e Telegram sozinho.' : 'The system selects top products, writes viral copies with coupons, and schedules multi-platform posts automatically.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setIsGenerating(true);
                setTimeout(() => {
                  const autoPosts: ScheduledPost[] = [
                    {
                      id: `autopost_${Date.now()}_1`,
                      title: '🔥 [PILOTO AUTOMÁTICO] Post Viradão Kwai + TikTok',
                      platforms: ['kwai', 'tiktok', 'instagram'],
                      date: scheduleDate,
                      time: '12:00',
                      content: `🚨 PARE TUDO! Achadinho secreto com desconto exclusivo que ninguém te conta! 🛒🔥\n\nLink oficial do produto com cupom liberado no perfil! Pegue antes que acabe! 🚀`,
                      hashtags: ['#achadinhos', '#ofertas', '#promocao', '#desconto', '#linktree'],
                      affiliateUrl: products[0]?.url || 'https://linktr.ee/thiagolino',
                      status: 'scheduled',
                      clicks: 140
                    },
                    {
                      id: `autopost_${Date.now()}_2`,
                      title: '⚡ [PILOTO AUTOMÁTICO] Alerta de Ofertas Telegram & WhatsApp',
                      platforms: ['telegram', 'whatsapp'],
                      date: scheduleDate,
                      time: '18:00',
                      content: `📢 Cupom de frete grátis e desconto direto no produto mais vendido da semana! Acesse o Linktree e garanta a oferta antes da virada do lote.`,
                      hashtags: ['#cupom', '#promocao', '#freetrafic', '#desconto'],
                      affiliateUrl: products[1]?.url || 'https://linktr.ee/thiagolino',
                      status: 'scheduled',
                      clicks: 85
                    }
                  ];
                  setScheduledPosts(prev => [...autoPosts, ...prev]);
                  setIsGenerating(false);
                  setActiveTab('calendar');
                }, 800);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md transition shrink-0 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{lang === 'pt' ? '🚀 Ativar Divulgação Automática' : '🚀 Start Automated Marketing'}</span>
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[
              { id: 'ai_generator', label: lang === 'pt' ? '⚡ Gerador IA de Posts' : '⚡ AI Post Studio', icon: <Wand2 className="w-3.5 h-3.5" /> },
              { id: 'calendar', label: lang === 'pt' ? '📅 Calendário & Fila Multi-Redes' : '📅 Multi-Platform Queue', icon: <Calendar className="w-3.5 h-3.5" /> },
              { id: 'analytics', label: lang === 'pt' ? '📊 Relatório de Conversão' : '📊 Conversion Analytics', icon: <BarChart2 className="w-3.5 h-3.5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
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
        </div>

        {/* TAB 1: AI POST GENERATOR & CROSS-PUBLISHER */}
        {activeTab === 'ai_generator' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls Column */}
            <div className={`lg:col-span-6 p-6 rounded-3xl border space-y-6 ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
            }`}>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400" />
                  <span>{lang === 'pt' ? '1. Escolha o Produto ou Oferta' : '1. Select Product or Deal'}</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className={`w-full p-3 rounded-2xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title[lang] || p.title.pt} ({p.platform.toUpperCase()}) - R$ {(p.price || 0).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Networks Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'pt' ? '2. Selecione as Redes Sociais' : '2. Target Networks'}</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'kwai', name: 'Kwai', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
                    { id: 'tiktok', name: 'TikTok', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30' },
                    { id: 'instagram', name: 'Instagram', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
                    { id: 'pinterest', name: 'Pinterest', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
                    { id: 'youtube', name: 'YouTube Shorts', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
                    { id: 'telegram', name: 'Telegram VIP', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
                    { id: 'whatsapp', name: 'WhatsApp', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
                    { id: 'blog', name: 'Blog2Social', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }
                  ].map(net => (
                    <button
                      key={net.id}
                      onClick={() => togglePlatform(net.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                        selectedPlatforms.includes(net.id)
                          ? `${net.bg} ${net.color} border-2`
                          : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-500 opacity-60' : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span>{net.name}</span>
                      {selectedPlatforms.includes(net.id) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'pt' ? '3. Tom de Voz da IA' : '3. AI Tone of Voice'}</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'viral', label: lang === 'pt' ? '🔥 Viral & Achadinho' : '🔥 Viral & Hook' },
                    { id: 'persuasive', label: lang === 'pt' ? '🎯 Persuasivo & Vendas' : '🎯 High Conversion' },
                    { id: 'curiosity', label: lang === 'pt' ? '👀 Curiosidade Secreta' : '👀 Curiosity & Mystery' },
                    { id: 'unboxing', label: lang === 'pt' ? '📦 Review & Unboxing' : '📦 Unboxing Review' }
                  ].map(tone => (
                    <button
                      key={tone.id}
                      onClick={() => setPostTone(tone.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-extrabold border transition ${
                        postTone === tone.id
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerateAICopy}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:brightness-110 text-white shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{lang === 'pt' ? 'Criando Legenda Viral IA...' : 'Generating Viral Copy...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>{lang === 'pt' ? 'Gerar Legenda & Hashtags Virais' : 'Generate Viral Post Copy'}</span>
                  </>
                )}
              </button>

            </div>

            {/* Right Output Preview & Scheduler Column */}
            <div className={`lg:col-span-6 p-6 rounded-3xl border space-y-5 ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
            }`}>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'pt' ? 'Resultado & Pré-Visualização' : 'Generated Result & Preview'}</span>
                </span>

                {generatedCaption && (
                  <button
                    onClick={handleCopyCaption}
                    className="text-xs font-bold text-purple-400 flex items-center gap-1 hover:underline"
                  >
                    {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCaption ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Copiar Texto' : 'Copy Text')}</span>
                  </button>
                )}
              </div>

              {/* Display Generated Output */}
              <div className={`p-4 rounded-2xl border min-h-[220px] whitespace-pre-wrap text-xs sm:text-sm font-sans leading-relaxed ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {generatedCaption ? (
                  <>
                    <p>{generatedCaption}</p>
                    <p className="text-purple-400 font-mono font-bold mt-4">{generatedHashtags}</p>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-2 text-slate-500">
                    <Wand2 className="w-8 h-8 opacity-40 animate-pulse" />
                    <p className="text-xs font-semibold">
                      {lang === 'pt'
                        ? 'Clique em "Gerar Legenda" para criar automaticamente a postagem em segundos!'
                        : 'Click "Generate Post Copy" to instantly draft AI viral caption!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Multi-Publisher Schedule Form */}
              {generatedCaption && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-pink-400" />
                      <span>{lang === 'pt' ? 'Agendar Publicação Automática' : 'Schedule Auto-Post'}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                      Metricool Auto-Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Data:</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-950 border border-purple-500/30 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-1">Horário:</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-950 border border-purple-500/30 text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddScheduledPost}
                    className="w-full py-3 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'pt' ? 'Adicionar ao Calendário Multi-Redes' : 'Add to Multi-Network Queue'}</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 2: MULTI-NETWORK QUEUE & CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-200 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span>{lang === 'pt' ? 'Fila de Postagens Agendadas' : 'Scheduled Posts Queue'}</span>
              </h3>
              <span className="text-xs text-emerald-400 font-bold font-mono">
                {scheduledPosts.length} {lang === 'pt' ? 'posts na fila' : 'queued posts'}
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledPosts.map((post) => (
                <div
                  key={post.id}
                  className={`p-5 rounded-3xl border space-y-4 transition hover:scale-[1.01] ${
                    isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      post.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {post.status === 'published' ? (lang === 'pt' ? 'Publicado' : 'Published') : (lang === 'pt' ? 'Agendado' : 'Scheduled')}
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{post.date} às {post.time}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-100 line-clamp-1">{post.title}</h4>

                  <p className="text-xs text-slate-400 line-clamp-2">{post.content}</p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {post.platforms.map(plat => (
                      <span key={plat} className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-slate-950 text-indigo-300 border border-slate-800">
                        {plat}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">{lang === 'pt' ? 'Cliques gerados:' : 'Clicks:'}</span>
                    <span className="text-emerald-400 font-extrabold">{post.clicks || 0} clicks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONVERSION ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className={`p-8 rounded-3xl border space-y-6 ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {lang === 'pt' ? 'Relatório Unificado de Afiliados' : 'Unified Affiliate & Social Dashboard'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {lang === 'pt' ? 'Métricas consolidadas de tráfego vindo do Linktree, Kwai, TikTok e Instagram.' : 'Real-time performance from Linktree, Kwai, TikTok & Instagram.'}
                </p>
              </div>
              <button
                onClick={onOpenContact}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2"
              >
                <span>{lang === 'pt' ? 'Solicitar Mídia Kit em PDF' : 'Export Media Kit PDF'}</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: lang === 'pt' ? 'Alcance Total (Social)' : 'Total Reach', value: '142.8K', change: '+18.2%' },
                { label: lang === 'pt' ? 'Cliques nos Links' : 'Link Clicks', value: '12.450', change: '+24.5%' },
                { label: lang === 'pt' ? 'Taxa de Conversão' : 'Conversion Rate', value: '4.85%', change: '+1.2%' },
                { label: lang === 'pt' ? 'Comissão Estimada' : 'Estimated Revenue', value: 'R$ 8.920,00', change: '+32.0%' }
              ].map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400 font-bold">{m.label}</span>
                  <div className="text-xl font-black text-white">{m.value}</div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400">{m.change} este mês</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
