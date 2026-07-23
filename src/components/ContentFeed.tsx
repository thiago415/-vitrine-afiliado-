import React from 'react';
import { Language } from '../types';
import { CONTENT_ITEMS } from '../data/websiteData';
import { Play, BookOpen, Radio, ExternalLink } from 'lucide-react';

interface ContentFeedProps {
  lang: Language;
  isDarkMode: boolean;
}

export const ContentFeed: React.FC<ContentFeedProps> = ({ lang, isDarkMode }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-3.5 h-3.5 text-red-400 fill-red-400" />;
      case 'article':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
      case 'podcast':
        return <Radio className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Play className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <section id="content" className="py-20 relative bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
            {lang === 'pt' ? 'Conteúdo Tech' : 'Tech Content'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {lang === 'pt' ? 'Vídeos, Artigos e Podcasting.' : 'Videos, Articles & Podcasts.'}
          </h2>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'pt'
              ? 'Conhecimento prático sobre desenvolvimento de software, arquitetura e engenharia.'
              : 'Practical insights on software engineering, web design, and modern tooling.'}
          </p>
        </div>

        {/* Content Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {CONTENT_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 shadow-xl'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-md'
              }`}
            >
              <div>
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-slate-950">
                  <img
                    src={item.thumbnail}
                    alt={item.title[lang]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors" />

                  {/* Badge & Read time */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/80 text-white backdrop-blur-md border border-slate-800">
                      {getTypeIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </span>
                  </div>

                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950/80 text-slate-300 backdrop-blur-md">
                    {item.readOrWatchTime}
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-3">
                  <div className="text-[11px] font-medium text-indigo-400">
                    {item.date}
                  </div>
                  <h3 className="text-base font-bold group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {item.title[lang]}
                  </h3>
                  <p className={`text-xs leading-relaxed line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.summary[lang]}
                  </p>
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="p-6 pt-0 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>{lang === 'pt' ? 'Acessar Conteúdo' : 'View Content'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>

            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
