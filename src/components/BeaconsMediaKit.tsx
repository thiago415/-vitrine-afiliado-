import React, { useState } from 'react';
import { Users, TrendingUp, DollarSign, Award, CheckCircle, ShieldCheck, Star, Send, Sparkles, MessageCircle, Heart, Eye, Flame, Pin, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { PROFILE } from '../data/websiteData';

interface BeaconsMediaKitProps {
  lang: Language;
  isDarkMode: boolean;
  onOpenContact: (initialMessage?: string) => void;
  pixKey: string;
}

export const BeaconsMediaKit: React.FC<BeaconsMediaKitProps> = ({
  lang,
  isDarkMode,
  onOpenContact,
  pixKey
}) => {
  const [selectedService, setSelectedService] = useState<'feed' | 'story' | 'video' | 'banner'>('video');

  const handleBookSponsor = (serviceTitle: string, price: string) => {
    const msg = lang === 'pt'
      ? `Olá! Gostaria de contratar a publicidade: "${serviceTitle}" (${price}). Podemos alinhar os detalhes e pagamento via PIX?`
      : `Hello! I would like to book sponsorship: "${serviceTitle}" (${price}). Can we discuss details and payment?`;
    onOpenContact(msg);
  };

  return (
    <section id="media-kit" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 text-amber-300 border border-amber-500/30">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'pt' ? 'Mídia Kit Oficial do Criador (Beacons & Lnk.Bio)' : 'Official Creator Media Kit'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            {lang === 'pt'
              ? 'Anuncie na Minha Rede & Vitrine de Afiliados'
              : 'Sponsor & Advertise on My Linktree & Social Channels'}
          </h2>

          <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'pt'
              ? 'Público engajado apaixonado por tecnologia, aplicativos, produtos de afiliados e cursos online. Receba relatórios em tempo real.'
              : 'Engaged tech & lifestyle audience. Direct sponsor placements with transparent analytics and instant Pix booking.'}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 max-w-xl mx-auto mt-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'pt'
                ? '💡 Nota: Os valores do Mídia Kit são exemplares e 100% negociáveis ou customizáveis para cada parceiro.'
                : '💡 Note: Media Kit values are customizable examples and fully negotiable for each partner.'}
            </span>
          </div>
        </div>

        {/* Stats Grid Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              icon: <Users className="w-5 h-5 text-indigo-400" />,
              stat: '120.000+',
              label: lang === 'pt' ? 'Seguidores Totais' : 'Total Followers',
              sub: 'Kwai, TikTok, YouTube, Instagram'
            },
            {
              icon: <Eye className="w-5 h-5 text-emerald-400" />,
              stat: '1.4M+',
              label: lang === 'pt' ? 'Visualizações/Mês' : 'Monthly Views',
              sub: 'Engajamento em Alta'
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
              stat: '4.85%',
              label: lang === 'pt' ? 'Taxa de Engajamento' : 'Engagement Rate',
              sub: '3x superior à média'
            },
            {
              icon: <Star className="w-5 h-5 text-pink-400" />,
              stat: '98.5%',
              label: lang === 'pt' ? 'Aprovação de Marcas' : 'Brand Rating',
              sub: '40+ Campanhas Entregues'
            }
          ].map((card, i) => (
            <div
              key={i}
              className={`p-6 rounded-3xl border space-y-2 transition hover:scale-[1.02] ${
                isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-lg'
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 w-fit">
                {card.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">{card.stat}</div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-200">{card.label}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* SPONSOR RATE CARD & SERVICES */}
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Description Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {lang === 'pt' ? 'Tabela de Valores & Formatos' : 'Rate Card & Formats'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {lang === 'pt' ? 'Formatos de Publicidade e Divulgação' : 'Advertising & Sponsorship Packages'}
              </h3>
              <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {lang === 'pt'
                  ? 'Escolha o formato ideal para impulsionar seu produto, infoproduto ou cupom de afiliado com rastreamento completo de cliques.'
                  : 'Select the optimal format to promote your product, course, or affiliate link with direct tracking.'}
              </p>
            </div>

            {/* Audience Demographics List */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-xs font-extrabold uppercase text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'pt' ? 'Perfil do Público de Compras' : 'Audience Profile'}</span>
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>82% Brasil (SP, RJ, MG, PR, RS, BA)</span>
                  <span className="text-emerald-400 font-bold">Top Região</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div className="w-[82%] h-full bg-emerald-500 rounded-full" />
                </div>

                <div className="flex justify-between text-slate-300 pt-1">
                  <span>Idade Predominante: 18 - 34 anos</span>
                  <span className="text-indigo-400 font-bold">76% Compradores</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div className="w-[76%] h-full bg-indigo-500 rounded-full" />
                </div>
              </div>
            </div>

          </div>

          {/* Right Rates Grid */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {[
              {
                id: 'video',
                title: lang === 'pt' ? 'Vídeo Curto (Kwai + TikTok + Shorts)' : 'Short Video (Kwai + TikTok + Shorts)',
                desc: lang === 'pt' ? '1 Vídeo dedicado de 60s postado simultaneamente com seu link fixado no perfil.' : '1 Dedicated 60s viral video multi-posted with pinned link.',
                price: 'R$ 49,90',
                badge: 'Popular',
                icon: <Flame className="w-5 h-5 text-amber-400" />
              },
              {
                id: 'story',
                title: lang === 'pt' ? 'Combo Stories (Instagram + Kwai)' : 'Stories Combo (Insta + Kwai)',
                desc: lang === 'pt' ? 'Sequência de 3 Stories com sticker de link direto para sua oferta.' : '3 Story sequence with direct link sticker to your offer.',
                price: 'R$ 29,90',
                badge: 'Acessível',
                icon: <Heart className="w-5 h-5 text-pink-400" />
              },
              {
                id: 'banner',
                title: lang === 'pt' ? 'Banner Destaque na Vitrine (30 dias)' : 'Featured Showcase Banner (30 days)',
                desc: lang === 'pt' ? 'Sua marca ou produto em posição VIP no topo da nossa vitrine de links.' : 'VIP top position placement on our main affiliate showcase.',
                price: 'R$ 39,90',
                badge: 'Tráfego 24/7',
                icon: <Star className="w-5 h-5 text-amber-300" />
              },
              {
                id: 'feed',
                title: lang === 'pt' ? 'Post no Feed + Link Permanente' : 'Feed Post + Permanent Link',
                desc: lang === 'pt' ? 'Carrossel completo de fotos/vídeos com resenha e cupom de desconto.' : 'Full review carousel with custom discount coupon.',
                price: 'R$ 69,90',
                badge: 'Autoridade',
                icon: <Award className="w-5 h-5 text-indigo-400" />
              }
            ].map((srv) => (
              <div
                key={srv.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 transition hover:scale-[1.02] ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {srv.icon}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {srv.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-white">{srv.title}</h4>
                  <p className="text-xs text-slate-400">{srv.desc}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">{lang === 'pt' ? 'Investimento:' : 'Price:'}</span>
                    <span className="text-lg font-black text-emerald-400">{srv.price}</span>
                  </div>

                  <button
                    onClick={() => handleBookSponsor(srv.title, srv.price)}
                    className="w-full py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'pt' ? 'Contratar via PIX' : 'Book via PIX'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
