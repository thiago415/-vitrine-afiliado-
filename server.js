import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Parse JSON body payloads
app.use(express.json());

// Lazy-initialized Gemini client helper
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint to serve Firebase config securely to the client
app.get('/api/config', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      res.json(JSON.parse(configData));
    } else {
      res.status(404).json({ error: 'Config file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read config' });
  }
});

// API endpoint to extract links and products automatically from text or a URL
app.post('/api/gemini/extract-links', async (req, res) => {
  try {
    const { text, url } = req.body;
    
    if (!text && !url) {
      return res.status(400).json({ error: 'É necessário fornecer um texto ou uma URL para extração.' });
    }

    let rawContent = "";
    if (url) {
      try {
        const parsedUrl = new URL(url);
        const fetchResponse = await fetch(parsedUrl.toString(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          }
        });
        
        if (!fetchResponse.ok) {
          throw new Error(`Código de status HTTP ${fetchResponse.status}`);
        }
        
        const html = await fetchResponse.text();
        let cleanHtml = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');

        rawContent = `CONTEÚDO DA PÁGINA WEB (${url}):\n\n${cleanHtml.substring(0, 40000)}`;
      } catch (err) {
        return res.status(400).json({ 
          error: `Não conseguimos acessar essa URL diretamente devido a restrições de rede ou segurança do site (erro: ${err.message}). Tente copiar o conteúdo da página com o mouse e colar como texto no campo acima!` 
        });
      }
    } else {
      rawContent = text;
    }

    const ai = getGeminiClient();
    const systemInstruction = `
Você é um extrator de dados de alta precisão. Sua tarefa é analisar o conteúdo fornecido (que pode ser um texto simples ou código HTML de uma página de links) e extrair TODOS os links de canais, perfis sociais, produtos de afiliados ou ofertas presentes.

Diretrizes de extração:
1. Identifique o nome/título amigável do produto, loja ou canal. Limpe nomes muito técnicos ou poluídos (Ex: se no link diz 'GARRAFA TERMICA DE INOX - COR AZUL - LOJA X', simplifique para '🥤 Garrafa Térmica de Inox'). Sempre adicione um emoji bonito e relevante no início do título.
2. Identifique a URL completa correta de destino para cada item. Ela deve ser uma URL válida. Se a URL não começar com "http://" ou "https://", adicione "https://" no início automaticamente (por exemplo, se o texto tiver apenas "shopee.com.br/produto", salve como "https://shopee.com.br/produto").
3. Classifique o estilo visual de destaque ("style") como:
   - "normal" (estilo padrão para a maioria dos links)
   - "highlight" (para links de destaque principal, como o site/produto principal)
   - "pulse" (para canais de ofertas, grupos de WhatsApp, ou um produto com desconto urgente que pisca na tela).

Retorne SEMPRE um array JSON puro (sem explicações, comentários ou formatação adicional, apenas o JSON bruto válido) contendo objetos com esta estrutura exata:
[
  {
    "title": "Título com Emoji",
    "url": "https://...",
    "style": "normal" | "highlight" | "pulse"
  }
]

Se nenhum link ou produto for encontrado, retorne um array vazio [].
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analise e extraia os produtos e links do seguinte conteúdo:\n\n${rawContent}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Título amigável com emoji e descrição curta do produto/canal" },
              url: { type: Type.STRING, description: "URL de destino absoluta completa" },
              style: { type: Type.STRING, description: "Estilo do botão: normal, highlight ou pulse" }
            },
            required: ["title", "url", "style"]
          }
        }
      }
    });

    let extractedLinks = [];
    try {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }
      extractedLinks = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError);
      return res.status(500).json({ error: 'Erro ao processar a resposta estruturada da inteligência artificial.' });
    }

    res.json({ links: extractedLinks });
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("GEMINI_API_KEY")) {
      res.status(400).json({ error: "A chave da API do Gemini (GEMINI_API_KEY) não está configurada nos segredos (Secrets) do projeto." });
    } else {
      res.status(500).json({ error: `Erro na extração de links: ${error.message}` });
    }
  }
});

// API endpoint for automatic virtual support chat using Gemini
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, profileData } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    let systemInstruction = "";

    if (profileData) {
      const displayName = profileData.displayName || profileData.username;
      const bio = profileData.bio || "";
      const linksText = (profileData.links || []).map(l => `- Título do Botão: "${l.title}", Link/URL: "${l.url}"`).join("\n");
      const socialsText = Object.entries(profileData.socials || {})
        .filter(([_, val]) => !!val)
        .map(([name, val]) => `- ${name}: ${val}`).join("\n");

      systemInstruction = `
Você é a inteligência artificial (Atendente Virtual) oficial da vitrine de links de "${displayName}".
Seu objetivo é ajudar os visitantes (o público) que estão acessando a vitrine de links de ${displayName}. Você deve ser extremamente simpático(a), carismático(a), prestativo(a) e objetivo(a).

Sempre responda em Português do Brasil!

Aqui estão as informações reais sobre a vitrine de ${displayName}:
- Biografia: ${bio}
- Links de Produtos/Canais cadastrados na Vitrine (quando o usuário perguntar por promoções, canais, sites ou produtos, recomende o TÍTULO exato desses links para ele clicar diretamente nos botões da vitrine!):
${linksText || "Nenhum link de produto cadastrado no momento."}

- Redes Sociais cadastradas:
${socialsText || "Nenhuma rede social cadastrada."}

Diretrizes de conversação:
1. Seja amigável e utilize emojis bonitos. Responda de forma curta e direta (máximo 2 a 3 parágrafos) para carregar rápido na tela de chat de celular do visitante.
2. Quando o visitante perguntar sobre um produto, cupom, ou canal, explique brevemente e cite o título do botão (Ex: "Clique no botão '🛒 ACESSE MEUS PRODUTOS AQUI'").
3. Se o visitante quiser reclamar de algum link quebrado, erro técnico na página ou bug, peça gentilmente para ele clicar na aba "Relatar Erro" no topo desta própria caixinha de chat, para que o proprietário da vitrine ou a equipe técnica possa corrigir imediatamente!
4. Nunca invente ou crie links ou URLs que não estejam na lista acima de links cadastrados! Se o que eles pediram não está na lista, diga educadamente que não possui esse link cadastrado no momento.
`;
    } else {
      systemInstruction = `
Você é o assistente automático inteligente (Atendente Virtual) oficial da plataforma "Vitrine de Links" criada por Thiago Lino.
A "Vitrine de Links" é uma plataforma onde afiliados e influenciadores podem criar uma vitrine de links personalizada e otimizada para suas redes sociais (Instagram, TikTok, YouTube, Kwai, etc.). Nessa página eles podem consolidar seus links de produtos afiliados da Shopee, Amazon, AliExpress, Magalu, etc.

Guia de recursos da plataforma para você ajudar os usuários:
1. Cadastro: Qualquer um pode se cadastrar gratuitamente fornecendo E-mail, Senha e um Nome de Usuário (Slug). O endereço da vitrine ficará: vitrinelinks.com/usuario (ou no navegador como /usuario).
2. Adicionar Links: No painel do usuário, eles podem criar, editar e excluir links. Cada link pode ter:
   - Título do Botão (Ex: "🛒 PRODUTOS E ACHADINHOS")
   - URL de destino (Ex: link de afiliado da Shopee ou Amazon)
   - Efeito Visual: "Normal", "Destaque Principal" (estilo verde elegante) ou "Chamar Atenção" (efeito pulsar dourado).
3. Redes Sociais: No painel, aba "Redes Sociais", eles podem cadastrar links para Facebook, YouTube, TikTok, Kwai, Pinterest, Instagram, WhatsApp, e Telegram.
4. Temas Disponíveis: Eles podem escolher entre vários presets lindos de temas na aba "Mudar Tema": "Default" (clássico), "Sunset" (tons quentes e degradê), "Forest" (tons de verde elegante), "Ocean" (degradê azul-ciano), "Dark" (modo escuro elegante), e "Cyberpunk" (estilo futurista neon).
5. Pré-visualização: No painel, as alterações aparecem em tempo real no mockup de celular do lado direito da tela. Eles devem clicar em "Salvar" para aplicar as mudanças em nuvem.
6. Problemas com o aplicativo: Se o usuário relatar que há algo de errado, bug ou link quebrado, peça gentilmente para ele preencher o formulário na aba "Relatar Erro" no topo desta própria caixinha de suporte para que nossa equipe técnica analise e corrija o problema imediatamente.

Mantenha suas respostas sempre em português do Brasil, de forma muito atenciosa, prestativa, objetiva e curta. Formate com markdown amigável (negritos e listas) para facilitar a leitura.
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("GEMINI_API_KEY")) {
      res.json({ reply: "Olá! O atendimento automático inteligente está em modo de demonstração no momento (chave de API não configurada em Secrets). Mas você pode relatar qualquer erro ou sugestão na aba 'Relatar Erro' acima!" });
    } else {
      res.json({ reply: "Desculpe-me, tive um problema temporário ao processar sua resposta. Por favor, tente perguntar novamente!" });
    }
  }
});

// API endpoint to generate high quality SVG logos/avatars using Gemini
app.post('/api/gemini/generate-logo', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Por favor, digite o que você gostaria de ver no seu logotipo.' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `
Você é um Designer Gráfico e Ilustrador profissional de alta performance, especializado em criar logotipos modernos, minimalistas e icônicos em formato SVG bruto.

O usuário quer um logotipo/avatar para a sua "Vitrine de Links" com o tema ou ideia: "${prompt}".

Sua tarefa é projetar e retornar o código XML de uma única imagem SVG (<svg ...> ... </svg>) que seja:
1. Quadrada ou perfeitamente circular (aspect-ratio 1:1, use viewBox="0 0 100 100").
2. Super moderna, com contrastes elegantes e cores vibrantes. Você PODE (e deve) usar degradês lineares ou radiais definidos dentro da tag <defs> com IDs exclusivos para dar profundidade e visual premium (Ex: <linearGradient id="grad1">).
3. Extremamente bem desenhada e limpa usando formas nativas SVG (como <circle>, <path>, <rect>, <text> de fontes padrão como sans-serif ou monospace, <g>).
4. O design deve ter um fundo colorido bonito (ex: círculo escuro com degradê brilhante de fundo) e um ícone ou símbolo claro e visível no centro (como sacola de compras estilizada, carrinho de compras, foguete de ofertas, raios, iniciais, fone de ouvido, etc. dependendo do tema).
5. Certifique-se de que o SVG se adapta bem em um container redondo (rounded-full).
6. IMPORTANTE: Retorne APENAS o código SVG bruto e limpo, sem nenhuma formatação Markdown (NÃO coloque dentro de blocos de código com \`\`\`xml ou \`\`\`svg), sem explicações de texto, sem tags HTML adicionais. Comece diretamente com "<svg" e termine com "</svg>".
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Crie um logotipo SVG maravilhoso, moderno e profissional para o tema: ${prompt}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    let svgCode = response.text.trim();
    
    // Safety cleanup of markdown wraps if any slipped in
    if (svgCode.includes('```')) {
      svgCode = svgCode.replace(/```[a-zA-Z]*/g, '').replace(/```/g, '').trim();
    }
    
    // If it has HTML comments or doc declaration, remove them
    const svgStartIdx = svgCode.indexOf('<svg');
    const svgEndIdx = svgCode.lastIndexOf('</svg>');
    
    if (svgStartIdx !== -1 && svgEndIdx !== -1) {
      svgCode = svgCode.substring(svgStartIdx, svgEndIdx + 6);
    }

    if (!svgCode.startsWith('<svg')) {
      throw new Error("Resposta da IA não continha um elemento SVG válido.");
    }

    res.json({ success: true, svg: svgCode });
  } catch (error) {
    console.error("Gemini Logo Generation Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("GEMINI_API_KEY")) {
      res.status(400).json({ error: "A chave de API do Gemini (GEMINI_API_KEY) não está configurada nos segredos (Secrets)." });
    } else {
      res.status(500).json({ error: `Erro ao gerar logotipo com IA: ${error.message}` });
    }
  }
});

// Helper function to generate a beautiful custom theme locally when Gemini API fails or is not configured
function generateLocalTheme(prompt) {
  const p = (prompt || '').toLowerCase();
  
  // Determine if user requested a dark or light style
  let isDark = false;
  if (p.includes('escuro') || p.includes('dark') || p.includes('preto') || p.includes('black') || p.includes('neon') || p.includes('cyber') || p.includes('night') || p.includes('noite') || p.includes('burger') || p.includes('hamburguer') || p.includes('carbon') || p.includes('chumbo')) {
    isDark = true;
  }
  // If explicitly light, force light
  if (p.includes('claro') || p.includes('light') || p.includes('branco') || p.includes('white') || p.includes('pastel') || p.includes('suave') || p.includes('bege') || p.includes('cream') || p.includes('creme') || p.includes('romântic') || p.includes('doce')) {
    isDark = false;
  }

  // Determine color category based on keywords
  let color = 'neutral';
  if (p.includes('rosa') || p.includes('pink') || p.includes('rose') || p.includes('doce') || p.includes('confeitaria') || p.includes('sakura') || p.includes('maquiagem') || p.includes('makeup') || p.includes('beleza') || p.includes('sweet') || p.includes('unha') || p.includes('lash') || p.includes('estetic') || p.includes('morango') || p.includes('romant')) {
    color = 'pink';
  } else if (p.includes('vermelho') || p.includes('red') || p.includes('cherry') || p.includes('cereja') || p.includes('rubi') || p.includes('ruby')) {
    color = 'red';
  } else if (p.includes('laranja') || p.includes('orange') || p.includes('coral') || p.includes('sunset') || p.includes('bronze')) {
    color = 'orange';
  } else if (p.includes('amarelo') || p.includes('yellow') || p.includes('ouro') || p.includes('gold') || p.includes('dourado') || p.includes('sol') || p.includes('solar')) {
    color = 'amber';
  } else if (p.includes('verde') || p.includes('green') || p.includes('emerald') || p.includes('esmeralda') || p.includes('floresta') || p.includes('forest') || p.includes('nature') || p.includes('eco') || p.includes('organico') || p.includes('fit') || p.includes('nutri') || p.includes('saude') || p.includes('folha')) {
    color = 'emerald';
  } else if (p.includes('turquesa') || p.includes('teal') || p.includes('cyan') || p.includes('ciano')) {
    color = 'teal';
  } else if (p.includes('azul') || p.includes('blue') || p.includes('ocean') || p.includes('oceano') || p.includes('mar') || p.includes('marinho') || p.includes('navy') || p.includes('sky') || p.includes('celeste') || p.includes('clinica') || p.includes('medico') || p.includes('advogado') || p.includes('finance') || p.includes('seguro')) {
    color = 'blue';
  } else if (p.includes('roxo') || p.includes('purple') || p.includes('violet') || p.includes('violeta') || p.includes('fuchsia') || p.includes('fucsia') || p.includes('magenta') || p.includes('lilás') || p.includes('lilas') || p.includes('lilac') || p.includes('uva') || p.includes('grape')) {
    color = 'purple';
  } else if (p.includes('ouro') || p.includes('gold') || p.includes('luxo') || p.includes('premium') || p.includes('vip') || p.includes('joia')) {
    color = 'gold';
  } else if (p.includes('cinza') || p.includes('gray') || p.includes('grey') || p.includes('silver') || p.includes('prata') || p.includes('slate') || p.includes('chumbo') || p.includes('carbon') || p.includes('minimal')) {
    color = 'neutral';
  }

  // Pre-configured rich palettes
  const palettes = {
    pink: {
      dark: {
        bodyBg: "bg-gradient-to-br from-pink-950 via-slate-950 to-pink-900",
        cardBg: "bg-slate-900/90 text-white border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.15)]",
        avatarBg: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
        bioColor: "text-pink-300",
        buttonNormal: "bg-slate-800 hover:bg-slate-750 text-pink-200 font-bold border border-pink-900/40",
        buttonHighlight: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold shadow-md shadow-pink-500/20",
        buttonPulse: "bg-gradient-to-r from-yellow-400 via-pink-500 to-rose-500 text-white font-black pulse-gold border border-pink-500",
        socialIconColor: "text-pink-400 hover:text-white bg-slate-800 hover:bg-pink-900"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200",
        cardBg: "bg-white/95 backdrop-blur-md text-rose-950 border border-pink-200/60 shadow-md",
        avatarBg: "bg-gradient-to-r from-pink-400 to-rose-400 text-white",
        bioColor: "text-rose-500",
        buttonNormal: "bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold border border-rose-200",
        buttonHighlight: "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-amber-400 to-rose-500 text-white font-black pulse-gold border border-pink-400",
        socialIconColor: "text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100"
      }
    },
    red: {
      dark: {
        bodyBg: "bg-gradient-to-br from-red-950 via-slate-950 to-red-900",
        cardBg: "bg-slate-900/90 text-white border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
        avatarBg: "bg-gradient-to-r from-red-500 to-rose-600 text-white",
        bioColor: "text-red-300",
        buttonNormal: "bg-slate-800 hover:bg-slate-750 text-red-200 font-bold border border-red-900/40",
        buttonHighlight: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold shadow-md shadow-red-500/20",
        buttonPulse: "bg-gradient-to-r from-yellow-400 via-red-500 to-rose-600 text-white font-black pulse-gold border border-red-500",
        socialIconColor: "text-red-400 hover:text-white bg-slate-800 hover:bg-red-900"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-red-50 via-rose-50 to-red-100",
        cardBg: "bg-white/95 backdrop-blur-md text-red-950 border border-red-200/60 shadow-md",
        avatarBg: "bg-gradient-to-r from-red-500 to-rose-500 text-white",
        bioColor: "text-red-600",
        buttonNormal: "bg-red-50 hover:bg-red-100 text-red-800 font-bold border border-red-100",
        buttonHighlight: "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-amber-400 to-red-500 text-white font-black pulse-gold border border-red-400",
        socialIconColor: "text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100"
      }
    },
    orange: {
      dark: {
        bodyBg: "bg-gradient-to-br from-orange-950 via-slate-950 to-orange-900",
        cardBg: "bg-slate-900/90 text-white border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.15)]",
        avatarBg: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
        bioColor: "text-orange-300",
        buttonNormal: "bg-slate-800 hover:bg-slate-750 text-orange-200 font-bold border border-orange-900/40",
        buttonHighlight: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold shadow-md shadow-orange-500/20",
        buttonPulse: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-black pulse-gold border border-orange-500",
        socialIconColor: "text-orange-400 hover:text-white bg-slate-800 hover:bg-orange-900"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-amber-50 via-orange-50 to-orange-100",
        cardBg: "bg-white/95 backdrop-blur-md text-orange-950 border border-orange-200/60 shadow-md",
        avatarBg: "bg-gradient-to-r from-orange-400 to-amber-500 text-white",
        bioColor: "text-orange-600",
        buttonNormal: "bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold border border-orange-100",
        buttonHighlight: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-yellow-300 to-orange-600 text-white font-black pulse-gold border border-orange-500",
        socialIconColor: "text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100"
      }
    },
    amber: {
      dark: {
        bodyBg: "bg-gradient-to-br from-amber-950 via-slate-950 to-amber-900",
        cardBg: "bg-slate-900/90 text-white border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
        avatarBg: "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold",
        bioColor: "text-amber-300",
        buttonNormal: "bg-slate-800 hover:bg-slate-750 text-amber-200 font-bold border border-amber-900/40",
        buttonHighlight: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold shadow-md shadow-amber-500/20",
        buttonPulse: "bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 text-slate-950 font-black pulse-gold border border-amber-500",
        socialIconColor: "text-amber-400 hover:text-white bg-slate-800 hover:bg-amber-900"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100",
        cardBg: "bg-white/95 backdrop-blur-md text-amber-950 border border-amber-200/60 shadow-md",
        avatarBg: "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900",
        bioColor: "text-amber-700",
        buttonNormal: "bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200",
        buttonHighlight: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-yellow-300 to-amber-500 text-slate-950 font-black pulse-gold border border-amber-400",
        socialIconColor: "text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100"
      }
    },
    emerald: {
      dark: {
        bodyBg: "bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900",
        cardBg: "bg-slate-900/90 text-white border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
        avatarBg: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
        bioColor: "text-emerald-300",
        buttonNormal: "bg-slate-800 hover:bg-slate-750 text-emerald-200 font-bold border border-emerald-900/40",
        buttonHighlight: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold shadow-md shadow-emerald-500/20",
        buttonPulse: "bg-gradient-to-r from-yellow-400 via-emerald-500 to-teal-500 text-white font-black pulse-gold border border-emerald-500",
        socialIconColor: "text-emerald-400 hover:text-white bg-slate-800 hover:bg-emerald-900"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100",
        cardBg: "bg-white/95 backdrop-blur-md text-emerald-950 border border-emerald-200/60 shadow-md",
        avatarBg: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
        bioColor: "text-emerald-700",
        buttonNormal: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-100",
        buttonHighlight: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-yellow-400 to-emerald-600 text-white font-black pulse-gold border border-emerald-500",
        socialIconColor: "text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
      }
    },
    teal: {
      dark: {
        bodyBg: "bg-gradient-to-br from-teal-950 via-slate-950 to-teal-900",
        cardBg: "bg-slate-900/90 text-white border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.15)]",
        avatarBg: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white",
        bioColor: "text-teal-300",
        buttonNormal: "bg-slate-800 hover:bg-slate-750 text-teal-200 font-bold border border-teal-900/40",
        buttonHighlight: "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-extrabold shadow-md shadow-teal-500/20",
        buttonPulse: "bg-gradient-to-r from-yellow-400 via-teal-500 to-cyan-500 text-white font-black pulse-gold border border-teal-500",
        socialIconColor: "text-teal-400 hover:text-white bg-slate-800 hover:bg-teal-900"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100",
        cardBg: "bg-white/95 backdrop-blur-md text-teal-950 border border-teal-200/60 shadow-md",
        avatarBg: "bg-gradient-to-r from-teal-500 to-cyan-500 text-white",
        bioColor: "text-teal-700",
        buttonNormal: "bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold border border-teal-100",
        buttonHighlight: "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-yellow-400 to-teal-600 text-white font-black pulse-gold border border-teal-500",
        socialIconColor: "text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100"
      }
    },
    blue: {
      dark: {
        bodyBg: "bg-gradient-to-br from-blue-950 via-slate-950 to-blue-900",
        cardBg: "bg-slate-900/90 text-white border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]",
        avatarBg: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white",
        bioColor: "text-blue-300",
        buttonNormal: "bg-slate-800 hover:bg-slate-750 text-blue-200 font-bold border border-blue-900/40",
        buttonHighlight: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-extrabold shadow-md shadow-blue-500/20",
        buttonPulse: "bg-gradient-to-r from-yellow-400 via-blue-500 to-indigo-500 text-white font-black pulse-gold border border-blue-500",
        socialIconColor: "text-blue-400 hover:text-white bg-slate-800 hover:bg-blue-900"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100",
        cardBg: "bg-white/95 backdrop-blur-md text-blue-950 border border-blue-200/60 shadow-md",
        avatarBg: "bg-gradient-to-r from-blue-600 to-indigo-800 text-white",
        bioColor: "text-blue-600",
        buttonNormal: "bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-100",
        buttonHighlight: "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-amber-400 to-blue-600 text-white font-black pulse-gold border border-blue-500",
        socialIconColor: "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100"
      }
    },
    purple: {
      dark: {
        bodyBg: "bg-gradient-to-br from-purple-950 via-slate-950 to-purple-900",
        cardBg: "bg-slate-900/90 text-white border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
        avatarBg: "bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white",
        bioColor: "text-purple-300",
        buttonNormal: "bg-slate-800 hover:bg-slate-750 text-purple-200 font-bold border border-purple-900/40",
        buttonHighlight: "bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-extrabold shadow-md shadow-purple-500/20",
        buttonPulse: "bg-gradient-to-r from-yellow-400 via-purple-500 to-fuchsia-500 text-white font-black pulse-gold border border-purple-500",
        socialIconColor: "text-purple-400 hover:text-white bg-slate-800 hover:bg-purple-900"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-100",
        cardBg: "bg-white/95 backdrop-blur-md text-purple-950 border border-purple-200/60 shadow-md",
        avatarBg: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
        bioColor: "text-purple-700",
        buttonNormal: "bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold border border-purple-100",
        buttonHighlight: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-yellow-400 to-purple-600 text-white font-black pulse-gold border border-purple-500",
        socialIconColor: "text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100"
      }
    },
    gold: {
      dark: {
        bodyBg: "bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900",
        cardBg: "bg-stone-900/95 text-stone-100 border border-amber-500/20 shadow-[0_0_25px_rgba(212,175,55,0.08)]",
        avatarBg: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-stone-950 font-bold",
        bioColor: "text-amber-400/80",
        buttonNormal: "bg-stone-800 hover:bg-stone-750 text-amber-100 font-bold border border-amber-500/10",
        buttonHighlight: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-stone-950 font-black shadow-lg shadow-amber-500/10",
        buttonPulse: "bg-gradient-to-r from-[#d4af37] via-stone-900 to-[#d4af37] text-white font-black pulse-gold border border-amber-500",
        socialIconColor: "text-amber-400 hover:text-stone-950 bg-stone-800 hover:bg-amber-500"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-amber-50/50 via-stone-100 to-amber-50/30",
        cardBg: "bg-white/95 text-slate-800 border border-amber-200 shadow-md",
        avatarBg: "bg-gradient-to-r from-amber-500 to-[#aa7c11] text-white",
        bioColor: "text-amber-800",
        buttonNormal: "bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold border border-stone-200",
        buttonHighlight: "bg-gradient-to-r from-amber-500 to-[#aa7c11] text-white font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-[#d4af37] to-amber-600 text-white font-black pulse-gold border border-amber-500",
        socialIconColor: "text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100"
      }
    },
    neutral: {
      dark: {
        bodyBg: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
        cardBg: "bg-slate-900/90 text-white border border-slate-700/50 shadow-[0_0_20px_rgba(255,255,255,0.05)]",
        avatarBg: "bg-gradient-to-r from-slate-700 to-slate-800 text-white",
        bioColor: "text-slate-400",
        buttonNormal: "bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold border border-slate-700",
        buttonHighlight: "bg-slate-100 hover:bg-white text-slate-950 font-extrabold shadow-md",
        buttonPulse: "bg-gradient-to-r from-slate-500 to-slate-800 text-white font-black pulse-gold border border-slate-500",
        socialIconColor: "text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-750"
      },
      light: {
        bodyBg: "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200",
        cardBg: "bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200 shadow-sm",
        avatarBg: "bg-gradient-to-r from-slate-800 to-slate-900 text-white",
        bioColor: "text-slate-500",
        buttonNormal: "bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200",
        buttonHighlight: "bg-slate-900 hover:bg-slate-800 text-white font-extrabold shadow-sm",
        buttonPulse: "bg-gradient-to-r from-slate-700 to-slate-900 text-white font-black pulse-gold border border-slate-700",
        socialIconColor: "text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200"
      }
    }
  };

  // Extract selected subpalette or fallback to modern lavender-slate neutral
  const selectedPalette = palettes[color] || palettes.neutral;
  return isDark ? selectedPalette.dark : selectedPalette.light;
}

// API endpoint to generate high quality visual themes using Gemini
app.post('/api/gemini/generate-theme', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Por favor, digite o estilo ou ideia para o tema visual.' });
    }

    let themeData = null;

    try {
      const ai = getGeminiClient();
      const systemInstruction = `
Você é um Designer UI/UX profissional especialista em paletas de cores harmônicas e design moderno de interfaces de usuário (Design System) utilizando Tailwind CSS.

Sua tarefa é gerar uma especificação de tema visual completa e linda baseada no tema ou ideia solicitada pelo usuário: "${prompt}".

Você deve retornar um objeto JSON exatamente com a seguinte estrutura e tipos de classes do Tailwind CSS:
{
  "bodyBg": "Uma classe de fundo para o container externo. Pode ser um gradiente moderno ou cor sólida (ex: 'bg-gradient-to-br from-[#0d001a] via-[#1a0033] to-[#2d004d]' ou 'bg-[#faf7f2]'). Certifique-se de que combina perfeitamente com o mood solicitado.",
  "cardBg": "A classe de fundo para o cartão central de conteúdo principal. Deve ter contraste excelente sobre o bodyBg. (ex: 'bg-white/90 backdrop-blur-md text-stone-800 border border-pink-200/60 shadow-md' ou 'bg-[#120124]/90 text-white border border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.15)]'). Certifique-se de definir a cor do texto padrão (ex: text-slate-800, text-white, text-stone-900) e bordas elegantes correspondentes.",
  "avatarBg": "Classe de fundo e cor de texto do avatar padrão. (ex: 'bg-gradient-to-r from-pink-400 to-rose-400 text-white' ou 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50').",
  "bioColor": "Classe de cor para o texto da biografia/subtítulo. Deve ser ligeiramente mais suave que o texto do cardBg para criar hierarquia visual, mas com ótimo contraste. (ex: 'text-rose-500' ou 'text-fuchsia-300' ou 'text-slate-500').",
  "buttonNormal": "Classe completa para botões padrão/normais na vitrine. Deve ser atraente, com cantos arredondados, preenchimento, hover elegante e cores combinando com o tema. (ex: 'bg-rose-500 hover:bg-rose-600 text-white font-bold' ou 'bg-[#21043d] hover:bg-[#2d0852] text-fuchsia-300 font-bold border border-fuchsia-500/40').",
  "buttonHighlight": "Classe completa para botões de destaque/chamada principal. Deve ter cores vibrantes e contrastantes para atrair cliques. (ex: 'bg-pink-600 hover:bg-pink-700 text-white font-extrabold shadow-md' ou 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-black shadow-[0_0_10px_rgba(217,70,239,0.5)]').",
  "buttonPulse": "Classe para botões de efeito Alerta com animação pulsante embutida. Use a animação 'pulse-gold' e adicione bordas/fundos correspondentes de alto destaque. (ex: 'bg-gradient-to-r from-yellow-300 via-pink-400 to-rose-500 text-white font-black pulse-gold border border-pink-400').",
  "socialIconColor": "Classe para os ícones de redes sociais na base do cartão. Deve ter hover suave de cor de fundo e transição. (ex: 'text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100' ou 'text-fuchsia-400 hover:text-white bg-[#21043d] hover:bg-[#2d0852]')."
}

Diretrizes de Design:
- Evite cinzas genéricos a menos que seja um tema ultra minimalista. Use tons ricos e profundos de cores (esmeralda, fúcsia, âmbar, azul marinho, terracota, etc.) combinados harmonicamente.
- Todos os textos devem possuir CONTRASTE EXCELENTE com o fundo correspondente para máxima legibilidade.
- Retorne APENAS o JSON válido. Não coloque explicações em texto nem markdown fora do JSON.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Gere um tema visual Tailwind completo para o estilo: ${prompt}`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bodyBg: { type: Type.STRING, description: "Classes Tailwind para fundo da página (ex: bg-gradient-to-br from-[#0c0a09] to-[#1c1917])" },
              cardBg: { type: Type.STRING, description: "Classes Tailwind para fundo e bordas do cartão central de conteúdo (ex: bg-stone-900/80 text-stone-100 border border-stone-800)" },
              avatarBg: { type: Type.STRING, description: "Classes Tailwind para fundo e cor de texto do avatar do perfil (ex: bg-stone-800 text-stone-300)" },
              bioColor: { type: Type.STRING, description: "Classes Tailwind para a biografia/subtítulo (ex: text-stone-400)" },
              buttonNormal: { type: Type.STRING, description: "Classes Tailwind completas para botões normais (ex: bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl)" },
              buttonHighlight: { type: Type.STRING, description: "Classes Tailwind completas para botões de destaque (ex: bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl)" },
              buttonPulse: { type: Type.STRING, description: "Classes Tailwind completas para botões com animação pulsar (ex: bg-amber-400 text-stone-950 font-bold rounded-xl animate-pulse)" },
              socialIconColor: { type: Type.STRING, description: "Classes Tailwind para os ícones de redes sociais (ex: text-stone-400 hover:text-amber-500 bg-stone-800 hover:bg-stone-700 rounded-full)" }
            },
            required: ["bodyBg", "cardBg", "avatarBg", "bioColor", "buttonNormal", "buttonHighlight", "buttonPulse", "socialIconColor"]
          }
        }
      });

      if (response && response.text) {
        let cleanText = response.text.trim();
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        }
        themeData = JSON.parse(cleanText);
      }
    } catch (apiError) {
      console.warn("Gemini Theme Generation call failed, using intelligent local generator:", apiError);
    }

    if (!themeData) {
      themeData = generateLocalTheme(prompt);
    }

    // Quick validation of the keys
    const requiredKeys = ['bodyBg', 'cardBg', 'avatarBg', 'bioColor', 'buttonNormal', 'buttonHighlight', 'buttonPulse', 'socialIconColor'];
    for (const key of requiredKeys) {
      if (!themeData[key]) {
        themeData[key] = 'bg-slate-100'; // fallback
      }
    }

    res.json({ success: true, theme: themeData });
  } catch (error) {
    console.error("Critical error in generate-theme route:", error);
    res.status(500).json({ error: `Erro ao gerar tema com IA: ${error.message}` });
  }
});

// GET endpoint to serve a highly polished simulated OAuth 2.0 social login flow for Instagram, TikTok, and YouTube
app.get('/auth/social-login', (req, res) => {
  const platform = (req.query.platform || 'instagram').toLowerCase();
  const email = req.query.email || '';
  const emailPrefix = email ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : 'thiagolino974';
  
  // Custom branding parameters based on selected platform
  let pName = 'Instagram';
  let pColorGrad = 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
  let pUrl = 'https://www.instagram.com/';
  let pIconSvg = `<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`;
  
  if (platform === 'tiktok') {
    pName = 'TikTok';
    pColorGrad = 'linear-gradient(135deg, #000000 0%, #111111 50%, #010101 100%)';
    pUrl = 'https://www.tiktok.com/';
    pIconSvg = `<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.82.95 1.9 1.64 3.09 2.05.01 1.34.01 2.68 0 4.02-1.48-.02-2.93-.45-4.18-1.25-.32-.2-.61-.43-.88-.69-.02 2.76.01 5.51-.01 8.26-.02 1.41-.37 2.83-1.1 4.01-.99 1.63-2.69 2.78-4.58 3.12-1.62.29-3.32.06-4.79-.76-1.74-.95-2.92-2.73-3.13-4.72-.25-2.07.57-4.17 2.14-5.51 1.5-1.29 3.56-1.76 5.43-1.26V12c-1.3-.4-2.73-.1-3.76.77-.96.79-1.39 2.08-1.11 3.28.24 1.13 1.12 2.05 2.22 2.37 1.25.37 2.65-.08 3.39-1.15.35-.5.5-1.1.48-1.72-.01-3.66 0-7.31-.01-10.97.01-1.49.01-2.98.01-4.47-.02-.02-.02-.03-.02-.05z"/></svg>`;
  } else if (platform === 'youtube') {
    pName = 'YouTube';
    pColorGrad = 'linear-gradient(135deg, #FF0000 0%, #D00000 100%)';
    pUrl = 'https://www.youtube.com/';
    pIconSvg = `<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 00-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 002.11 2.107C4.495 20.455 12 20.455 12 20.455s7.505 0 9.388-.511a3.003 3.003 0 002.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
  } else if (platform === 'kwai') {
    pName = 'Kwai';
    pColorGrad = 'linear-gradient(135deg, #FF5000 0%, #FF8500 100%)';
    pUrl = 'https://www.kwai.com/';
    pIconSvg = `<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12zM8 7.5L12 11l4-3.5v7H8v-7z"/></svg>`;
  } else if (platform === 'pinterest') {
    pName = 'Pinterest';
    pColorGrad = 'linear-gradient(135deg, #E60023 0%, #AD001A 100%)';
    pUrl = 'https://www.pinterest.com/';
    pIconSvg = `<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>`;
  } else if (platform === 'whatsapp') {
    pName = 'WhatsApp';
    pColorGrad = 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
    pUrl = 'https://web.whatsapp.com/';
    pIconSvg = `<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>`;
  } else if (platform === 'telegram') {
    pName = 'Telegram';
    pColorGrad = 'linear-gradient(135deg, #229ED9 0%, #0088CC 100%)';
    pUrl = 'https://t.me/';
    pIconSvg = `<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.568 8.162l-2.01 9.475c-.15.675-.552.84-.112.525l-3.072-2.265-1.482 1.428c-.165.165-.303.303-.621.303l.222-3.138 5.715-5.163c.249-.222-.054-.345-.387-.123l-7.062 4.446-3.042-.951c-.66-.207-.672-.66.138-.975l11.88-4.578c.552-.201 1.035.132.84.912z"/></svg>`;
  } else if (platform === 'facebook') {
    pName = 'Facebook';
    pColorGrad = 'linear-gradient(135deg, #1877F2 0%, #0052CC 100%)';
    pUrl = 'https://www.facebook.com/';
    pIconSvg = `<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
  } else if (platform === 'threads') {
    pName = 'Threads';
    pColorGrad = 'linear-gradient(135deg, #111111 0%, #333333 100%)';
    pUrl = 'https://www.threads.net/';
    pIconSvg = `<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.186 24.002c-3.149 0-5.832-.888-7.76-2.569C2.43 19.704 1.5 16.99 1.5 13.518c0-3.805 1.157-6.84 3.346-9.02C7.03 2.318 10.026 1.154 13.738 1.154c3.84 0 6.844 1.22 8.928 3.626 1.83 2.11 2.734 4.887 2.688 8.256-.05 3.687-1.127 6.634-3.203 8.76-1.968 2.014-4.674 3.033-8.043 3.033l-.004-.827c3.125 0 5.617-.938 7.408-2.788 1.878-1.938 2.85-4.639 2.894-8.026.04-3.076-.778-5.582-2.433-7.449-1.836-2.072-4.48-3.122-7.863-3.122-3.328 0-6.012 1.026-7.978 3.05-1.955 2.012-2.986 4.786-2.986 8.246 0 3.16.828 5.602 2.46 7.257 1.623 1.646 3.93 2.482 6.857 2.482h.004v-.002z"/></svg>`;
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Conector Automático - ${pName}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .code-font { font-family: 'Fira Code', monospace; }
      </style>
    </head>
    <body class="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
      <!-- Header do Provedor -->
      <div style="background: ${pColorGrad}" class="py-5 px-6 flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            ${pIconSvg}
          </div>
          <div>
            <h1 class="text-lg font-extrabold tracking-tight text-white">${pName} Conector Inteligente</h1>
            <p class="text-xs text-white/80">Varredura e Integração Direta de Perfil</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-2 bg-white/15 px-2.5 py-1 rounded-full text-[10px] text-white font-bold tracking-wider">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          MODO SEGURO ACTIVO
        </div>
      </div>

      <!-- Barra de Navegação Simulada -->
      <div class="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2 text-xs">
        <div class="flex gap-1.5 mr-2">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
        </div>
        <div class="flex-1 bg-slate-950/80 rounded-lg px-3 py-1 text-slate-400 flex items-center gap-1.5 select-all border border-slate-800/80">
          <span class="text-emerald-500 text-[10px]">🔒</span>
          <span>${pUrl}auth/oauth2/authorize?client_id=vitrine_pro&scope=read_profile</span>
        </div>
      </div>

      <!-- Abas de Conexão -->
      <div class="flex border-b border-slate-800 bg-slate-900/50">
        <button id="tab-auto-btn" onclick="switchTab('auto')" class="flex-1 py-3 text-xs font-bold border-b-2 border-indigo-500 text-white transition-all flex items-center justify-center gap-1.5">
          ⚡ Conectar Automático (Via Browser)
        </button>
        <button id="tab-manual-btn" onclick="switchTab('manual')" class="flex-1 py-3 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1.5">
          📝 Formulário Manual
        </button>
      </div>

      <!-- Conteúdo Principal -->
      <div class="flex-1 p-5 max-w-md mx-auto w-full flex flex-col justify-between">
        <!-- ABA 1: AUTOMÁTICO -->
        <div id="tab-auto-content" class="space-y-4">
          <div class="bg-indigo-950/20 border border-indigo-800/30 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
            <p class="font-semibold text-indigo-400 flex items-center gap-1.5">
              <span>💡</span> Como funciona o Conector Automático?
            </p>
            <p class="leading-relaxed">O app tenta se comunicar de forma segura com as guias abertas e cookies ativos do <b>${pName}</b> no seu navegador. Se você já estiver logado na rede social, a conexão e importação acontecem com 1 clique.</p>
          </div>

          <!-- Console Terminal de Varredura -->
          <div id="terminal-box" class="bg-slate-950 border border-slate-800 rounded-xl p-4 code-font text-[11px] text-slate-400 space-y-1.5 min-h-[140px] shadow-inner relative overflow-hidden hidden">
            <div class="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-slate-600 bg-slate-900/80 px-1.5 py-0.5 rounded">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              LIVE LOGS
            </div>
            <div id="terminal-logs" class="space-y-1">
              <!-- Logs dynamic entry -->
            </div>
          </div>

          <!-- Informações de Segurança -->
          <div id="auto-start-panel" class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center space-y-3">
            <div class="text-3xl">📡</div>
            <div>
              <h3 class="text-xs font-bold text-slate-200">Pronto para Varredura</h3>
              <p class="text-[11px] text-slate-400 mt-1">Nenhum dado de senha será coletado. Apenas perfil público.</p>
            </div>
            
            <button onclick="startAutoScan()" class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5">
              <span>⚡</span> Iniciar Varredura e Conectar Conta
            </button>
          </div>
        </div>

        <!-- ABA 2: MANUAL -->
        <div id="tab-manual-content" class="space-y-4 hidden">
          <!-- Form de Conexão -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nome de Usuário (@)</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">@</span>
                <input id="inp-user" type="text" value="${emailPrefix}" placeholder="username" class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-8 pr-4 text-sm font-medium outline-none text-white transition-colors">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Selecione seu Nicho de Conteúdo</label>
              <select id="sel-niche" class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-3.5 text-sm font-medium outline-none text-white transition-colors cursor-pointer">
                <option value="Achadinhos & Ofertas">🛍️ Achadinhos & Ofertas Gerais</option>
                <option value="Moda & Beleza">💄 Moda, Maquiagem & Beleza</option>
                <option value="Tecnologia & Games">🎮 Tecnologia, Eletrônicos & Games</option>
                <option value="Casa & Cozinha">🍳 Decoração, Casa & Cozinha</option>
                <option value="Finanças & Cursos">📈 Finanças, Mentalidade & Cursos</option>
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sua Biografia Curta (Opcional)</label>
              <input id="inp-bio" type="text" placeholder="Ex: Melhores ofertas todos os dias!" class="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 px-3.5 text-sm font-medium outline-none text-white transition-colors">
            </div>
          </div>

          <button id="btn-auth-manual" onclick="startManualAuth()" class="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-1.5">
            Salvar e Sincronizar Manualmente 📝
          </button>
        </div>

        <!-- Botões de Ação Rodapé -->
        <div class="mt-6 pt-4 border-t border-slate-900 space-y-2">
          <div class="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <span>🛡️</span> Conexão criptografada de ponta-a-ponta por HTTPS
          </div>
          <button onclick="window.close()" class="w-full bg-slate-900 hover:bg-slate-850 active:scale-[0.98] text-slate-400 font-bold py-2.5 px-4 rounded-xl text-xs transition-all border border-slate-800">
            Cancelar e Voltar
          </button>
        </div>
      </div>

      <!-- Overlay de Sucesso -->
      <div id="loader-overlay" class="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex-col items-center justify-center hidden">
        <div class="w-14 h-14 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mb-4 text-emerald-500 text-2xl animate-bounce">
          ✔
        </div>
        <p class="text-sm font-bold text-slate-200">Integração Concluída com Sucesso!</p>
        <p id="loader-status" class="text-xs text-slate-400 mt-1">Retornando para a vitrine...</p>
      </div>

      <script>
        const platform = "${platform}";
        const emailPrefix = "${emailPrefix}";
        
        function switchTab(tab) {
          const autoBtn = document.getElementById('tab-auto-btn');
          const manualBtn = document.getElementById('tab-manual-btn');
          const autoContent = document.getElementById('tab-auto-content');
          const manualContent = document.getElementById('tab-manual-content');
          
          if (tab === 'auto') {
            autoBtn.className = "flex-1 py-3 text-xs font-bold border-b-2 border-indigo-500 text-white transition-all flex items-center justify-center gap-1.5";
            manualBtn.className = "flex-1 py-3 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1.5";
            autoContent.classList.remove('hidden');
            manualContent.classList.add('hidden');
          } else {
            manualBtn.className = "flex-1 py-3 text-xs font-bold border-b-2 border-indigo-500 text-white transition-all flex items-center justify-center gap-1.5";
            autoBtn.className = "flex-1 py-3 text-xs font-bold border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1.5";
            manualContent.classList.remove('hidden');
            autoContent.classList.add('hidden');
          }
        }

        function addLog(text, type = 'info') {
          const terminalLogs = document.getElementById('terminal-logs');
          const color = type === 'success' ? 'text-emerald-400' : type === 'error' ? 'text-rose-400' : 'text-slate-400';
          const prefix = type === 'success' ? '✔' : type === 'error' ? '✖' : '❯';
          
          const logDiv = document.createElement('div');
          logDiv.className = color + " transition-all opacity-0 translate-y-1 duration-200";
          logDiv.innerHTML = \`<span class="text-indigo-500 mr-1.5">\${prefix}</span> \${text}\`;
          
          terminalLogs.appendChild(logDiv);
          setTimeout(() => {
            logDiv.classList.remove('opacity-0', 'translate-y-1');
          }, 10);
        }

        function startAutoScan() {
          const startPanel = document.getElementById('auto-start-panel');
          const termBox = document.getElementById('terminal-box');
          
          startPanel.classList.add('hidden');
          termBox.classList.remove('hidden');
          
          // Simulated deep active scanning logs
          setTimeout(() => {
            addLog('Carregando Ponte Segura de Varredura Web...', 'info');
            setTimeout(() => {
              addLog('Buscando cookies de sessão ativos para ${pUrl}...', 'info');
              setTimeout(() => {
                const detectedUser = emailPrefix || 'thiagolino_affiliates';
                addLog(\`Sessão ativa encontrada! Usuário: <b>@\${detectedUser}</b>\`, 'success');
                
                setTimeout(() => {
                  addLog('Iniciando handshake com a API oficial da rede social...', 'info');
                  setTimeout(() => {
                    addLog('Verificando escopos (read_profile, read_media)...', 'info');
                    
                    setTimeout(() => {
                      addLog('Analisando nicho de atuação do perfil com inteligência artificial...', 'info');
                      const niches = ['Achadinhos & Ofertas', 'Moda & Beleza', 'Tecnologia & Games', 'Casa & Cozinha', 'Finanças & Cursos'];
                      const randomNiche = niches[Math.floor(Math.random() * niches.length)];
                      
                      setTimeout(() => {
                        addLog(\`Nicho detectado: <b>\${randomNiche}</b>\`, 'success');
                        addLog('Extraindo biografia pública...', 'info');
                        const mockBio = \`Achei na Internet! Melhores promoções de \${randomNiche} com segurança ⚡\`;
                        
                        setTimeout(() => {
                          addLog('Token de segurança gerado com sucesso!', 'success');
                          setTimeout(() => {
                            // Finish and post message to opener
                            finishAuth(detectedUser, randomNiche, mockBio);
                          }, 1000);
                        }, 800);
                      }, 1000);
                    }, 800);
                  }, 800);
                }, 900);
              }, 1200);
            }, 800);
          }, 200);
        }

        function startManualAuth() {
          const userVal = document.getElementById('inp-user').value.trim().replace(/^@/, '');
          const nicheVal = document.getElementById('sel-niche').value;
          const bioVal = document.getElementById('inp-bio').value.trim();
          
          if (!userVal) {
            alert('Por favor, insira seu nome de usuário da rede social.');
            return;
          }
          
          finishAuth(userVal, nicheVal, bioVal || ('Achadinhos diários de ' + nicheVal + '! 🔥'));
        }

        function finishAuth(username, niche, bio) {
          const loader = document.getElementById('loader-overlay');
          loader.classList.remove('hidden');
          loader.classList.add('flex');
          
          setTimeout(() => {
            if (window.opener) {
              window.opener.postMessage({
                type: 'SOCIAL_CONNECT_SUCCESS',
                platform: platform,
                username: username,
                bio: bio,
                niche: niche
              }, '*');
              window.close();
            } else {
              alert('Integração concluída! Recarregue a página da sua vitrine e verifique.');
              window.close();
            }
          }, 1200);
        }
      </script>
    </body>
    </html>
  `);
});

// POST endpoint to generate 3 custom AI product recommendations tailored perfectly to the connected social niche
app.post('/api/social/import-posts', async (req, res) => {
  try {
    const { platform, username, niche } = req.body;
    if (!platform || !username || !niche) {
      return res.status(400).json({ error: 'Parâmetros platform, username e niche são obrigatórios.' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `
Você é o Assistente de Inteligência Artificial do Vitrine Afiliados PRO.
Sua tarefa é simular a importação de posts recentes do perfil de rede social (${platform}) do usuário @${username} que tem foco no nicho de público "${niche}".
Com base no nicho do usuário, gere exatamente 3 sugestões de produtos altamente virais e atraentes para ele vender como afiliado na sua vitrine de links.

Os produtos gerados devem ser extremamente adequados e condizentes com o nicho:
- Se "Achadinhos & Ofertas": Sugira produtos inovadores da Shopee ou Amazon (como mini processador portátil recarregável, organizador giratório 360°, garrafa térmica digital led).
- Se "Moda & Beleza": Sugira itens de maquiagem, skincare, pincéis de maquiagem macios de alta precisão, ou acessórios de cabelo de sucesso no Instagram/TikTok.
- Se "Tecnologia & Games": Sugira acessórios eletrônicos, fones de ouvido Bluetooth TWS, carregador por indução ultra rápido ou mouse gamer sem fio.
- Se "Casa & Cozinha": Sugira utensílios de cozinha práticos e modernos, luminária LED inteligente ou mop giratório.
- Se "Finanças & Cursos": Sugira infoprodutos da Hotmart, Eduzz ou Cakto (como e-book de investimentos do zero, curso de renda extra digital).

Para cada um dos 3 produtos, monte o objeto com os seguintes campos obrigatórios:
1. nome: Título do produto com um emoji bonito no início (ex: "🥤 Garrafa Térmica Digital Inteligente")
2. plataforma: Escolha uma das seguintes opções coerentes: "shopee" | "amazon" | "hotmart" | "cakto" | "eduzz" | "mercadolivre" | "outro"
3. tipo: Escolha uma das seguintes opções: "fisico" | "digital" | "curso" | "ebook" | "software"
4. preco: Preço fictício realista em reais (ex: "49,90" - sem prefixo R$)
5. precoAntes: Preço riscado realista maior (ex: "99,90" - sem prefixo R$)
6. desconto: Porcentagem de desconto (ex: "50" - apenas o número)
7. emoji: Emoji representativo único (ex: "🥤")
8. descricao: Uma legenda curta atraente estilo rede social (ex: "O achadinho mais viral do feed com 50% de desconto e frete grátis!")
9. url: Link realista de afiliado (ex: "https://shopee.com.br/product-viral-link?aff_id=vitrine_" + username)

Retorne SEMPRE um array JSON puro válido, sem marcação de código Markdown (não adicione \`\`\`json ou \`\`\`), sem explicações textuais, contendo exatamente esta estrutura:
[
  {
    "nome": "nome do produto",
    "plataforma": "plataforma",
    "tipo": "tipo",
    "preco": "preco",
    "precoAntes": "precoAntes",
    "desconto": "desconto",
    "emoji": "emoji",
    "descricao": "descricao",
    "url": "url"
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Gere 3 produtos afiliados virais do nicho ${niche} para o perfil de ${platform} do usuário @${username}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nome: { type: Type.STRING },
              plataforma: { type: Type.STRING },
              tipo: { type: Type.STRING },
              preco: { type: Type.STRING },
              precoAntes: { type: Type.STRING },
              desconto: { type: Type.STRING },
              emoji: { type: Type.STRING },
              descricao: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["nome", "plataforma", "tipo", "preco", "precoAntes", "desconto", "emoji", "descricao", "url"]
          }
        }
      }
    });

    let products = [];
    try {
      let cleanText = response.text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      }
      products = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse social import products JSON:", parseError);
      return res.status(500).json({ error: 'Erro ao processar a estrutura de produtos com IA.' });
    }

    res.json({ success: true, products: products });
  } catch (error) {
    console.error("Social Import Error:", error);
    res.status(500).json({ error: `Erro na simulação de importação da conta de rede social: ${error.message}` });
  }
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Send index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

