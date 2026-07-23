import React from 'react';
import { Language } from '../types';
import { Code, Server, Cpu, Layers, CheckCircle2, Award } from 'lucide-react';

interface AboutProps {
  lang: Language;
  isDarkMode: boolean;
}

export const About: React.FC<AboutProps> = ({ lang, isDarkMode }) => {
  const skillCategories = [
    {
      title: lang === 'pt' ? 'Desenvolvimento Frontend' : 'Frontend Engineering',
      icon: <Code className="w-5 h-5 text-indigo-400" />,
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vite', 'Redux / Zustand', 'HTML5 / CSS3', 'WCAG Accessibility']
    },
    {
      title: lang === 'pt' ? 'Backend & APIs' : 'Backend & Infrastructure',
      icon: <Server className="w-5 h-5 text-purple-400" />,
      skills: ['Node.js / Express', 'Python / FastAPI', 'PostgreSQL', 'Firestore / Firebase', 'REST & GraphQL APIs', 'ORM (Drizzle, Prisma)', 'Docker']
    },
    {
      title: lang === 'pt' ? 'IA & Ferramentas Modernas' : 'AI & Modern Engineering',
      icon: <Cpu className="w-5 h-5 text-pink-400" />,
      skills: ['Google Gemini API', 'OpenAI Integration', 'Prompt Engineering', 'Git & CI/CD Pipelines', 'Jest / Testing Library', 'Micro-frontends']
    }
  ];

  const highlights = [
    {
      title: lang === 'pt' ? 'Código Limpo e Manutenível' : 'Clean & Maintainable Code',
      desc: lang === 'pt' ? 'Priorização rigorosa de boas práticas, SOLID e padrões de projeto para longevidade da base de código.' : 'Strict adherence to SOLID principles, design patterns, and codebase longevity.'
    },
    {
      title: lang === 'pt' ? 'Foco Absoluto na Experiência do Usuário' : 'Obsession with User Experience',
      desc: lang === 'pt' ? 'Interfaces responsivas, fluidas, com micro-interações acessíveis e tempo de carregamento mínimo.' : 'Responsive, fluid interfaces with accessible micro-interactions and minimal load times.'
    },
    {
      title: lang === 'pt' ? 'Visão de Produto e Negócio' : 'Product & Business Mindset',
      desc: lang === 'pt' ? 'Desenvolvimento orientado a gerar valor real, validar hipóteses rapidamente e escalar negócios.' : 'Driven to deliver real business impact, fast validation cycles, and scalable systems.'
    }
  ];

  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
            {lang === 'pt' ? 'Sobre Mim' : 'About Me'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {lang === 'pt' ? 'Construindo software resiliente com paixão e precisão.' : 'Building resilient software with passion & precision.'}
          </h2>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {lang === 'pt'
              ? 'Conheça mais sobre minha trajetória técnica, habilidades de engenharia e os pilares que norteiam o meu trabalho diário.'
              : 'Learn more about my technical background, engineering skills, and the core principles guiding my daily work.'}
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {highlights.map((item, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border transition hover:-translate-y-1 ${
                isDarkMode
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/50'
                  : 'bg-white border-slate-200/90 shadow-sm hover:border-indigo-300'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">{item.title}</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack Categories */}
        <div className="mt-12 space-y-6">
          <h3 className="text-xl font-bold tracking-tight text-center sm:text-left">
            {lang === 'pt' ? 'Habilidades & Stack Técnica' : 'Skills & Technical Stack'}
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {skillCategories.map((cat, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800/40">
                  {cat.icon}
                  <h4 className="font-semibold text-sm sm:text-base">{cat.title}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        isDarkMode
                          ? 'bg-slate-950 text-slate-300 border border-slate-800/80 hover:border-indigo-500/40'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
