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

// Serve static files from the root directory
app.use(express.static(__dirname));

// Send index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

