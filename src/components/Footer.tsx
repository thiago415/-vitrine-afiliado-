import React from 'react';
import { Language } from '../types';
import { Github, Linkedin, Youtube, Instagram, Twitter, Heart, ArrowUp } from 'lucide-react';

interface FooterProps {
  lang: Language;
  isDarkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({ lang, isDarkMode }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`border-t py-12 transition-colors ${
      isDarkMode ? 'bg-slate-950 border-slate-800/80 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              TL
            </div>
            <div>
              <span className="font-bold text-slate-200 text-sm">Thiago Lino</span>
              <p className="text-[11px] text-slate-500">
                {lang === 'pt' ? 'Software Engineer & Creator' : 'Software Engineer & Creator'}
              </p>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition">
              <Twitter className="w-4 h-4" />
            </a>
          </div>

          {/* Right Copyright & Scroll Top */}
          <div className="flex items-center gap-4 text-xs">
            <span>© {new Date().getFullYear()} Thiago Lino.</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 transition"
              title={lang === 'pt' ? 'Voltar ao topo' : 'Back to top'}
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};
