import { Project, Service, ArticleOrVideo, SocialLink, AffiliateProduct, SocialChannel } from '../types';

export const PROFILE = {
  name: "Thiago Lino",
  handle: "@thiagolino",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  role: {
    pt: "Desenvolvedor Full Stack & Criador de Conteúdo Tech",
    en: "Full Stack Developer & Tech Content Creator"
  },
  tagline: {
    pt: "Sua vitrine oficial com os melhores cursos, ferramentas, produtos recomendados e links de afiliado.",
    en: "Your official hub for top courses, tools, recommended products, and affiliate links."
  },
  bio: {
    pt: "Criador de conteúdo, afiliado profissional e engenheiro de software. Aqui você encontra cupons de desconto exclusivos, infoprodutos testados e aprovados, além de acesso direto às minhas redes sociais.",
    en: "Content creator, affiliate partner, and software engineer. Find exclusive discount coupons, verified products, and direct links to all my channels."
  },
  email: "thiagolino974@gmail.com",
  whatsappNumber: "5511999999999",
  telegramChannel: "https://t.me/thiagolinotech",
  location: "Brasil / Remoto",
  verified: true,
  totalViews: 14250,
  availability: {
    pt: "Links verificados & Ofertas ativas hoje",
    en: "Verified links & Active deals today"
  },
  stats: [
    { label: { pt: "Cliques em Ofertas", en: "Total Clicks" }, value: "28.5K+" },
    { label: { pt: "Produtos Recomendados", en: "Products" }, value: "24" },
    { label: { pt: "Membros no Telegram", en: "Telegram VIP" }, value: "12.4K" },
    { label: { pt: "Seguidores nas Redes", en: "Community" }, value: "100K+" }
  ]
};

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    id: 'hotmart-fullstack-mastery',
    title: {
      pt: 'Formação Full Stack Web Developer (Hotmart)',
      en: 'Full Stack Web Developer Bootcamp (Hotmart)'
    },
    description: {
      pt: 'Curso completo do zero ao profissional em React, TypeScript, Node.js e Cloud com certificado e suporte de mentores.',
      en: 'Complete zero-to-hero bootcamp in React, TypeScript, Node.js, and Cloud with mentorship.'
    },
    price: 297,
    originalPrice: 497,
    coupon: 'LINOVIP10',
    url: 'https://hotmart.com/pt-br/marketplace/produtos/fullstack-mastery',
    platform: 'hotmart',
    category: 'course',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    badge: 'Mais Vendido ⭐',
    featured: true,
    clicks: 1420,
    rating: 4.9
  },
  {
    id: 'kiwify-ebook-dev-produtivo',
    title: {
      pt: 'E-book: O Guia do Desenvolvedor de Alta Performance (Kiwify)',
      en: 'E-book: High-Performance Dev Playbook (Kiwify)'
    },
    description: {
      pt: 'Aprenda rotinas de estudo, técnicas de foco, atalhos de arquitetura e estratégias para acelerar sua carreira tech.',
      en: 'Master study routines, deep work focus, architecture shortcuts, and tech career growth.'
    },
    price: 37,
    originalPrice: 67,
    coupon: 'EBOOK20',
    url: 'https://pay.kiwify.com.br/ebook-dev-produtivo',
    platform: 'kiwify',
    category: 'ebook',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    badge: 'Ofertão R$37',
    featured: true,
    clicks: 980,
    rating: 4.8
  },
  {
    id: 'youtube-curso-gratis-react',
    title: {
      pt: 'Curso Gratuito: React.js + TypeScript na Prática (YouTube)',
      en: 'Free Course: Hands-on React.js + TypeScript (YouTube)'
    },
    description: {
      pt: 'Vídeo aula completa de 2 horas ensinando a criar aplicações reais, consumir APIs e publicar na nuvem de graça.',
      en: 'Complete 2-hour video tutorial teaching how to build real apps and deploy to cloud for free.'
    },
    price: 0,
    originalPrice: 199,
    coupon: 'GRATIS2026',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'youtube',
    category: 'course',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    badge: 'Curso 100% Grátis 🎥',
    featured: true,
    clicks: 2150,
    rating: 5.0
  },
  {
    id: 'amazon-desk-gear',
    title: {
      pt: 'Teclado Mecânico Ergonômico RGB (Amazon)',
      en: 'Ergonomic RGB Mechanical Keyboard (Amazon)'
    },
    description: {
      pt: 'Switches silenciosos, conectividade bluetooth/2.4Ghz e digitação ultra-confortável para longas horas de código.',
      en: 'Quiet switches, dual wireless/Bluetooth connectivity, and ultimate ergonomic typing comfort.'
    },
    price: 349,
    originalPrice: 420,
    coupon: 'AMAZONDEV',
    url: 'https://www.amazon.com.br',
    platform: 'amazon',
    category: 'gear',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    badge: 'Frete Grátis Prime',
    featured: false,
    clicks: 750,
    rating: 4.7
  },
  {
    id: 'shoppee-monitor-setup',
    title: {
      pt: 'Monitor Curvo Ultrawide 34" 144Hz (Shopee)',
      en: '34" Curved Ultrawide Monitor 144Hz (Shopee)'
    },
    description: {
      pt: 'Espaço de sobra para ver múltiplos arquivos de código, design em alta resolução e painel anti-reflexo.',
      en: 'Expansive screen estate for code editors, side-by-side docs, and high color accuracy.'
    },
    price: 1890,
    originalPrice: 2200,
    coupon: 'SHOPEEOFERTA',
    url: 'https://shopee.com.br',
    platform: 'shoppee',
    category: 'gear',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    badge: 'Cupom de Frete',
    featured: true,
    clicks: 1120,
    rating: 4.9
  },
  {
    id: 'eduzz-formacao-ai',
    title: {
      pt: 'Masterclass Engenharia de IA com Gemini API (Eduzz)',
      en: 'AI Engineering Masterclass with Gemini API (Eduzz)'
    },
    description: {
      pt: 'Aprenda a construir assistentes de código, RAGs com banco vetorial e aplicações inteligentes com a API do Google.',
      en: 'Build intelligent assistants, vector search RAG systems, and AI web applications with Gemini API.'
    },
    price: 197,
    originalPrice: 350,
    coupon: 'AIDEV50',
    url: 'https://eduzz.com',
    platform: 'eduzz',
    category: 'infoproduct',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    badge: 'Novo 🚀',
    featured: false,
    clicks: 640,
    rating: 5.0
  },
  {
    id: 'monetizze-saas-hosting',
    title: {
      pt: 'Servidor VPS Cloud de Alta Performance (Monetizze)',
      en: 'High-Performance VPS Cloud Server (Monetizze)'
    },
    description: {
      pt: 'Hospede seus projetos com IP dedicado, SSD NVMe ultra-rápido e backup automático diário com $50 de crédito.',
      en: 'Host web apps with dedicated IP, ultra-fast NVMe storage, and $50 trial credit bonus.'
    },
    price: 29,
    originalPrice: 49,
    coupon: 'CLOUD50',
    url: 'https://monetizze.com.br/vps-cloud',
    platform: 'monetizze',
    category: 'software',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    badge: 'R$50 Bônus',
    featured: false,
    clicks: 430,
    rating: 4.6
  }
];

export const SOCIAL_CHANNELS: SocialChannel[] = [
  {
    id: 'kwai',
    platform: 'kwai',
    title: 'Kwai @thiagolino',
    handle: '@thiagolino',
    url: 'https://kwai.com/@thiagolino',
    followers: '52.8K',
    iconName: 'Flame',
    badge: 'Kwai Creator VIP',
    featured: true,
    connected: true,
    lastSyncedAt: 'Hoje'
  },
  {
    id: 'pinterest',
    platform: 'pinterest',
    title: 'Pinterest @thiagolinotech',
    handle: '@thiagolinotech',
    url: 'https://pinterest.com/thiagolinotech',
    followers: '34.5K',
    iconName: 'Pin',
    badge: 'Ideias & Setup',
    featured: true,
    connected: true,
    lastSyncedAt: 'Hoje'
  },
  {
    id: 'instagram',
    platform: 'instagram',
    title: 'Instagram @thiagolino',
    handle: '@thiagolino',
    url: 'https://instagram.com/thiagolino',
    followers: '45.2K',
    iconName: 'Instagram',
    badge: 'Diário & Stories',
    featured: true,
    connected: true,
    lastSyncedAt: 'Hoje'
  },
  {
    id: 'tiktok',
    platform: 'tiktok',
    title: 'TikTok @thiagolinotech',
    handle: '@thiagolinotech',
    url: 'https://tiktok.com/@thiagolinotech',
    followers: '68.0K',
    iconName: 'Video',
    badge: 'Vídeos Curtos',
    featured: true,
    connected: true,
    lastSyncedAt: 'Hoje'
  },
  {
    id: 'youtube',
    platform: 'youtube',
    title: 'Canal no YouTube',
    handle: 'Thiago Lino Tech',
    url: 'https://youtube.com/@thiagolino',
    followers: '100K+',
    iconName: 'Youtube',
    badge: 'Aulas & Reviews',
    featured: true,
    connected: true,
    lastSyncedAt: 'Hoje'
  },
  {
    id: 'threads',
    platform: 'threads',
    title: 'Threads @thiagolino',
    handle: '@thiagolino',
    url: 'https://threads.net/@thiagolino',
    followers: '18.2K',
    iconName: 'AtSign',
    badge: 'Debates Tech',
    connected: true,
    lastSyncedAt: 'Hoje'
  },
  {
    id: 'telegram',
    platform: 'telegram',
    title: 'Grupo VIP no Telegram',
    handle: 't.me/thiagolinotech',
    url: 'https://t.me/thiagolinotech',
    followers: '12.4K',
    iconName: 'Send',
    badge: 'Cupons em Tempo Real',
    featured: true,
    connected: true,
    lastSyncedAt: 'Hoje'
  },
  {
    id: 'whatsapp',
    platform: 'whatsapp',
    title: 'Comunidade Oficial no WhatsApp',
    handle: 'Grupo de Ofertas VIP',
    url: 'https://chat.whatsapp.com/example',
    followers: '5.0K',
    iconName: 'MessageCircle',
    badge: 'Alertas 24/7',
    connected: true,
    lastSyncedAt: 'Hoje'
  },
  {
    id: 'facebook',
    platform: 'facebook',
    title: 'Página Facebook Tech',
    handle: 'Thiago Lino Oficial',
    url: 'https://facebook.com/thiagolinooficial',
    followers: '28.9K',
    iconName: 'Facebook',
    badge: 'Comunidade',
    connected: true,
    lastSyncedAt: 'Hoje'
  }
];


export const PROJECTS: Project[] = [
  {
    id: 'ai-studio-saas',
    title: {
      pt: 'Plataforma SaaS com Inteligência Artificial',
      en: 'AI-Powered SaaS Platform'
    },
    description: {
      pt: 'Interface inteligente para geração automática de relatórios e insights estratégicos com suporte a IA Gemini.',
      en: 'Intelligent interface for automated report generation and strategic insights powered by Gemini AI.'
    },
    fullDescription: {
      pt: 'Aplicação Web completa construída com React, TypeScript, Tailwind CSS e API Gemini. Inclui autenticação, dashboard analítico interativo, exportação PDF/CSV e gerenciamento de estado em tempo real.',
      en: 'Full-stack web application built with React, TypeScript, Tailwind CSS, and Gemini API. Features authentication, interactive analytics dashboard, PDF/CSV export, and real-time state management.'
    },
    category: 'ai',
    tags: ['React', 'TypeScript', 'Gemini AI', 'Tailwind CSS', 'Node.js'],
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    demoUrl: 'https://example.com/demo-ai',
    githubUrl: 'https://github.com/thiagolino/ai-saas-platform',
    featured: true,
    metrics: '5.0 ★ (120+ reviews)'
  },
  {
    id: 'dev-finances-app',
    title: {
      pt: 'Finanças Pro - Gestão Financeira Pessoal',
      en: 'Finances Pro - Personal Finance Manager'
    },
    description: {
      pt: 'Sistema intuitivo de controle financeiro com gráficos interativos em tempo real e orçamentos automatizados.',
      en: 'Intuitive financial management system with real-time interactive charts and automated budgets.'
    },
    fullDescription: {
      pt: 'Painel financeiro moderno com suporte a múltiplas moedas, categorização automática por aprendizado de máquina, exportação de relatórios mensais e criptografia de ponta a ponta.',
      en: 'Modern financial dashboard supporting multi-currencies, automatic machine learning categorization, monthly report exports, and end-to-end encryption.'
    },
    category: 'web',
    tags: ['React', 'Recharts', 'Tailwind CSS', 'PostgreSQL'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    demoUrl: 'https://example.com/demo-finances',
    githubUrl: 'https://github.com/thiagolino/finances-pro',
    featured: true
  },
  {
    id: 'dev-link-hub',
    title: {
      pt: 'Vitrine de Links & Hub do Criador',
      en: 'Link Showcase & Creator Hub'
    },
    description: {
      pt: 'Plataforma ultra-rápida e otimizada para criadores reunirem links, portfólio e serviços em um único lugar.',
      en: 'Ultra-fast creator platform to unify links, portfolio, and services in a single high-performance page.'
    },
    fullDescription: {
      pt: 'Link-in-bio customizado com suporte a busca rápida, temas dinâmicos claro/escuro, métricas de engajamento e integração com meios de contato e formulários.',
      en: 'Customized link-in-bio experience with instant search, dynamic dark/light theme, engagement metrics, and contact integration.'
    },
    category: 'web',
    tags: ['TypeScript', 'Vite', 'Tailwind CSS'],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    demoUrl: 'https://example.com/demo-links',
    githubUrl: 'https://github.com/thiagolino/link-showcase',
    featured: false
  },
  {
    id: 'open-source-ui-kit',
    title: {
      pt: 'UI Components Kit (Código Aberto)',
      en: 'Open Source UI Components Kit'
    },
    description: {
      pt: 'Biblioteca de componentes acessíveis e reutilizáveis em React e Tailwind CSS para aceleração de MVPs.',
      en: 'Accessible, reusable React & Tailwind CSS component library designed to accelerate MVP development.'
    },
    fullDescription: {
      pt: 'Mais de 40 componentes prontos para produção com testes unitários, suporte completo a leitores de tela (WCAG AA), e documentação interativa.',
      en: 'Over 40 production-ready components with unit tests, WCAG AA accessibility support, and interactive storybook documentation.'
    },
    category: 'open-source',
    tags: ['React', 'Tailwind', 'Storybook', 'WCAG'],
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    githubUrl: 'https://github.com/thiagolino/ui-components-kit',
    featured: false
  }
];

export const SERVICES: Service[] = [
  {
    id: 'fullstack-dev',
    title: {
      pt: 'Desenvolvimento Web Full Stack',
      en: 'Full Stack Web Development'
    },
    description: {
      pt: 'Criação de aplicações web modernas, responsivas e de altíssima performance, do banco de dados à interface do usuário.',
      en: 'Building modern, responsive, ultra-performant web apps, from database design to high-converting user interfaces.'
    },
    iconName: 'Code',
    features: {
      pt: ['Arquitetura limpa e escalável', 'APIs REST / GraphQL rápidas', 'Design System e componentes reutilizáveis', 'Otimização SEO e performance (Lighthouse 95+)'],
      en: ['Clean, scalable architecture', 'Fast REST / GraphQL APIs', 'Design Systems & reusable UI', 'SEO & Lighthouse 95+ optimization']
    },
    deliverables: {
      pt: 'Código-fonte limpo, documentação e deploy configurado.',
      en: 'Clean source code, documentation, and automated deployment setup.'
    }
  },
  {
    id: 'tech-consulting',
    title: {
      pt: 'Consultoria e Auditoria de Código',
      en: 'Tech Consulting & Code Audit'
    },
    description: {
      pt: 'Análise detalhada de código existente, otimização de performance, segurança e refinamento de arquitetura de software.',
      en: 'In-depth code reviews, performance bottleneck removal, security audits, and architectural refinements.'
    },
    iconName: 'ShieldCheck',
    features: {
      pt: ['Diagnóstico de gargalos de performance', 'Revisão de padrões de segurança', 'Refatoração para TypeScript estrito', 'Plano de ação estratégico detalhado'],
      en: ['Performance bottleneck diagnostic', 'Security standard review', 'Strict TypeScript refactoring', 'Actionable strategic roadmap']
    },
    deliverables: {
      pt: 'Relatório completo de auditoria e sessão de alinhamento.',
      en: 'Comprehensive audit report and live 1-on-1 strategy call.'
    }
  },
  {
    id: 'content-creation',
    title: {
      pt: 'Conteúdo Tech & Parcerias de Marca',
      en: 'Tech Content & Brand Partnerships'
    },
    description: {
      pt: 'Criação de tutoriais, avaliações técnicas e conteúdo educativo sobre ferramentas de desenvolvimento para marcas de tecnologia.',
      en: 'Creating engaging tutorials, technical reviews, and educational content for modern developer tools and brands.'
    },
    iconName: 'Video',
    features: {
      pt: ['Vídeos detalhados e práticos', 'Artigos técnicos e guias passo a passo', 'Divulgação para audiência engajada', 'Demonstração real de produtos'],
      en: ['In-depth hands-on video tutorials', 'Step-by-step tech guides', 'Reaching an engaged dev audience', 'Authentic product walk-throughs']
    },
    deliverables: {
      pt: 'Vídeo em alta definição, roteiro aprovado e divulgação em redes.',
      en: 'HD video, approved script, and multi-channel promotion.'
    }
  }
];

export const CONTENT_ITEMS: ArticleOrVideo[] = [
  {
    id: 'video-tutorial-cupons',
    type: 'video',
    title: {
      pt: 'Vídeo Aula: Como Usar Cupons de Desconto na Shopee, Hotmart e Amazon',
      en: 'Video Tutorial: How to Redeem Discount Coupons Step-by-Step'
    },
    summary: {
      pt: 'Aprenda em 5 minutos como aplicar os cupons secretos da nossa vitrine para pagar muito mais barato em produtos e cursos.',
      en: 'Learn in 5 minutes how to apply secret discount coupons on courses and products.'
    },
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    date: 'Hoje',
    readOrWatchTime: '5 min de vídeo',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=600&q=80',
    badge: 'Aprenda Fácil 🎥'
  },
  {
    id: 'video-tutorial-afiliado',
    type: 'video',
    title: {
      pt: 'Guia do Afiliado: Como Montar sua Vitrine e Vender sem Aparecer',
      en: 'Affiliate Playbook: Building Your Vitrine and Selling Products'
    },
    summary: {
      pt: 'Tutorial prático ensinando como divulgar links de afiliados no Kwai, TikTok, Telegram e Instagram de forma 100% automatizada.',
      en: 'Hands-on tutorial showing how to promote affiliate links across Kwai, TikTok and Telegram.'
    },
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    date: '20 Jul 2026',
    readOrWatchTime: '12 min de vídeo',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    badge: 'Recomendado ⭐'
  },
  {
    id: 'video-ai-studio',
    type: 'video',
    title: {
      pt: 'Como Criar Aplicações Modernas com IA Gemini e React',
      en: 'Building Modern Web Apps with Gemini AI & React'
    },
    summary: {
      pt: 'Aprenda do zero como integrar a API do Gemini no backend Node.js e criar interfaces ricas e reativas em React.',
      en: 'Learn step-by-step how to integrate the Gemini API into a Node.js backend and build rich React UIs.'
    },
    url: 'https://youtube.com',
    date: '15 Jul 2026',
    readOrWatchTime: '18 min',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    badge: 'Popular'
  },
  {
    id: 'article-ts-best-practices',
    type: 'article',
    title: {
      pt: 'Boas Práticas de TypeScript em Projetos de Grande Porte',
      en: 'TypeScript Best Practices for Large Scale Applications'
    },
    summary: {
      pt: 'Guia definitivo de tipagem avançada, desacoplamento de módulos e prevenção de erros comuns de runtime.',
      en: 'Definitive guide on advanced typing, module decoupling, and runtime error prevention.'
    },
    url: 'https://dev.to',
    date: '02 Jun 2026',
    readOrWatchTime: '8 min de leitura',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
  }
];

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'github',
    title: 'GitHub',
    url: 'https://github.com/thiagolino',
    iconName: 'Github',
    handle: '@thiagolino',
    category: 'work',
    badge: '40+ Repos'
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    url: 'https://linkedin.com/in/thiagolino',
    iconName: 'Linkedin',
    handle: 'Thiago Lino',
    category: 'work'
  },
  {
    id: 'youtube',
    title: 'YouTube',
    url: 'https://youtube.com/@thiagolino',
    iconName: 'Youtube',
    handle: 'Thiago Lino Tech',
    category: 'community',
    badge: '100K'
  },
  {
    id: 'instagram',
    title: 'Instagram',
    url: 'https://instagram.com/thiagolino',
    iconName: 'Instagram',
    handle: '@thiagolino',
    category: 'social'
  },
  {
    id: 'twitter',
    title: 'Twitter / X',
    url: 'https://twitter.com/thiagolino',
    iconName: 'Twitter',
    handle: '@thiagolino',
    category: 'social'
  }
];
