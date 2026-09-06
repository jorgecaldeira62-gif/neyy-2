// ============================================================
// VOXIS — brain.js
// Cérebro: Silogismo + Aprendizado + Doce Elogio + Dinâmica
// ============================================================

const Brain = {

  // Base de conhecimento acumulada
  knowledge: {
    facts: [],   // Fatos aprendidos
    patterns: {},   // Padrões de escrita do usuário
    topics: {},   // Tópicos frequentes
    mood: 'neutro'
  },

  // Regras de Silogismo
  syllogismRules: [
    {
      if: (text) => text.includes('sempre') || text.includes('todo'),
      then: (text) => Brain.applySyllogism(text, 'universal')
    },
    {
      if: (text) => text.includes('nunca') || text.includes('nenhum'),
      then: (text) => Brain.applySyllogism(text, 'negativo')
    },
    {
      if: (text) => text.includes('às vezes') || text.includes('talvez'),
      then: (text) => Brain.applySyllogism(text, 'particular')
    }
  ],

  // Padrões de resposta natural
  responsePatterns: {
    greeting: [
      'Olá! Que bom te ouvir.',
      'Oi! Estou aqui.',
      'Olá! Como posso te ajudar hoje?'
    ],
    agreement: [
      'Faz sentido o que você disse.',
      'Entendo sua perspectiva.',
      'Concordo com esse ponto de vista.'
    ],
    doubt: [
      'Hmm, isso me faz pensar... há uma contradição interessante aí.',
      'Curioso — isso vai contra o que aprendi antes. Pode me explicar melhor?',
      'Interessante. Tenho uma dúvida sobre isso...'
    ],
    praise: [
      'Que ideia incrível!',
      'Você tem uma forma muito clara de pensar.',
      'Gostei muito dessa perspectiva.'
    ],
    continuity: [
      'Quer continuar explorando esse assunto?',
      'Tem mais alguma coisa que queira compartilhar?'
    ]
  },

  // ===== INICIALIZAÇÃO =====
  init() {
    const saved = localStorage.getItem('voxis_knowledge');
    if (saved) {
      try {
        this.knowledge = JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao carregar conhecimento:', e);
      }
    }
    console.log('🧠 Brain iniciado. Fatos conhecidos:', this.knowledge.facts.length);
  },

  // ===== PROCESSAR INPUT =====
  process(text) {
    const lower = text.toLowerCase().trim();

    // Aprende com o input
    this.learn(text);

    // 1. Verifica saudações
    if (this.isGreeting(lower)) {
      return this.respond('greeting') + ' ' + this.getContextualOpener();
    }

    // 2. Verifica contradições (Doce Elogio + Dúvida)
    const contradiction = this.checkContradiction(text);
    if (contradiction) {
      return this.respond('doubt') + ' ' + contradiction;
    }

    // 3. Aplica silogismo se aplicável
    const syllogism = this.trySyllogism(lower);
    if (syllogism) {
      return syllogism;
    }

    // 4. Verifica se é pergunta
    if (lower.includes('?') || lower.startsWith('o que') || lower.startsWith('como') || lower.startsWith('por que')) {
      return this.answerQuestion(text);
    }

    // 5. Resposta contextual com aprendizado
    return this.contextualResponse(text);
  },

  // ===== APRENDER =====
  learn(text) {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    // Aprende palavras novas
    words.forEach(word => {
      if (!this.knowledge.patterns[word]) {
        this.knowledge.patterns[word] = 0;
      }
      this.knowledge.patterns[word]++;
    });

    // Extrai fatos (frases declarativas)
    if (!text.includes('?') && text.length > 20) {
      if (this.knowledge.facts.length < 200) {
        this.knowledge.facts.push({
          text: text,
          time: new Date().toISOString(),
          weight: 1
        });
      }
    }

    // Identifica tópicos frequentes
    const topics = ['trabalho', 'família', 'saúde', 'estudo', 'projeto', 'ideia', 'problema', 'sonho'];
    topics.forEach(topic => {
      if (text.toLowerCase().includes(topic)) {
        this.knowledge.topics[topic] = (this.knowledge.topics[topic] || 0) + 1;
      }
    });

    // Salva
    this.save();
  },

  // ===== VERIFICAR CONTRADIÇÃO =====
  checkContradiction(text) {
    const lower = text.toLowerCase();
    for (const fact of this.knowledge.facts.slice(-20)) {
      const factLower = fact.text.toLowerCase();
      // Detecta negação de algo já dito
      if (
        (lower.includes('não') && factLower.includes(lower.replace('não ', '').substring(0, 20))) ||
        (lower.includes('nunca') && factLower.includes('sempre')) ||
        (lower.includes('sempre') && factLower.includes('nunca'))
      ) {
        return `Antes você mencionou: "${fact.text.substring(0, 60)}..." — isso parece diferente do que você disse agora.`;
      }
    }
    return null;
  },

  // ===== SILOGISMO =====
  trySyllogism(text) {
    for (const rule of this.syllogismRules) {
      if (rule.if(text)) {
        return rule.then(text);
      }
    }
    return null;
  },

  applySyllogism(text, type) {
    const templates = {
      universal: `Entendo — você está estabelecendo uma regra geral. Se isso é sempre verdade, então podemos concluir que casos específicos também seguem essa lógica. ${this.respond('agreement')}`,
      negativo: `Interessante ponto. Se isso nunca acontece, então o oposto deve ser considerado. Isso me leva a pensar nas exceções... ${this.respond('doubt')}`,
      particular: `Você levanta uma possibilidade. Quando algo "às vezes" acontece, vale explorar em quais condições isso ocorre. ${this.respond('agreement')}`
    };
    return templates[type] || this.contextualResponse(text);
  },

  // ===== RESPONDER PERGUNTA =====
  answerQuestion(text) {
    const lower = text.toLowerCase();

    // Busca na base de conhecimento
    const relevant = this.knowledge.facts.filter(f =>
      f.text.toLowerCase().split(' ').some(w => lower.includes(w) && w.length > 4)
    );

    if (relevant.length > 0) {
      const fact = relevant[relevant.length - 1];
      return `Com base no que conversamos, lembro que você mencionou: "${fact.text.substring(0, 80)}". Isso pode ser relevante para sua pergunta. O que você acha?`;
    }

    // Resposta criativa baseada em tópico frequente
    const topTopic = this.getTopTopic();
    if (topTopic && lower.includes(topTopic)) {
      return `Você costuma falar bastante sobre ${topTopic}. Posso perceber que é algo importante para você. Me conta mais sobre essa questão específica?`;
    }

    return `Essa é uma pergunta interessante. Ainda estou aprendendo sobre isso com você. Me conta mais — assim consigo te ajudar melhor.`;
  },

  // ===== RESPOSTA CONTEXTUAL =====
  contextualResponse(text) {
    const topTopic = this.getTopTopic();
    const hasPraise = Math.random() < 0.25; // 25% de chance de elogio

    let response = '';

    // Doce elogio ocasional (natural, não forçado)
    if (hasPraise) {
      response += this.respond('praise') + ' ';
    }

    // Resposta baseada no tópico mais frequente
    if (topTopic) {
      response += `Percebo que ${topTopic} é algo que aparece bastante nas nossas conversas. `;
    }

    // Adiciona reflexão
    response += this.generateReflection(text);

    return response;
  },

  // ===== GERAR REFLEXÃO =====
  generateReflection(text) {
    const reflections = [
      `O que você acabou de compartilhar me parece importante. Como isso te afeta no dia a dia?`,
      `Entendo. Isso faz parte de algo maior que você está construindo?`,
      `Interessante perspectiva. Você chegou a essa conclusão como?`,
      `Isso que você disse guarda uma lógica interessante. Quer explorar mais?`,
      `Faz sentido. E como você se sente em relação a isso?`
    ];
    return reflections[Math.floor(Math.random() * reflections.length)];
  },

  // ===== HELPERS =====
  isGreeting(text) {
    const greetings = ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'e aí'];
    return greetings.some(g => text.startsWith(g));
  },

  respond(type) {
    const arr = this.responsePatterns[type];
    return arr[Math.floor(Math.random() * arr.length)];
  },

  getContextualOpener() {
    const topTopic = this.getTopTopic();
    if (topTopic) return `Quer continuar de onde paramos sobre ${topTopic}?`;
    return 'O que você tem em mente?';
  },

  getTopTopic() {
    const topics = this.knowledge.topics;
    if (Object.keys(topics).length === 0) return null;
    return Object.entries(topics).sort((a, b) => b[1] - a[1])[0][0];
  },

  save() {
    try {
      localStorage.setItem('voxis_knowledge', JSON.stringify(this.knowledge));
    } catch (e) { }
  }
};
