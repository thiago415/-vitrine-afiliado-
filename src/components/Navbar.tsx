import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Globe, MessageSquare, SlidersHorizontal, Gift, Sparkles, User as UserIcon, Smartphone } from 'lucide-react';
import { Language } from '../types';
import { PROFILE } from '../data/websiteData';
import { User } from '../lib/firebase';

interface NavbarProps {
  lang: Language;
  onLanguageToggle: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onOpenContact: () => void;
  onOpenAdmin: () => void;
  onOpenLinktreePreview?: () => void;
  currentUser: User | null;
  userProfile: { name: string; handle: string; avatarUrl: string } | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageToggle,
  isDarkMode,
  onThemeToggle,
  onOpenContact,
  onOpenAdmin,
  onOpenLinktreePreview,
  currentUser,
  userProfile,
  onOpenAuth
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#affiliate-deals', label: lang === 'pt' ? 'Ofertas & Produtos' : 'Deals & Products' },
    { href: '#social-hub', label: lang === 'pt' ? 'Redes Sociais' : 'Social Hub' },
    { href: '#services', label: lang === 'pt' ? 'Serviços' : 'Services' },
    { href: '#projects', label: lang === 'pt' ? 'Projetos' : 'Projects' },
    { href: '#content', label: lang === 'pt' ? 'Conteúdo' : 'Content' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isDarkMode
            ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg'
            : 'bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo with Avatar */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src={PROFILE.avatarUrl}
                  alt={PROFILE.name}
                  className="w-full h-full rounded-[10px] object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950 flex items-center justify-center text-[8px] text-slate-950 font-bold">
                ✓
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight group-hover:text-indigo-500 transition-colors">
                {PROFILE.name}
              </span>
              <span className="text-[11px] text-indigo-400 font-medium tracking-wider uppercase -mt-0.5">
                Vitrine do Afiliado & Tech
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/40 p-1.5 rounded-full border border-slate-800/50">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  isDarkMode
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* User Account Button */}
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                currentUser
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
              title={currentUser ? (lang === 'pt' ? 'Minha Conta de Afiliado' : 'My Account') : (lang === 'pt' ? 'Entrar na Conta' : 'Login')}
            >
              {currentUser ? (
                <>
                  <img
                    src={userProfile?.avatarUrl || currentUser.photoURL || PROFILE.avatarUrl}
                    alt="Avatar"
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-400"
                  />
                  <span className="truncate max-w-[100px]">{userProfile?.name?.split(' ')[0] || currentUser.email?.split('@')[0]}</span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'pt' ? 'Entrar / Conta' : 'Login'}</span>
                </>
              )}
            </button>

            {/* Linktree App Simulator Button */}
            {onOpenLinktreePreview && (
              <button
                onClick={onOpenLinktreePreview}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition shadow-sm"
                title="Simular App Linktree no Celular"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'pt' ? 'Simular Linktree' : 'Linktree Preview'}</span>
              </button>
            )}

            {/* Admin Hub CTA */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 transition"
              title="Gerenciar Links de Afiliado"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Painel do Afiliado' : 'Affiliate Hub'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onLanguageToggle}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Alternar Idioma / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-xl border transition ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Alternar Tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Contact CTA */}
            <button
              onClick={onOpenContact}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 hover:scale-105 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Contato' : 'Contact'}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="p-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
              title="Painel do Afiliado"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onLanguageToggle}
              className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300"
            >
              {lang.toUpperCase()}
            </button>
            <button
              onClick={onThemeToggle}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b ${
          isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        } px-4 pt-2 pb-6 space-y-3`}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium hover:text-indigo-500 border-b border-slate-800/20"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAuth();
            }}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-100 text-center flex items-center justify-center gap-2 border border-slate-700"
          >
            <UserIcon className="w-4 h-4 text-indigo-400" />
            <span>
              {currentUser
                ? (userProfile?.name ? `${lang === 'pt' ? 'Conta:' : 'Account:'} ${userProfile.name}` : (lang === 'pt' ? 'Minha Conta' : 'My Account'))
                : (lang === 'pt' ? 'Entrar / Criar Conta' : 'Login / Sign Up')}
            </span>
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 text-white text-center shadow-md flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Painel do Afiliado' : 'Affiliate Hub'}</span>
          </button>
        </div>
      )}
    </header>
  );
};

