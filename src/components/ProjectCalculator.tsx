import React, { useState } from 'react';
import { Language } from '../types';
import { Calculator, Check, X, ArrowRight, DollarSign, Clock, Sparkles } from 'lucide-react';

interface ProjectCalculatorProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSendEstimate: (summary: string) => void;
  isDarkMode: boolean;
}

export const ProjectCalculator: React.FC<ProjectCalculatorProps> = ({
  lang,
  isOpen,
  onClose,
  onSendEstimate,
  isDarkMode
}) => {
  const [appType, setAppType] = useState<string>('webapp');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['auth', 'responsive']);
  const [timelineSpeed, setTimelineSpeed] = useState<string>('standard');

  if (!isOpen) return null;

  const appTypes = [
    { id: 'landing', label: { pt: 'Landing Page / Site Institucional', en: 'Landing Page / Company Site' }, basePrice: 1500, baseWeeks: 1 },
    { id: 'webapp', label: { pt: 'Aplicação Web / SaaS Customizado', en: 'Web Application / Custom SaaS' }, basePrice: 3800, baseWeeks: 3 },
    { id: 'ecommerce', label: { pt: 'Loja Virtual / E-Commerce', en: 'E-Commerce / Online Store' }, basePrice: 3200, baseWeeks: 2 },
    { id: 'mobile', label: { pt: 'App Mobile (iOS & Android)', en: 'Mobile App (iOS & Android)' }, basePrice: 4500, baseWeeks: 4 },
  ];

  const features = [
    { id: 'auth', label: { pt: 'Autenticação & Usuários', en: 'User Authentication' }, price: 400 },
    { id: 'payments', label: { pt: 'Integração de Pagamentos (Stripe/Pix)', en: 'Payment Integration (Stripe/Pix)' }, price: 600 },
    { id: 'ai', label: { pt: 'Recursos com IA (Gemini API / Chat)', en: 'AI Integration (Gemini API)' }, price: 800 },
    { id: 'admin', label: { pt: 'Painel Administrativo Completo', en: 'Full Admin Dashboard' }, price: 700 },
    { id: 'seo', label: { pt: 'Otimização SEO Avançada', en: 'Advanced SEO Optimization' }, price: 300 },
    { id: 'responsive', label: { pt: 'Design Responsivo Premium', en: 'Premium Responsive Design' }, price: 300 },
  ];

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectedApp = appTypes.find(a => a.id === appType) || appTypes[0];
  const featuresPrice = selectedFeatures.reduce((acc, featId) => {
    const f = features.find(item => item.id === featId);
    return acc + (f ? f.price : 0);
  }, 0);

  const multiplier = timelineSpeed === 'urgent' ? 1.25 : 1.0;
  const totalPrice = Math.round((selectedApp.basePrice + featuresPrice) * multiplier);
  const totalWeeks = Math.max(1, Math.round(selectedApp.baseWeeks + (selectedFeatures.length * 0.5)));

  const handleProceed = () => {
    const summary = `${selectedApp.label[lang]} | Features: ${selectedFeatures.join(', ')} | Speed: ${timelineSpeed} | Approx: R$ ${totalPrice} (~${totalWeeks} wks)`;
    onSendEstimate(summary);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className={`relative w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {lang === 'pt' ? 'Simulador de Projeto & Orçamento' : 'Project Cost & Timeline Estimator'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'pt' ? 'Selecione o escopo para obter uma estimativa inicial.' : 'Select scope to generate an instant preliminary range.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-CLICK AUTOMATIC MODE BANNER */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-purple-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                {lang === 'pt' ? '🤖 Não sabe como montar? Ative o Modo Automático' : '🤖 Don\'t know how to set up? Activate Auto-Pilot'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'pt' ? 'O site calcula e cria o escopo perfeito de projeto e orçamento para você em 1 segundo.' : 'Auto-generate the perfect project proposal in 1 second.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setAppType('webapp');
              setSelectedFeatures(['auth', 'payments', 'ai', 'admin', 'responsive']);
              setTimelineSpeed('standard');
              setTimeout(() => {
                const autoSummary = lang === 'pt'
                  ? 'Aplicação Web / SaaS Customizado com IA Gemini, Pagamentos Pix, Autenticação, Painel Admin e Design Responsivo | Orçamento Estimado: R$ 5.800,00 (~3 semanas)'
                  : 'Custom Web App with Gemini AI, Payments, Auth, Admin & Responsive Design | Estimated Budget: R$ 5,800.00 (~3 weeks)';
                onSendEstimate(autoSummary);
                onClose();
              }, 300);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition shrink-0 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Gerar Tudo Automático' : 'Auto-Generate Proposal'}</span>
          </button>
        </div>

        {/* Step 1: App Type */}
        <div className="space-y-3 pt-4">
          <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            {lang === 'pt' ? '1. Tipo de Aplicação' : '1. Application Type'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {appTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setAppType(type.id)}
                className={`p-3.5 rounded-xl border text-left transition text-xs font-medium ${
                  appType === type.id
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                    : isDarkMode
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-sm text-slate-200 mb-0.5">{type.label[lang]}</div>
                <div className="text-[11px] text-slate-400">R$ {type.basePrice} ~ {type.baseWeeks} {lang === 'pt' ? 'semanas' : 'weeks'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Features */}
        <div className="space-y-3 pt-4">
          <label className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            {lang === 'pt' ? '2. Funcionalidades & Módulos' : '2. Key Features'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map(feat => {
              const isSelected = selectedFeatures.includes(feat.id);
              return (
                <button
                  key={feat.id}
                  onClick={() => toggleFeature(feat.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                      : isDarkMode
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>{feat.label[lang]}</span>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                  ) : (
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">+R$ {feat.price}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result & Actions */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-indigo-300 uppercase tracking-wider font-semibold">
              {lang === 'pt' ? 'Estimativa Aproximada' : 'Estimated Investment'}
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              R$ {totalPrice.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-300">/ ~{totalWeeks} {lang === 'pt' ? 'semanas' : 'weeks'}</span>
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg flex items-center justify-center gap-2"
          >
            <span>{lang === 'pt' ? 'Enviar Proposta' : 'Send this Proposal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
