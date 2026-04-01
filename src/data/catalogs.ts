import type {
  Area,
  ConsultantAgendaItem,
  ConsultantLead,
  ExploreItem,
  FormData,
  NumberItem,
  SignalItem,
  Specialist,
} from "../types/domain";

/** Instância operacional padrão (deve bater com `partner_profiles.instance_slug` no Supabase). */
const defaultPartnerInstanceSlug = "resolva-seu-negocio";

export const specialists: Record<Area, Specialist> = {
  vendas: {
    id: "consultor_vendas_1",
    name: "Marcos Tavares",
    title: "Especialista em Operação Comercial",
    focus: "Estrutura times comerciais para previsibilidade de receita.",
    description:
      "Organiza funil, metas e processo para empresas que vendem no improviso e dependem demais do fundador.",
    bullets: [
      "Implementação de funil e playbook",
      "Ritmo de gestão comercial semanal",
      "Treinamento de prospecção e follow-up",
    ],
    whatsapp: "https://wa.me/5585000000101",
    partnerInstanceSlug: defaultPartnerInstanceSlug,
  },
  marketing: {
    id: "consultor_marketing_1",
    name: "Camila Ferraz",
    title: "Estrategista de Marketing e Growth",
    focus: "Transforma marketing disperso em aquisição consistente.",
    description:
      "Ajuda negócios a definir promessa, canais prioritários e rotina de geração de demanda com mensuração.",
    bullets: [
      "Posicionamento e oferta principal",
      "Plano de conteúdo e campanhas",
      "Leitura de CAC, CPL e conversão",
    ],
    whatsapp: "https://wa.me/5585000000102",
    partnerInstanceSlug: defaultPartnerInstanceSlug,
  },
  gestao: {
    id: "consultor_gestao_1",
    name: "Renata Mota",
    title: "Consultora em Gestão Empresarial",
    focus: "Cria clareza operacional e prioridade para escalar sem caos.",
    description:
      "Estrutura rituais, indicadores e responsabilidades para empresas com operação desorganizada e baixa execução.",
    bullets: [
      "Rituais de gestão e acompanhamento",
      "Indicadores de operação e dono por área",
      "Plano de ação para gargalos recorrentes",
    ],
    whatsapp: "https://wa.me/5585000000103",
    partnerInstanceSlug: defaultPartnerInstanceSlug,
  },
  financeiro: {
    id: "consultor_financeiro_1",
    name: "Eduardo Nery",
    title: "Especialista em Finanças para PMEs",
    focus: "Dá visibilidade de caixa e margem para decisões seguras.",
    description:
      "Resolve empresas sem previsão de caixa, precificação confusa e baixa disciplina financeira.",
    bullets: [
      "Controle de caixa e projeção",
      "Análise de margem e precificação",
      "Rotina financeira com indicadores-chave",
    ],
    whatsapp: "https://wa.me/5585000000104",
    partnerInstanceSlug: defaultPartnerInstanceSlug,
  },
  outros: {
    id: "time_diagnostico_rsn",
    name: "Time de Diagnóstico RSN",
    title: "Especialistas em Triagem e Direcionamento",
    focus: "Ajuda a traduzir problemas difusos em uma frente de ação clara.",
    description:
      "Ideal para empresas que sentem o problema, mas ainda não conseguem nomear exatamente em qual frente ele está.",
    bullets: [
      "Leitura inicial do gargalo principal",
      "Direcionamento para especialista mais aderente",
      "Priorização do primeiro passo de execução",
    ],
    whatsapp: "https://wa.me/5585000000105",
    partnerInstanceSlug: defaultPartnerInstanceSlug,
  },
};

export const initialData: FormData = {
  challenge: "",
  revenueProfile: "",
  businessMoment: "",
  decisionMaking: "",
  currentBottleneck: "",
  solutionExperience: "",
  primaryGoal: "",
  name: "",
  email: "",
  phone: "",
  role: "",
  mainPain: "",
};

export const quickChallenges = [
  "Vender mais",
  "Atrair clientes melhores",
  "Colocar a gestão em ordem",
  "Parar de apagar incêndio",
  "Ganhar previsibilidade financeira",
];

export const ecosystemLogos = [
  "Vendas",
  "Marketing",
  "Gestão",
  "Finanças",
  "Operações",
  "Pessoas",
  "Comercial",
  "Crescimento",
];

export const numbers: NumberItem[] = [
  {
    value: 300,
    prefix: "+",
    label: "diagnósticos iniciados",
  },
  {
    value: 80,
    prefix: "+",
    label: "parceiros validados",
  },
  {
    value: 200,
    prefix: "+",
    label: "soluções entre sistemas e parceiros",
  },
  {
    value: 1,
    label: "direção clara para agir",
  },
];

export const diagnosisSignals: SignalItem[] = [
  {
    title: "Baixa conversão comercial",
    description: "Demanda existe, mas falta processo para virar receita.",
    icon: "V",
    accent: "#ff7a1a",
    time: "agora",
  },
  {
    title: "Marketing sem previsibilidade",
    description: "Canal ativo, mas pouca clareza sobre o que traz demanda.",
    icon: "M",
    accent: "#ff9856",
    time: "2 min",
  },
  {
    title: "Operação apagando incêndio",
    description: "Time cheio e mesmo assim sem ritmo claro de execução.",
    icon: "O",
    accent: "#ffb273",
    time: "4 min",
  },
  {
    title: "Caixa sem visibilidade",
    description: "Faturamento entra, mas margem e caixa seguem no escuro.",
    icon: "F",
    accent: "#ff8a34",
    time: "6 min",
  },
];

export const successSignals: SignalItem[] = [
  {
    title: "Agora eu sei onde atacar primeiro",
    description: "Saímos da sensação de caos e passamos a ter uma prioridade clara de execução.",
    icon: "✓",
    accent: "#ffb273",
    time: "depois",
  },
  {
    title: "Saímos do improviso comercial",
    description: "As oportunidades começaram a seguir processo, rotina e previsibilidade de verdade.",
    icon: "✓",
    accent: "#ff9856",
    time: "depois",
  },
  {
    title: "Hoje temos clareza de caixa",
    description: "Faturamento, margem e decisão financeira deixaram de andar no escuro.",
    icon: "✓",
    accent: "#ff8a34",
    time: "depois",
  },
  {
    title: "A operação finalmente ganhou cadência",
    description: "O time passou a trabalhar com mais ritmo, dono definido e menos retrabalho.",
    icon: "✓",
    accent: "#ff7a1a",
    time: "depois",
  },
];

export const featuredPartners = [
  {
    name: "Marcos Tavares",
    category: "Vendas e processo comercial",
    benefit: "Estrutura previsibilidade comercial.",
  },
  {
    name: "Camila Ferraz",
    category: "Marketing e growth",
    benefit: "Organiza oferta, canais e demanda.",
  },
  {
    name: "Renata Mota",
    category: "Gestão e operação",
    benefit: "Traz ordem para a operação.",
  },
  {
    name: "Eduardo Nery",
    category: "Finanças empresariais",
    benefit: "Dá clareza sobre caixa e margem.",
  },
];

export const categories = [
  {
    title: "Gestão e Estratégia",
    exploreCategory: "Gestao & Estrategia",
    description: "Para negócios sem prioridade, dono sobrecarregado e pouca clareza.",
    accent: false,
    signal: "Rituais, indicadores e execução",
  },
  {
    title: "Marketing e Growth",
    exploreCategory: "Marketing & Growth",
    description: "Para empresas que precisam gerar demanda com mais critério.",
    accent: false,
    signal: "Oferta, canal e demanda",
  },
  {
    title: "Vendas",
    exploreCategory: "Vendas",
    description: "Para operações que precisam vender melhor, com processo e ritmo.",
    accent: false,
    signal: "Pipeline, rotina e conversão",
  },
  {
    title: "Finanças",
    exploreCategory: "Financas",
    description: "Para decidir com base em caixa, margem e previsibilidade.",
    accent: false,
    signal: "Caixa, margem e previsão",
  },
  {
    title: "Operações",
    exploreCategory: "Operacoes",
    description: "Para quem vive apagando incêndio e quer crescer com ordem.",
    accent: false,
    signal: "Processo, dono e cadência",
  },
  {
    title: "Pessoas e Cultura",
    exploreCategory: "Pessoas & Cultura",
    description: "Para alinhar time, responsabilidade e performance.",
    accent: true,
    signal: "Papéis, liderança e cultura",
  },
];

export const howItWorks = [
  {
    title: "Descreva sua dor",
    description: "Conte o que mais trava seu negócio hoje.",
  },
  {
    title: "Responda ao diagnóstico",
    description: "Refinamos contexto, momento e prioridade.",
  },
  {
    title: "Receba a melhor direção",
    description: "Você recebe a solução mais aderente.",
  },
];

export const exploreCategories = [
  "Todos",
  "Vendas",
  "Marketing & Growth",
  "Gestao & Estrategia",
  "Financas",
  "Operacoes",
  "Pessoas & Cultura",
  "Tecnologia",
];

export const exploreItems: ExploreItem[] = [
  {
    id: "exp-1",
    name: "Marcos Tavares",
    kind: "Consultor",
    category: "Vendas",
    focus: "Processo comercial e previsibilidade",
    audience: "Empresas B2B e serviços consultivos",
    description:
      "Estrutura rotina comercial, playbook e gestão de pipeline para times que vendem no improviso.",
    badge: "Mais procurado",
  },
  {
    id: "exp-2",
    name: "Camila Ferraz",
    kind: "Consultor",
    category: "Marketing & Growth",
    focus: "Posicionamento, demanda e canais",
    audience: "Negócios que precisam gerar demanda melhor",
    description:
      "Organiza oferta, narrativa, canais e plano de aquisição para empresas com marketing disperso.",
    badge: "Growth",
  },
  {
    id: "exp-3",
    name: "Renata Mota",
    kind: "Consultor",
    category: "Gestao & Estrategia",
    focus: "Operação, rituais e execução",
    audience: "Empresas em fase de organização interna",
    description:
      "Ajuda a reduzir caos operacional e dependência do dono com rotinas, indicadores e accountability.",
  },
  {
    id: "exp-4",
    name: "Eduardo Nery",
    kind: "Consultor",
    category: "Financas",
    focus: "Caixa, margem e previsibilidade",
    audience: "PMEs com dificuldade de leitura financeira",
    description:
      "Implanta clareza financeira para empresas que crescem sem saber o que realmente sobra.",
  },
  {
    id: "exp-5",
    name: "Orbit CRM",
    kind: "SaaS",
    category: "Vendas",
    focus: "CRM e acompanhamento comercial",
    audience: "Times comerciais pequenos e médios",
    description:
      "Centraliza oportunidades, tarefas e previsões para dar ritmo e visibilidade ao time de vendas.",
    badge: "SaaS",
  },
  {
    id: "exp-6",
    name: "Pulse Growth",
    kind: "SaaS",
    category: "Marketing & Growth",
    focus: "Campanhas, leads e atribuição",
    audience: "Empresas que precisam organizar marketing",
    description:
      "Ajuda a consolidar campanhas, canal e conversão em um painel simples para decisão.",
  },
  {
    id: "exp-7",
    name: "Base Operacional",
    kind: "Parceiro",
    category: "Operacoes",
    focus: "Mapeamento de processos e indicadores",
    audience: "Empresas com operação desorganizada",
    description:
      "Consultoria para padronizar processos, definir donos e criar rotina de acompanhamento.",
    badge: "Parceiro",
  },
  {
    id: "exp-8",
    name: "PeopleCore",
    kind: "Parceiro",
    category: "Pessoas & Cultura",
    focus: "Estrutura de time e cultura de performance",
    audience: "Empresas em crescimento e lideranças médias",
    description:
      "Cria base de cargos, alinhamento de papéis e desenvolvimento de liderança para reduzir ruído interno.",
  },
  {
    id: "exp-9",
    name: "Stack Finance",
    kind: "SaaS",
    category: "Financas",
    focus: "Fluxo de caixa e dashboards",
    audience: "PMEs que precisam decidir melhor",
    description:
      "Ferramenta de previsão financeira para acompanhar caixa, despesas e margem em tempo real.",
  },
  {
    id: "exp-10",
    name: "Node TI Advisory",
    kind: "Parceiro",
    category: "Tecnologia",
    focus: "Estrutura tech e automação",
    audience: "Empresas com gargalos de processo e sistema",
    description:
      "Diagnostica gargalos de tecnologia e desenha automações simples para ganhar eficiência.",
  },
];

export const consultantLeads: ConsultantLead[] = [
  {
    id: "lead-001",
    company: "Clínica Horizonte",
    contact: "Fernanda Melo",
    email: "fernanda@clinicahorizonte.com",
    phone: "(85) 99999-1001",
    role: "Diretora de operações",
    status: "Novo",
    challenge: "Quero vender melhor sem depender só de indicação.",
    diagnosis: "Falta de previsibilidade comercial",
    diagnosisSummary: "Operação comercial sem rotina de acompanhamento e pouca clareza de funil.",
    objective: "Aumentar faturamento com mais previsibilidade",
    urgency: "Alta",
    recommendedCategory: "Vendas",
    recommendedSpecialist: "Marcos Tavares",
    updatedAt: "Hoje, 09:12",
  },
  {
    id: "lead-002",
    company: "Ativa Engenharia",
    contact: "Rafael Lima",
    email: "rafael@ativaengenharia.com",
    phone: "(85) 99999-1002",
    role: "Sócio",
    status: "Em contato",
    challenge: "A empresa cresce, mas a operação está virando gargalo.",
    diagnosis: "Gargalos operacionais travando a escala",
    diagnosisSummary: "Há crescimento, mas sem dono claro por frente e com retrabalho frequente.",
    objective: "Escalar o negócio de forma estruturada e sustentável",
    urgency: "Média",
    recommendedCategory: "Gestao & Estrategia",
    recommendedSpecialist: "Renata Mota",
    updatedAt: "Hoje, 10:41",
  },
  {
    id: "lead-003",
    company: "Verde Varejo",
    contact: "Patrícia Gomes",
    email: "patricia@verdevarejo.com",
    phone: "(85) 99999-1003",
    role: "CEO",
    status: "Qualificado",
    challenge: "Preciso organizar caixa e operação para crescer com segurança.",
    diagnosis: "Falta de clareza financeira para crescer com segurança",
    diagnosisSummary: "Decisão financeira ainda acontece com baixa previsibilidade de caixa e margem.",
    objective: "Estruturar melhor processos e ter mais controle da operação",
    urgency: "Alta",
    recommendedCategory: "Financas",
    recommendedSpecialist: "Eduardo Nery",
    updatedAt: "Ontem, 17:28",
  },
  {
    id: "lead-004",
    company: "Conecta Hub",
    contact: "Diego Rocha",
    email: "diego@conectahub.com",
    phone: "(85) 99999-1004",
    role: "Head Comercial",
    status: "Reunião marcada",
    challenge: "Estamos atraindo leads, mas sem previsibilidade de aquisição.",
    diagnosis: "Aquisição sem previsibilidade",
    diagnosisSummary: "Marketing e comercial não estão operando com leitura clara de conversão por canal.",
    objective: "Corrigir gargalos que estão travando o crescimento",
    urgency: "Média",
    recommendedCategory: "Marketing & Growth",
    recommendedSpecialist: "Camila Ferraz",
    updatedAt: "Ontem, 15:03",
  },
];

export const consultantAgenda: ConsultantAgendaItem[] = [
  {
    id: "meeting-1",
    title: "Diagnóstico comercial",
    company: "Conecta Hub",
    startsAt: "Hoje · 16:00",
    owner: "SDR Mariana",
    status: "Confirmada",
  },
  {
    id: "meeting-2",
    title: "Triagem financeira",
    company: "Verde Varejo",
    startsAt: "Amanhã · 09:30",
    owner: "Eduardo Nery",
    status: "Pendente",
  },
  {
    id: "meeting-3",
    title: "Call de qualificação",
    company: "Ativa Engenharia",
    startsAt: "Amanhã · 14:00",
    owner: "SDR Mariana",
    status: "Confirmada",
  },
];
