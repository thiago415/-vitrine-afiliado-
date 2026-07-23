import React, { useRef } from 'react';
import { ArrowRight, Sparkles, ShoppingBag, Send, SlidersHorizontal, Gift, ShieldCheck, Calculator, Smartphone, Camera, Upload } from 'lucide-react';
import { Language } from '../types';
import { PROFILE } from '../data/websiteData';
import { compressImage } from '../lib/imageCompressor';

interface HeroProps {
  lang: Language;
  onOpenContact: () => void;
  onOpenCalculator: () => void;
  onOpenAdmin: () => void;
  onOpenLinktreePreview?: () => void;
  isDarkMode: boolean;
  customAvatarUrl?: string;
  onUpdateAvatar?: (url: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onOpenContact,
  onOpenCalculator,
  onOpenAdmin,
  onOpenLinktreePreview,
  isDarkMode,
  customAvatarUrl,
  onUpdateAvatar
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const currentAvatar = customAvatarUrl || PROFILE.avatarUrl;

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Hero Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Availability / Affiliate Verification Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{PROFILE.availability[lang]}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              {lang === 'pt' ? (
                <>
                  Sua vitrine oficial de <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">links, cursos e ofertas de afiliado</span>.
                </>
              ) : (
                <>
                  Your official hub for <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">courses, deals & affiliate links</span>.
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className={`text-base sm:text-lg leading-relaxed max-w-2xl ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {PROFILE.tagline[lang]} {PROFILE.bio[lang]}
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {onOpenLinktreePreview && (
                <button
                  onClick={onOpenLinktreePreview}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all"
                >
                  <Smartphone className="w-4.5 h-4.5 stroke-[2.5]" />
                  <span>{lang === 'pt' ? 'Simular Linktree no Celular' : 'Simulate Mobile Linktree'}</span>
                </button>
              )}

              <a
                href="#affiliate-deals"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 hover:scale-[1.02] transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Ver Ofertas & Produtos' : 'View Deals & Products'}</span>
              </a>

              <button
                onClick={onOpenAdmin}
                className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold border transition ${
                  isDarkMode
                    ? 'bg-slate-900/80 hover:bg-slate-800 border-indigo-500/40 text-indigo-300'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-indigo-600 shadow-sm'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Painel de Gestão do Afiliado' : 'Affiliate Admin Hub'}</span>
              </button>
            </div>

            {/* Platform Badges */}
            <div className="pt-4 border-t border-slate-800/40 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-500 mr-2">{lang === 'pt' ? 'Plataformas Integradas:' : 'Supported Networks:'}</span>
              {['Hotmart', 'Kiwify', 'Eduzz', 'Amazon', 'Shopee', 'Monetizze', 'Instagram', 'TikTok', 'YouTube', 'Telegram'].map((plt) => (
                <span
                  key={plt}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono ${
                    isDarkMode ? 'bg-slate-900 border border-slate-800 text-slate-300' : 'bg-slate-100 border border-slate-200 text-slate-700'
                  }`}
                >
                  {plt}
                </span>
              ))}
            </div>

          </div>

          {/* Right Profile & Visual Card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Card Container */}
              <div className={`p-6 sm:p-8 rounded-3xl border relative z-10 transition ${
                isDarkMode 
                  ? 'bg-slate-900/90 border-slate-800/90 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl' 
                  : 'bg-white border-slate-200 shadow-xl'
              }`}>
                
                {/* Top Profile Image */}
                <div className="relative mb-6 text-center">
                  <div className="relative inline-block group">
                    <img
                      src={currentAvatar}
                      alt={PROFILE.name}
                      className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl object-cover ring-4 ring-indigo-500/30 mx-auto shadow-md transition group-hover:brightness-90"
                    />
                    
                    {/* Change Photo Overlay Button */}
                    {onUpdateAvatar && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition gap-1 cursor-pointer"
                        title={lang === 'pt' ? 'Trocar Foto da Galeria' : 'Change Profile Photo'}
                      >
                        <Camera className="w-6 h-6 text-amber-400" />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                          {lang === 'pt' ? 'Trocar Foto' : 'Upload Photo'}
                        </span>
                      </button>
                    )}

                    <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-500 text-slate-950 shadow-lg font-bold text-xs" title="Perfil de Afiliado Verificado">
                      ✓
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <h3 className="text-xl font-bold mt-4">{PROFILE.name}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{PROFILE.role[lang]}</p>

                  {/* Direct Change Avatar Button under name */}
                  {onUpdateAvatar && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'pt' ? '🖼️ Trocar Foto da Galeria' : '🖼️ Change Avatar Photo'}</span>
                    </button>
                  )}
                </div>

                {/* Grid Stats Inside Card */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/30">
                  {PROFILE.stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-center ${
                        isDarkMode ? 'bg-slate-950/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {stat.value}
                      </div>
                      <div className={`text-[11px] font-medium mt-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {stat.label[lang]}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Floating Decorative Accent Badge */}
              <div className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs font-semibold text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Afiliado Verificado Hotmart / Kiwify</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

