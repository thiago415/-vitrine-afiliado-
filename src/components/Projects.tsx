import React, { useState } from 'react';
import { Project, Language } from '../types';
import { PROJECTS } from '../data/websiteData';
import { ExternalLink, Github, Sparkles, Layers, Eye, X, Check } from 'lucide-react';

interface ProjectsProps {
  lang: Language;
  isDarkMode: boolean;
}

export const Projects: React.FC<ProjectsProps> = ({ lang, isDarkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = [
    { id: 'all', label: lang === 'pt' ? 'Todos os Projetos' : 'All Projects' },
    { id: 'ai', label: lang === 'pt' ? 'Inteligência Artificial' : 'AI Powered' },
    { id: 'web', label: lang === 'pt' ? 'Aplicações Web' : 'Web Applications' },
    { id: 'open-source', label: lang === 'pt' ? 'Código Aberto' : 'Open Source' },
  ];

  const filteredProjects = PROJECTS.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <section id="projects" className="py-20 relative bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
              {lang === 'pt' ? 'Portfólio' : 'Portfolio'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {lang === 'pt' ? 'Projetos em Destaque' : 'Featured Work'}
            </h2>
            <p className={`text-sm max-w-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'pt'
                ? 'Algumas das soluções de software desenvolvidas para clientes, produtos próprios e a comunidade open-source.'
                : 'A selection of software solutions crafted for clients, personal products, and the open-source community.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : isDarkMode
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50 shadow-xl'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-md'
              }`}
            >
              {/* Image Container */}
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
                <img
                  src={project.imageUrl}
                  alt={project.title[lang]}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                
                {project.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-600 text-white shadow-md">
                    {project.badge}
                  </span>
                )}

                {/* Quick view button overlay */}
                <button
                  onClick={() => setSelectedProject(project)}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-indigo-600 text-white backdrop-blur-md border border-slate-700/80 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'pt' ? 'Detalhes' : 'Details'}</span>
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">
                    {project.title[lang]}
                  </h3>
                  {project.metrics && (
                    <span className="shrink-0 text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {project.metrics}
                    </span>
                  )}
                </div>

                <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {project.description[lang]}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono ${
                        isDarkMode ? 'bg-slate-950 text-indigo-300 border border-slate-800' : 'bg-slate-100 text-indigo-700 border border-slate-200'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Links */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-800/40">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      <span>{lang === 'pt' ? 'Ver Demonstração' : 'Live Demo'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${
                        isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>{lang === 'pt' ? 'Código Fonte' : 'Repository'}</span>
                    </a>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`relative w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedProject.imageUrl}
              alt={selectedProject.title[lang]}
              className="w-full h-48 sm:h-60 object-cover rounded-2xl"
            />

            <div className="space-y-3">
              <h3 className="text-2xl font-bold">{selectedProject.title[lang]}</h3>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {selectedProject.fullDescription[lang]}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedProject.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/40">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                {lang === 'pt' ? 'Fechar' : 'Close'}
              </button>
              {selectedProject.demoUrl && (
                <a
                  href={selectedProject.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {lang === 'pt' ? 'Acessar Projeto' : 'Open Project'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
