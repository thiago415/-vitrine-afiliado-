import React from 'react';
import { Language } from '../types';
import { SERVICES } from '../data/websiteData';
import { Code, ShieldCheck, Video, CheckCircle, ArrowRight } from 'lucide-react';

interface ServicesProps {
  lang: Language;
  isDarkMode: boolean;
  onOpenContactWithService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({
  lang,
  isDarkMode,
  onOpenContactWithService
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-6 h-6 text-indigo-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-purple-400" />;
      case 'Video':
        return <Video className="w-6 h-6 text-pink-400" />;
      default:
        return <Code className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <section id="services" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
            {lang === 'pt' ? 'Serviços & Soluções' : 'Services & Solutions'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {lang === 'pt' ? 'Como posso ajudar o seu projeto a evoluir.' : 'How I can help bring your vision to life.'}
          </h2>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'pt'
              ? 'Atuação ponta a ponta para empresas, startups e criadores de tecnologia.'
              : 'End-to-end engineering and content solutions for companies, startups, and tech creators.'}
          </p>
        </div>

        {/* Services Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 shadow-xl'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-md'
              }`}
            >
              <div className="space-y-6">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit">
                  {getIcon(service.iconName)}
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">{service.title[lang]}</h3>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {service.description[lang]}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800/40">
                  {service.features[lang].map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-6 border-t border-slate-800/30">
                <button
                  onClick={() => onOpenContactWithService(service.title[lang])}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition-all"
                >
                  <span>{lang === 'pt' ? 'Solicitar Proposta' : 'Request Proposal'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
