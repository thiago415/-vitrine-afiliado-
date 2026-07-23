import React, { useState } from 'react';
import { Search, Tag, ExternalLink, Copy, Check, Filter, Sparkles, Star, TrendingUp, ShoppingBag, Gift, SlidersHorizontal, Plus } from 'lucide-react';
import { Language, AffiliateProduct, PlatformType } from '../types';

interface AffiliateShowcaseProps {
  lang: Language;
  isDarkMode: boolean;
  products: AffiliateProduct[];
  onProductClick: (productId: string) => void;
  onOpenAdmin: () => void;
}

export const AffiliateShowcase: React.FC<AffiliateShowcaseProps> = ({
  lang,
  isDarkMode,
  products,
  onProductClick,
  onOpenAdmin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const platforms: { id: string; label: string; color: string }[] = [
    { id: 'all', label: lang === 'pt' ? 'Todas Plataformas' : 'All Platforms', color: 'bg-indigo-500/20 text-indigo-400' },
    { id: 'hotmart', label: 'Hotmart', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { id: 'kiwify', label: 'Kiwify', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'eduzz', label: 'Eduzz', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'amazon', label: 'Amazon', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'shoppee', label: 'Shopee', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { id: 'monetizze', label: 'Monetizze', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
  ];

  const categories = [
    { id: 'all', label: lang === 'pt' ? 'Todos' : 'All' },
    { id: 'course', label: lang === 'pt' ? 'Cursos' : 'Courses' },
    { id: 'ebook', label: lang === 'pt' ? 'E-books' : 'E-books' },
    { id: 'infoproduct', label: lang === 'pt' ? 'Infoprodutos' : 'Infoproducts' },
    { id: 'gear', label: lang === 'pt' ? 'Equipamentos' : 'Gear & Hardware' },
    { id: 'software', label: lang === 'pt' ? 'Softwares / Cloud' : 'Software' }
  ];

  const handleCopyCoupon = (coupon: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon);
    setCopiedCoupon(coupon);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleProductAction = (product: AffiliateProduct) => {
    onProductClick(product.id);
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  const filteredProducts = products.filter(product => {
    const titleMatch = (product.title[lang] || product.title.pt || '').toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = (product.description[lang] || product.description.pt || '').toLowerCase().includes(searchTerm.toLowerCase());
    const couponMatch = (product.coupon || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = titleMatch || descMatch || couponMatch;
    const matchesPlatform = selectedPlatform === 'all' || product.platform === selectedPlatform;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const getPlatformBadge = (platform: PlatformType) => {
    switch (platform) {
      case 'hotmart':
        return { label: 'Hotmart', style: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
      case 'kiwify':
        return { label: 'Kiwify', style: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'eduzz':
        return { label: 'Eduzz', style: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'amazon':
        return { label: 'Amazon', style: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'shoppee':
        return { label: 'Shopee', style: 'bg-red-500/15 text-red-400 border-red-500/30' };
      case 'monetizze':
        return { label: 'Monetizze', style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      default:
        return { label: 'Oficial', style: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
    }
  };

  return (
    <section id="affiliate-deals" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title & Admin Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <Gift className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Links de Afiliado Verificados' : 'Verified Affiliate Deals'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {lang === 'pt' ? 'Vitrine de Produtos & Ofertas' : 'Products & Affiliate Deals Showcase'}
            </h2>
            <p className={`mt-2 text-sm sm:text-base max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'pt'
                ? 'Confira os melhores cursos, e-books, equipamentos e ferramentas recomendadas com cupons de desconto exclusivos.'
                : 'Browse hand-picked courses, e-books, hardware, and tech gear with active discount coupons.'}
            </p>
          </div>

          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition hover:scale-105 self-start md:self-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Gerenciar Links / Painel' : 'Manage Affiliate Links'}</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className={`p-4 sm:p-6 rounded-2xl border mb-8 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          
          <div className="grid md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={lang === 'pt' ? 'Buscar produto, cupom ou curso...' : 'Search product, coupon or course...'}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Platform Filter Buttons */}
            <div className="md:col-span-7 flex flex-wrap gap-2 items-center">
              {platforms.map(plt => (
                <button
                  key={plt.id}
                  onClick={() => setSelectedPlatform(plt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    selectedPlatform === plt.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : isDarkMode
                      ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {plt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/20">
            <span className="text-xs font-semibold text-slate-400 self-center mr-1">
              {lang === 'pt' ? 'Categoria:' : 'Category:'}
            </span>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : isDarkMode
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${
            isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-500 mb-3" />
            <h3 className="text-lg font-bold">
              {lang === 'pt' ? 'Nenhum produto encontrado' : 'No products found'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {lang === 'pt'
                ? 'Tente mudar os termos da busca ou limpar os filtros de plataforma e categoria.'
                : 'Try adjusting your search terms or clearing platform filters.'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedPlatform('all');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
            >
              {lang === 'pt' ? 'Limpar Filtros' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const platformBadge = getPlatformBadge(product.platform);

              return (
                <div
                  key={product.id}
                  className={`group rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isDarkMode
                      ? 'bg-slate-900/90 border-slate-800/90 hover:border-indigo-500/40 hover:shadow-indigo-950/20'
                      : 'bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-indigo-100'
                  }`}
                >
                  {/* Card Image & Badges */}
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img
                      src={product.imageUrl}
                      alt={product.title[lang] || product.title.pt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Platform Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${platformBadge.style}`}>
                        {platformBadge.label}
                      </span>
                    </div>

                    {/* Special Badge / Featured */}
                    {product.badge && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                          {product.badge}
                        </span>
                      </div>
                    )}

                    {/* Clicks counter */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-slate-700">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span>{product.clicks} {lang === 'pt' ? 'cliques' : 'clicks'}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-amber-400 text-xs mb-2 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating || '4.9'}</span>
                        <span className="text-slate-500 ml-1">• {lang === 'pt' ? 'Verificado' : 'Verified'}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {product.title[lang] || product.title.pt}
                      </h3>

                      {/* Description */}
                      <p className={`text-xs mt-2 line-clamp-3 leading-relaxed ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {product.description[lang] || product.description.pt}
                      </p>
                    </div>

                    {/* Pricing & Coupon */}
                    <div className="mt-5 pt-4 border-t border-slate-800/30">
                      
                      {/* Coupon Tag if present */}
                      {product.coupon && (
                        <div className="mb-3 flex items-center justify-between p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-mono font-bold text-indigo-300">
                              Cupom: <span className="text-white bg-indigo-600/60 px-1.5 py-0.5 rounded">{product.coupon}</span>
                            </span>
                          </div>
                          
                          <button
                            onClick={e => handleCopyCoupon(product.coupon!, e)}
                            className="p-1 rounded-md text-xs font-semibold text-indigo-400 hover:text-white hover:bg-indigo-600 transition flex items-center gap-1"
                            title="Copiar Cupom"
                          >
                            {copiedCoupon === product.coupon ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400">{lang === 'pt' ? 'Copiado!' : 'Copied!'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[10px]">{lang === 'pt' ? 'Copiar' : 'Copy'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Price & Action Button */}
                      <div className="flex items-center justify-between">
                        <div>
                          {product.originalPrice && (
                            <span className="text-xs text-slate-500 line-through block font-mono">
                              R$ {product.originalPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            {product.price ? `R$ ${product.price.toFixed(2)}` : (lang === 'pt' ? 'Acessar Link' : 'Check Link')}
                          </span>
                        </div>

                        <button
                          onClick={() => handleProductAction(product)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition hover:scale-105"
                        >
                          <span>{lang === 'pt' ? 'Acessar Oferta' : 'Get Deal'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
