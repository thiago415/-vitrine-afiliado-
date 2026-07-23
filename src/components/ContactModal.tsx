import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { Mail, Send, CheckCircle2, X, MessageSquare, PhoneCall, Copy, Check } from 'lucide-react';

interface ContactModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  isDarkMode: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  lang,
  isOpen,
  onClose,
  initialMessage = '',
  isDarkMode
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
      setSubject(lang === 'pt' ? 'Proposta de Projeto / Consultoria' : 'Project / Consulting Proposal');
    }
  }, [initialMessage, lang]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('thiagolino974@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className={`relative w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl p-6 sm:p-8 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold">
              {lang === 'pt' ? 'Mensagem Enviada!' : 'Message Sent!'}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {lang === 'pt'
                ? 'Obrigado pelo contato. Responderei o seu e-mail o mais breve possível.'
                : 'Thank you for reaching out. I will respond to your email as soon as possible.'}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="mt-4 px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {lang === 'pt' ? 'Fechar' : 'Close'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-800/40">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {lang === 'pt' ? 'Entre em Contato' : 'Get in Touch'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'pt' ? 'Envie uma mensagem direta ou solicite um orçamento.' : 'Send a direct message or request a consultation.'}
                </p>
              </div>
            </div>

            {/* Quick Email Copy Chip */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>thiagolino974@gmail.com</span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 flex items-center gap-1"
              >
                {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEmail ? (lang === 'pt' ? 'Copiado' : 'Copied') : (lang === 'pt' ? 'Copiar' : 'Copy')}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">
                {lang === 'pt' ? 'Seu Nome' : 'Your Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Silva"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDarkMode ? 'bg-slate-950 border border-slate-800 text-slate-100' : 'bg-slate-50 border border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">
                {lang === 'pt' ? 'Seu E-mail' : 'Your Email'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@empresa.com"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDarkMode ? 'bg-slate-950 border border-slate-800 text-slate-100' : 'bg-slate-50 border border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">
                {lang === 'pt' ? 'Mensagem' : 'Message'}
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={lang === 'pt' ? 'Descreva brevemente o seu projeto...' : 'Briefly describe your project or goal...'}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDarkMode ? 'bg-slate-950 border border-slate-800 text-slate-100' : 'bg-slate-50 border border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Enviar Mensagem' : 'Send Message'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
