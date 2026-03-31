import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  businessMomentOptions,
  currentBottleneckOptions,
  decisionMakingOptions,
  primaryGoalOptions,
  revenueProfileOptions,
  solutionExperienceOptions,
} from "./data/quizOptions";
import type {
  Area,
  BusinessMoment,
  ConsultantAgendaItem,
  ConsultantLead,
  ConsultantSection,
  ContactTarget,
  CurrentBottleneck,
  DecisionMaking,
  ExploreItem,
  FormData,
  NumberItem,
  PrimaryGoal,
  RevenueProfile,
  Screen,
  SignalItem,
  SolutionExperience,
  Specialist,
} from "./types/domain";

const specialists: Record<Area, Specialist> = {
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
  },
};

const initialData: FormData = {
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

const quickChallenges = [
  "Vender mais",
  "Atrair clientes melhores",
  "Colocar a gestão em ordem",
  "Parar de apagar incêndio",
  "Ganhar previsibilidade financeira",
];

const ecosystemLogos = ["Vendas", "Marketing", "Gestão", "Finanças", "Operações", "Pessoas", "Comercial", "Crescimento"];

const numbers: NumberItem[] = [
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

const diagnosisSignals: SignalItem[] = [
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

const successSignals: SignalItem[] = [
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

function findOptionLabel<T extends string>(options: Array<{ value: T; label: string }>, value: T | "") {
  return options.find((option) => option.value === value)?.label ?? "";
}

function AnimatedSignalList({ items }: { items: SignalItem[] }) {
  const loopItems = [...items, ...items];
  const tone = items === successSignals ? "success" : "problem";

  return (
    <div className={`animated-signal-shell ${tone}`}>
      <div className="animated-signal-track">
        {loopItems.map((item, index) => (
          <article className="signal-card" key={`${item.title}-${index}`}>
            <div className="signal-icon" style={{ backgroundColor: item.accent }}>
              <span>{item.icon}</span>
            </div>
            <div className="signal-copy">
              <div className="signal-heading">
                <h3>{item.title}</h3>
                <span>{item.time}</span>
              </div>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="signal-fade signal-fade-top" />
      <div className="signal-fade signal-fade-bottom" />
    </div>
  );
}

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = elementRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) {
      return;
    }

    let frame = 0;
    let startTime = 0;
    const duration = 1400;

    const tick = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [hasStarted, value]);

  return (
    <span className="animated-number" ref={elementRef}>
      {prefix}
      {display.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

function formatCategoryLabel(label: string) {
  const categoryMap: Record<string, string> = {
    "Gestao & Estrategia": "Gestão & Estratégia",
    Financas: "Finanças",
    Operacoes: "Operações",
    Tecnologia: "Tecnologia",
    Vendas: "Vendas",
    "Marketing & Growth": "Marketing & Growth",
    "Pessoas & Cultura": "Pessoas & Cultura",
    Todos: "Todos",
  };

  return categoryMap[label] ?? label;
}

function toStatusClassName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

const featuredPartners = [
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

const categories = [
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

const howItWorks = [
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

const exploreCategories = [
  "Todos",
  "Vendas",
  "Marketing & Growth",
  "Gestao & Estrategia",
  "Financas",
  "Operacoes",
  "Pessoas & Cultura",
  "Tecnologia",
];

const exploreItems: ExploreItem[] = [
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

const consultantLeads: ConsultantLead[] = [
  {
    id: "lead-001",
    company: "Clínica Horizonte",
    contact: "Fernanda Melo",
    role: "Diretora de operações",
    status: "Novo",
    diagnosis: "Falta de previsibilidade comercial",
    objective: "Aumentar faturamento com mais previsibilidade",
    urgency: "Alta",
    updatedAt: "Hoje, 09:12",
  },
  {
    id: "lead-002",
    company: "Ativa Engenharia",
    contact: "Rafael Lima",
    role: "Sócio",
    status: "Em contato",
    diagnosis: "Gargalos operacionais travando a escala",
    objective: "Escalar o negócio de forma estruturada e sustentável",
    urgency: "Média",
    updatedAt: "Hoje, 10:41",
  },
  {
    id: "lead-003",
    company: "Verde Varejo",
    contact: "Patrícia Gomes",
    role: "CEO",
    status: "Qualificado",
    diagnosis: "Falta de clareza financeira para crescer com segurança",
    objective: "Estruturar melhor processos e ter mais controle da operação",
    urgency: "Alta",
    updatedAt: "Ontem, 17:28",
  },
  {
    id: "lead-004",
    company: "Conecta Hub",
    contact: "Diego Rocha",
    role: "Head Comercial",
    status: "Reunião marcada",
    diagnosis: "Aquisição sem previsibilidade",
    objective: "Corrigir gargalos que estão travando o crescimento",
    urgency: "Média",
    updatedAt: "Ontem, 15:03",
  },
];

const consultantAgenda: ConsultantAgendaItem[] = [
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

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [screen, setScreen] = useState<Screen>("landing");
  const [formData, setFormData] = useState<FormData>(initialData);
  const [activeExploreCategory, setActiveExploreCategory] = useState("Todos");
  const [exploreQuery, setExploreQuery] = useState("");
  const [isPersonalizedExplore, setIsPersonalizedExplore] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactTarget, setContactTarget] = useState<ContactTarget | null>(null);
  const [hasUnlockedWhatsapp, setHasUnlockedWhatsapp] = useState(false);
  const [consultantSection, setConsultantSection] = useState<ConsultantSection>("dashboard");
  const [consultantAuthenticated, setConsultantAuthenticated] = useState(false);
  const [consultantForm, setConsultantForm] = useState({
    email: "",
    password: "",
    instance: "",
  });

  const normalizedChallenge = formData.challenge.toLowerCase();

  const inferredArea = useMemo<Area>(() => {
    if (
      normalizedChallenge.includes("caixa") ||
      normalizedChallenge.includes("finance") ||
      normalizedChallenge.includes("margem") ||
      normalizedChallenge.includes("precifica")
    ) {
      return "financeiro";
    }

    if (
      normalizedChallenge.includes("marketing") ||
      normalizedChallenge.includes("lead") ||
      normalizedChallenge.includes("demanda") ||
      normalizedChallenge.includes("tráfego") ||
      normalizedChallenge.includes("trafego") ||
      normalizedChallenge.includes("posicionamento")
    ) {
      return "marketing";
    }

    if (
      normalizedChallenge.includes("venda") ||
      normalizedChallenge.includes("comercial") ||
      normalizedChallenge.includes("cliente") ||
      normalizedChallenge.includes("pipeline") ||
      formData.primaryGoal === "aumentar_previsibilidade"
    ) {
      return "vendas";
    }

    if (
      formData.primaryGoal === "sair_caos" ||
      formData.primaryGoal === "controle_operacao" ||
      formData.primaryGoal === "escalar_sustentavel" ||
      formData.currentBottleneck === "varios_sem_ordem" ||
      formData.currentBottleneck === "falhas_sem_identificar"
    ) {
      return "gestao";
    }

    if (
      formData.primaryGoal === "otimizar_existente" &&
      (formData.revenueProfile === "300k_1m" || formData.revenueProfile === "acima_1m")
    ) {
      return "gestao";
    }

    return "outros";
  }, [formData.currentBottleneck, formData.primaryGoal, formData.revenueProfile, normalizedChallenge]);

  const specialist = specialists[inferredArea];

  const diagnosis = useMemo(() => {
    if (
      formData.currentBottleneck === "varios_sem_ordem" ||
      formData.currentBottleneck === "falhas_sem_identificar"
    ) {
      return {
        title: "Falta de clareza sobre prioridade de crescimento",
        summary:
          "Seu negócio já sente o peso de vários gargalos ao mesmo tempo, mas ainda sem uma leitura clara do que precisa ser atacado primeiro.",
      };
    }

    if (
      inferredArea === "vendas" &&
      (formData.primaryGoal === "aumentar_previsibilidade" ||
        formData.currentBottleneck === "problema_sem_solucao" ||
        formData.currentBottleneck === "solucoes_sem_resultado")
    ) {
      return {
        title: "Falta de previsibilidade comercial",
        summary:
          "Hoje a empresa até gera movimento comercial, mas ainda sem processo consistente o suficiente para transformar esforço em receita previsível.",
      };
    }

    if (
      inferredArea === "marketing" &&
      (formData.currentBottleneck === "problema_sem_solucao" ||
        formData.solutionExperience === "sem_consistencia" ||
        formData.solutionExperience === "sem_criterio")
    ) {
      return {
        title: "Aquisição sem previsibilidade",
        summary:
          "Existe tentativa de gerar demanda, mas ainda sem uma estrutura clara para saber o que realmente traz clientes e o que só consome energia.",
      };
    }

    if (
      inferredArea === "financeiro" ||
      (formData.primaryGoal === "controle_operacao" &&
        (normalizedChallenge.includes("caixa") || normalizedChallenge.includes("margem")))
    ) {
      return {
        title: "Falta de clareza financeira para crescer com segurança",
        summary:
          "A operação pode até estar rodando, mas decisões importantes ainda acontecem sem visibilidade suficiente de caixa, margem e impacto real no negócio.",
      };
    }

    if (
      formData.businessMoment === "crescendo_sem_prioridade" ||
      formData.businessMoment === "escalando_com_seguranca" ||
      formData.primaryGoal === "escalar_sustentavel" ||
      formData.primaryGoal === "otimizar_existente"
    ) {
      return {
        title: "Gargalos operacionais travando a escala",
        summary:
          "Sua empresa já passou da fase inicial, mas o crescimento está esbarrando em execução, priorização e estrutura para sustentar a próxima etapa.",
      };
    }

    if (
      formData.decisionMaking === "urgencia" ||
      formData.decisionMaking === "tentativa_erro" ||
      formData.solutionExperience === "interno"
    ) {
      return {
        title: "Negócio sem direção operacional clara",
        summary:
          "As decisões ainda acontecem muito no impulso ou na tentativa e erro, o que dilui energia e atrasa a construção de um caminho mais consistente.",
      };
    }

    return {
      title: "Hora de alinhar estratégia, parceiro e execução",
      summary:
        "Seu cenário mostra maturidade suficiente para buscar soluções mais aderentes, com menos improviso e mais direção sobre o que realmente acelera o negócio.",
    };
  }, [formData, inferredArea, normalizedChallenge]);

  const startDiagnosis = (challenge?: string) => {
    setFormData((previous) => ({
      ...previous,
      challenge: challenge ?? previous.challenge,
    }));
    setScreen("quiz");
    setCurrentStep(0);
    setHasUnlockedWhatsapp(false);
    window.localStorage.removeItem("rsn-last-whatsapp-url");
  };

  const goHome = () => {
    setScreen("landing");
    setIsPersonalizedExplore(false);
    setExploreQuery("");
    setActiveExploreCategory("Todos");
  };

  const openConsultantArea = () => {
    setScreen("consultor");
  };

  const submitChallenge = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startDiagnosis();
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const nextStep = () => {
    if (!canContinue) {
      return;
    }

    if (currentStep < 5) {
      setCurrentStep((step) => step + 1);
      return;
    }

    setScreen("loading");
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
      return;
    }

    setScreen("landing");
  };

  const stepTitle = [
    "Entender o faturamento atual",
    "Ler o momento do negócio",
    "Entender como vocês decidem",
    "Mapear o gargalo predominante",
    "Entender sua experiência com soluções",
    "Definir o objetivo principal agora",
  ][currentStep];

  const canContinue = [
    Boolean(formData.revenueProfile),
    Boolean(formData.businessMoment),
    Boolean(formData.decisionMaking),
    Boolean(formData.currentBottleneck),
    Boolean(formData.solutionExperience),
    Boolean(formData.primaryGoal),
  ][currentStep];

  const preferredExploreCategory =
    inferredArea === "vendas"
      ? "Vendas"
      : inferredArea === "marketing"
        ? "Marketing & Growth"
        : inferredArea === "gestao"
          ? "Gestao & Estrategia"
          : inferredArea === "financeiro"
            ? "Financas"
            : "Todos";

  const resultRecommendations = useMemo(() => {
    const primaryCategory = preferredExploreCategory === "Todos" ? "Gestao & Estrategia" : preferredExploreCategory;
    const exactSpecialistMatch = exploreItems.find((item) => item.name === specialist.name);

    const primaryItem: ExploreItem =
      exactSpecialistMatch ??
      {
        id: `diag-${specialist.id}`,
        name: specialist.name,
        kind: "Consultor",
        category: primaryCategory,
        focus: specialist.focus,
        audience: "Empresas com cenário parecido com o seu diagnóstico",
        description: specialist.description,
        badge: "Recomendação principal",
      };

    const secondaryItems = exploreItems
      .filter((item) => item.id !== primaryItem.id)
      .filter((item) => item.category === primaryCategory || item.kind === "Parceiro")
      .slice(0, 2);

    return {
      primary: primaryItem,
      secondary: secondaryItems,
    };
  }, [preferredExploreCategory, specialist]);

  const filteredExploreItems = useMemo(() => {
    return exploreItems.filter((item) => {
      const matchesCategory =
        activeExploreCategory === "Todos" || item.category === activeExploreCategory;
      const normalizedQuery = exploreQuery.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.focus.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeExploreCategory, exploreQuery]);

  const openExploreCategory = (exploreCategory: string) => {
    setIsPersonalizedExplore(false);
    setExploreQuery("");
    setActiveExploreCategory(exploreCategory);
    setScreen("explore");
  };

  const recommendedExploreId = useMemo(() => {
    const sameCategoryItem =
      filteredExploreItems.find((item) => item.category === preferredExploreCategory) ?? filteredExploreItems[0];

    return sameCategoryItem?.id;
  }, [filteredExploreItems, preferredExploreCategory]);

  useEffect(() => {
    if (screen !== "loading") {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveExploreCategory(preferredExploreCategory);
      setExploreQuery(formData.challenge);
      setIsPersonalizedExplore(true);
      setScreen("result");
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [screen, preferredExploreCategory, formData.challenge]);

  useEffect(() => {
    if (!isContactModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isContactModalOpen]);

  const openContactModal = (target: ContactTarget) => {
    setContactTarget(target);
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };

  const submitContactRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contactTarget) {
      return;
    }

    const message = [
      `Olá, ${contactTarget.name}.`,
      `Meu nome é ${formData.name || "não informado"}.`,
      formData.email ? `Email: ${formData.email}.` : "",
      formData.phone ? `Telefone: ${formData.phone}.` : "",
      formData.role ? `Cargo: ${formData.role}.` : "",
      formData.mainPain ? `Dor principal: ${formData.mainPain}.` : "",
      formData.challenge ? `Desafio inicial: ${formData.challenge}.` : "",
      `Diagnóstico principal: ${diagnosis.title}.`,
      formData.primaryGoal ? `Objetivo principal: ${findOptionLabel(primaryGoalOptions, formData.primaryGoal)}.` : "",
      formData.currentBottleneck
        ? `Gargalo percebido: ${findOptionLabel(currentBottleneckOptions, formData.currentBottleneck)}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

    const url = `${contactTarget.whatsapp}?text=${encodeURIComponent(message)}`;
    window.localStorage.setItem("rsn-last-whatsapp-url", url);
    setHasUnlockedWhatsapp(true);
    setIsContactModalOpen(false);
  };

  const openWhatsAppDirect = () => {
    const unlockedUrl =
      window.localStorage.getItem("rsn-last-whatsapp-url") ??
      `${specialist.whatsapp}?text=${encodeURIComponent(
        [
          `Olá, ${specialist.name}.`,
          formData.challenge ? `Meu desafio inicial é: ${formData.challenge}.` : "",
          `Diagnóstico principal: ${diagnosis.title}.`,
          formData.primaryGoal
            ? `Objetivo principal: ${findOptionLabel(primaryGoalOptions, formData.primaryGoal)}.`
            : "",
          "Gostaria de entender a melhor solução para o meu momento.",
        ]
          .filter(Boolean)
          .join(" "),
      )}`;

    const url = unlockedUrl;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleConsultantLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConsultantAuthenticated(true);
    setConsultantSection("dashboard");
  };

  const consultantStats = useMemo(() => {
    const statusCount = consultantLeads.reduce<Record<ConsultantLead["status"], number>>(
      (accumulator, lead) => {
        accumulator[lead.status] += 1;
        return accumulator;
      },
      {
        Novo: 0,
        "Em contato": 0,
        Qualificado: 0,
        "Reunião marcada": 0,
      },
    );

    return [
      { label: "Leads recebidos", value: consultantLeads.length.toString().padStart(2, "0") },
      { label: "Em contato", value: statusCount["Em contato"].toString().padStart(2, "0") },
      { label: "Reuniões marcadas", value: statusCount["Reunião marcada"].toString().padStart(2, "0") },
      { label: "Qualificados", value: statusCount.Qualificado.toString().padStart(2, "0") },
    ];
  }, []);

  return (
    <div className="page-shell">
      <header className="topbar">
        <button className="brand brand-light brand-button" type="button" onClick={goHome} aria-label="Voltar para o início">
          <img className="brand-logo brand-logo-symbol" src="/logo-sem-fundo.png" alt="Resolva Seu Negócio" />
          <img className="brand-logo brand-logo-horizontal" src="/logo-sem-fundo.png" alt="Resolva Seu Negócio" />
        </button>

        <nav className="nav nav-light">
          <button className={screen === "landing" ? "nav-link active" : "nav-link"} onClick={goHome}>
            Início
          </button>
          <button
            className={screen === "explore" ? "nav-link active" : "nav-link"}
            onClick={() => {
              setIsPersonalizedExplore(false);
              setExploreQuery("");
              setActiveExploreCategory("Todos");
              setScreen("explore");
            }}
          >
            Explorar
          </button>
          <button className={screen === "consultor" ? "nav-link active" : "nav-link"} onClick={openConsultantArea}>
            Área do parceiro
          </button>
          {screen === "landing" && (
            <>
              <a href="#numeros">Números</a>
              <a href="#categorias">Categorias</a>
              <a href="#como-funciona">Como funciona</a>
            </>
          )}
          <button className="nav-cta" onClick={() => startDiagnosis()}>
            Fazer diagnóstico
          </button>
        </nav>
      </header>

      {screen === "landing" && (
        <main className="landing-light">
          <section className="search-hero">
            <div className="search-hero-pattern" />
            <div className="search-hero-glow" />
            <div className="search-hero-content">
              <p className="section-kicker centered">Resolva seu negócio</p>
              <h1>
                Conectamos você
                <br />
                à solução <span className="accent-word">exata</span>
                <br />
                para o seu
                <br />
                negócio
              </h1>
              <p className="hero-support">
                Entenda o que trava seu negócio e com quem resolver isso primeiro.
              </p>

              <form className="search-box" onSubmit={submitChallenge}>
                <input
                  id="challenge"
                  value={formData.challenge}
                  onChange={(event) => updateField("challenge", event.target.value)}
                  placeholder="Ex: minha empresa vende, mas tudo depende de indicação"
                />
                <button className="search-button" type="submit">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  Buscar solução
                </button>
              </form>

              <div className="popular-row">
                <span>Populares:</span>
                {quickChallenges.map((challenge) => (
                  <button
                    className="light-tag"
                    key={challenge}
                    type="button"
                    onClick={() => startDiagnosis(challenge)}
                  >
                    {challenge}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="logo-strip" aria-label="Frentes que mais travam empresas">
            <div className="logo-marquee">
              {[0, 1].map((track) => (
                <div className="logo-marquee-track" key={track}>
                  <span>frentes que mais travam empresas</span>
                  {ecosystemLogos.map((logo) => (
                    <strong key={`${track}-${logo}`}>{logo}</strong>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="light-section" id="como-funciona">
            <div className="section-heading">
              <p className="section-kicker">Como resolvemos</p>
              <h2>
                Você mostra a dor. A plataforma mostra o que fazer <span className="accent-word-inline">primeiro</span>.
              </h2>
            </div>

            <div className="process-grid">
              {howItWorks.map((item, index) => (
                <article className="process-card" key={item.title}>
                  <div className="process-illustration">{index + 1}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="light-section" id="numeros">
            <div className="numbers-showcase">
              <div className="numbers-main">
                <div className="section-heading">
                  <p className="section-kicker">O tamanho do problema</p>
                  <h2>O que é Resolva Seu Negócio em números:</h2>
                </div>

                <div className="numbers-grid">
                  {numbers.map((item) => (
                    <article className="number-card" key={`${item.prefix ?? ""}${item.value}${item.suffix ?? ""}`}>
                      <strong>
                        <AnimatedNumber value={item.value} prefix={item.prefix} suffix={item.suffix} />
                      </strong>
                      <p>{item.label}</p>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="numbers-feed">
                <div className="numbers-feed-copy">
                  <p className="section-kicker">Principais dores</p>
                  <h3>Todos os dias empresários nos reportam:</h3>
                </div>
                <AnimatedSignalList items={diagnosisSignals} />
              </aside>
            </div>
          </section>

          <section className="light-section" id="parceiros">
            <div className="section-heading">
              <p className="section-kicker">Quem resolve</p>
              <h2>
                Especialistas preparados para atacar <span className="accent-word-inline">dores reais</span> do negócio
              </h2>
              <p className="section-subtitle">
                Consultores e parceiros para vendas, marketing, gestão e finanças.
              </p>
            </div>

            <div className="partners-grid">
              {featuredPartners.map((partner) => (
                <article className="partner-card" key={partner.name}>
                  <div className="partner-badge">{partner.name.slice(0, 1)}</div>
                  <div className="partner-copy">
                    <h3>{partner.name}</h3>
                    <p className="partner-category">{partner.category}</p>
                    <span>{partner.benefit}</span>
                  </div>
                  <button
                    className="partner-link"
                    type="button"
                    onClick={() => startDiagnosis(partner.category)}
                  >
                    Ver mais
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="light-section" id="categorias">
            <div className="section-heading centered-heading">
              <p className="section-kicker">Por onde sua empresa está travando</p>
              <h2>Explore por categoria</h2>
              <p className="section-subtitle narrow">
                Escolha a frente que mais pesa hoje. Se não souber, o diagnóstico encontra.
              </p>
            </div>

            <div className="category-grid">
              {categories.map((category) => (
                <button
                  className={category.accent ? "category-card accent category-card-button" : "category-card category-card-button"}
                  key={category.title}
                  type="button"
                  onClick={() => openExploreCategory(category.exploreCategory)}
                >
                  <div className="category-icon">{category.title.slice(0, 1)}</div>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                  <div className="category-meta">
                    <span className="category-count">
                      +{exploreItems.filter((item) => item.category === category.exploreCategory).length}
                    </span>
                    <span className="category-signal">{category.signal}</span>
                  </div>
                  <span className="category-link">
                    Explorar categoria
                  </span>
                  <div className="category-footer-indicator" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="light-section">
            <div className="section-heading centered-heading">
              <p className="section-kicker">Antes e depois</p>
              <h2>Da dor recorrente ao resultado certo.</h2>
              <p className="section-subtitle narrow">
                O diagnóstico mostra o que trava. A direção certa mostra o que começa a andar.
              </p>
            </div>

            <div className="before-after-grid">
              <article className="comparison-card">
                <div className="numbers-feed-copy">
                  <p className="section-kicker">Antes do diagnóstico</p>
                  <h3>O que os empresários reportam quando chegam.</h3>
                </div>
                <AnimatedSignalList items={diagnosisSignals} />
              </article>

              <article className="comparison-card success">
                <div className="numbers-feed-copy">
                  <p className="section-kicker">Depois da direção certa</p>
                  <h3>O que eles começam a relatar após agir com clareza.</h3>
                </div>
                <AnimatedSignalList items={successSignals} />
              </article>
            </div>
          </section>

          <section className="light-section cta-section">
            <div className="cta-copy">
              <p className="section-kicker">Pare de correr atrás do próprio rabo</p>
              <h2>
                Seu negócio não precisa de mais tentativa e erro. Precisa de <span className="accent-word-inline">direção</span>.
              </h2>
              <p className="section-subtitle">
                Comece pelo diagnóstico e entenda qual gargalo atacar agora.
              </p>
              <button className="dark-button" type="button" onClick={() => startDiagnosis()}>
                Fazer diagnóstico agora
              </button>
            </div>

            <aside className="partner-cta-card">
              <p className="section-kicker">Seja parceiro</p>
              <h3>Você resolve dores empresariais de verdade?</h3>
              <p>
                Se sua especialidade destrava crescimento, faz sentido conversar com a gente.
              </p>
              <button className="gold-button" type="button">
                Quero entrar na rede
              </button>
              <button className="ghost-button partner-secondary-cta" type="button" onClick={openConsultantArea}>
                Ver área do parceiro
              </button>
            </aside>
          </section>
        </main>
      )}

      {screen === "explore" && (
        <main className="explore-layout">
          <section className="explore-hero">
            <p className="section-kicker">
              {isPersonalizedExplore ? "Conexão recomendada para sua empresa" : "Rede Resolva Seu Negócio"}
            </p>
            <h1>
              Conectamos <span className="accent-word-inline">parceiros</span> e soluções para
              cada desafio da sua empresa
            </h1>
            <p className="explore-support">
              {isPersonalizedExplore
                ? "Analisamos sua dor, cruzamos contexto, maturidade e prioridade para destacar a solução mais aderente ao seu momento."
                : "Uma vitrine inicial com soluções, especialistas e parceiros para vendas, marketing, gestão, finanças, operações e tecnologia."}
            </p>

            {isPersonalizedExplore && (
              <div className="explore-recommendation-banner">
                <strong>Recomendação pronta.</strong>
                <span>
                  Com base nas suas respostas, destacamos a solução mais aderente e filtramos os parceiros que melhor atacam esse gargalo.
                </span>
              </div>
            )}

            <div className="explore-search-shell">
              <input
                className="explore-search-input"
                value={exploreQuery}
                onChange={(event) => setExploreQuery(event.target.value)}
                placeholder="Buscar por nome, categoria ou tipo de dor..."
              />
              <button className="search-button" type="button">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                Buscar solução
              </button>
            </div>
          </section>

          <section className="explore-filter-bar">
            <span className="explore-filter-label">Categorias</span>
            <div className="explore-filter-chips">
              {exploreCategories.map((category) => (
                <button
                  key={category}
                  className={activeExploreCategory === category ? "explore-chip active" : "explore-chip"}
                  type="button"
                  onClick={() => setActiveExploreCategory(category)}
                >
                  {formatCategoryLabel(category)}
                </button>
              ))}
            </div>
          </section>

          <section className="explore-content">
            <aside className="explore-sidebar">
              <div className="explore-sidebar-card">
                <p className="section-kicker">Categorias</p>
                <div className="explore-sidebar-links">
                  {exploreCategories.map((category) => (
                    <button
                      key={category}
                      className={activeExploreCategory === category ? "sidebar-link active" : "sidebar-link"}
                      type="button"
                      onClick={() => setActiveExploreCategory(category)}
                    >
                      {formatCategoryLabel(category)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="explore-sidebar-card">
                <p className="section-kicker">Destaques</p>
                <ul className="explore-sidebar-tags">
                  <li>Consultores</li>
                  <li>SaaS</li>
                  <li>Parceiros</li>
                  <li>Mais procurados</li>
                </ul>
              </div>
            </aside>

            <div className="explore-results">
              {filteredExploreItems.map((item) => (
                <article
                  className={
                    item.id === recommendedExploreId && isPersonalizedExplore
                      ? "explore-result-card recommended"
                      : "explore-result-card"
                  }
                  key={item.id}
                >
                  <div className="explore-result-brand">
                    <div className="explore-result-logo">{item.name.slice(0, 1)}</div>
                    <div>
                      <p className="explore-result-kind">{item.kind}</p>
                      <h3>{item.name}</h3>
                      <span className="explore-result-badge">{formatCategoryLabel(item.category)}</span>
                    </div>
                  </div>

                  <div className="explore-result-about">
                    <p className="explore-result-label">Sobre</p>
                    <p>{item.description}</p>
                    {item.badge && <small>{item.badge}</small>}
                  </div>

                  <div className="explore-result-meta">
                    <p className="explore-result-label">Foco</p>
                    <strong>{item.focus}</strong>
                    <p className="explore-result-label">Para quem é</p>
                    <span>{item.audience}</span>
                  </div>

                  <div className="explore-result-action">
                    <button className="dark-button" type="button" onClick={() => startDiagnosis(item.focus)}>
                      Ver detalhes
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {screen === "loading" && (
        <main className="loading-layout">
          <section className="loading-card">
            <img className="loading-logo" src="/logo-symbol.svg" alt="Resolva Seu Negócio" />
            <p className="section-kicker">Analisando sua empresa</p>
            <h1>Estamos cruzando suas respostas para conectar a solução ideal.</h1>
            <p className="loading-copy">
              Levando em conta dor inicial, momento do negócio, objetivo principal e contexto operacional para priorizar quem faz mais sentido para você agora.
            </p>

            <div className="loading-progress" aria-hidden="true">
              <span />
            </div>

            <div className="loading-steps">
              <div className="loading-step">
                <strong>Lendo sua dor</strong>
                <span>Interpretando o gargalo relatado no formulário inicial.</span>
              </div>
              <div className="loading-step">
                <strong>Cruzando contexto</strong>
                <span>Maturidade, objetivo e sinais operacionais entram na análise.</span>
              </div>
              <div className="loading-step">
                <strong>Preparando conexão</strong>
                <span>Selecionando as soluções e parceiros mais aderentes para você.</span>
              </div>
            </div>
          </section>
        </main>
      )}

      {screen === "quiz" && (
        <main className="quiz-layout">
          <section className="quiz-card">
            <div className="quiz-progress">
              {[0, 1, 2, 3, 4, 5].map((step) => (
                <span
                  key={step}
                  className={step <= currentStep ? "progress-dot active" : "progress-dot"}
                />
              ))}
            </div>

            <div className="quiz-header">
              <p className="section-kicker">Etapa {currentStep + 1} de 6</p>
              <h2>{stepTitle}</h2>
              <p>
                {formData.challenge
                  ? `Desafio inicial informado: "${formData.challenge}".`
                  : "Responda o suficiente para encontrarmos o especialista mais aderente."}
              </p>
            </div>

            {currentStep === 0 && (
              <div className="quiz-choice-list">
                <p className="quiz-question">Qual o faturamento médio mensal da sua empresa hoje?</p>
                {revenueProfileOptions.map((option, index) => (
                  <button
                    key={option.value}
                    className={formData.revenueProfile === option.value ? "choice-card choice-card-detailed selected" : "choice-card choice-card-detailed"}
                    type="button"
                    onClick={() => updateField("revenueProfile", option.value)}
                  >
                    <strong className="choice-index">{index + 1}.</strong>
                    <span className="choice-detail">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 1 && (
              <div className="quiz-choice-list">
                <p className="quiz-question">Qual melhor descreve o momento atual da sua empresa?</p>
                {businessMomentOptions.map((option, index) => (
                  <button
                    key={option.value}
                    className={formData.businessMoment === option.value ? "choice-card choice-card-detailed selected" : "choice-card choice-card-detailed"}
                    type="button"
                    onClick={() => updateField("businessMoment", option.value)}
                  >
                    <strong className="choice-index">{index + 1}.</strong>
                    <span className="choice-detail">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="quiz-choice-list">
                <p className="quiz-question">Como as decisões importantes são tomadas hoje na sua empresa?</p>
                {decisionMakingOptions.map((option, index) => (
                  <button
                    key={option.value}
                    className={formData.decisionMaking === option.value ? "choice-card choice-card-detailed selected" : "choice-card choice-card-detailed"}
                    type="button"
                    onClick={() => updateField("decisionMaking", option.value)}
                  >
                    <strong className="choice-index">{index + 1}.</strong>
                    <span className="choice-detail">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="quiz-choice-list">
                <p className="quiz-question">Qual dessas situações mais se aproxima dos desafios que você enfrenta hoje?</p>
                {currentBottleneckOptions.map((option, index) => (
                  <button
                    key={option.value}
                    className={formData.currentBottleneck === option.value ? "choice-card choice-card-detailed selected" : "choice-card choice-card-detailed"}
                    type="button"
                    onClick={() => updateField("currentBottleneck", option.value)}
                  >
                    <strong className="choice-index">{index + 1}.</strong>
                    <span className="choice-detail">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div className="quiz-choice-list">
                <p className="quiz-question">Você já buscou alguma solução para melhorar sua empresa?</p>
                {solutionExperienceOptions.map((option, index) => (
                  <button
                    key={option.value}
                    className={formData.solutionExperience === option.value ? "choice-card choice-card-detailed selected" : "choice-card choice-card-detailed"}
                    type="button"
                    onClick={() => updateField("solutionExperience", option.value)}
                  >
                    <strong className="choice-index">{index + 1}.</strong>
                    <span className="choice-detail">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 5 && (
              <div className="quiz-choice-list">
                <p className="quiz-question">Qual é o principal objetivo da sua empresa neste momento?</p>
                {primaryGoalOptions.map((option, index) => (
                  <button
                    key={option.value}
                    className={formData.primaryGoal === option.value ? "choice-card choice-card-detailed selected" : "choice-card choice-card-detailed"}
                    type="button"
                    onClick={() => updateField("primaryGoal", option.value)}
                  >
                    <strong className="choice-index">{index + 1}.</strong>
                    <span className="choice-detail">{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="quiz-actions">
              <button className="ghost-button" type="button" onClick={previousStep}>
                Voltar
              </button>
              <button
                className="primary-button"
                type="button"
                onClick={nextStep}
                disabled={!canContinue}
              >
                {currentStep === 5 ? "Ver recomendação" : "Continuar"}
              </button>
            </div>
          </section>
        </main>
      )}

      {screen === "result" && (
        <main className="result-layout">
          <section className="result-card">
            <p className="section-kicker">Diagnóstico concluído</p>
            <h1>{diagnosis.title}</h1>
            <p className="result-summary">{diagnosis.summary}</p>

            <div className="result-diagnosis-strip">
              <div className="result-diagnosis-chip">
                <span>Objetivo principal</span>
                <strong>{findOptionLabel(primaryGoalOptions, formData.primaryGoal)}</strong>
              </div>
              <div className="result-diagnosis-chip">
                <span>Momento do negócio</span>
                <strong>{findOptionLabel(businessMomentOptions, formData.businessMoment)}</strong>
              </div>
              <div className="result-diagnosis-chip">
                <span>Direção sugerida</span>
                <strong>{formatCategoryLabel(resultRecommendations.primary.category)}</strong>
              </div>
            </div>

            <div className="result-recommendations">
              <article className="explore-result-card recommended result-recommendation-primary">
                <div className="explore-result-brand">
                  <div className="explore-result-logo">{resultRecommendations.primary.name.slice(0, 1)}</div>
                  <div>
                    <p className="explore-result-kind">{resultRecommendations.primary.kind}</p>
                    <h3>{resultRecommendations.primary.name}</h3>
                    <span className="explore-result-badge">
                      {formatCategoryLabel(resultRecommendations.primary.category)}
                    </span>
                  </div>
                </div>

                <div className="explore-result-about">
                  <p className="explore-result-label">Por que faz sentido</p>
                  <p>{resultRecommendations.primary.description}</p>
                  <small>{resultRecommendations.primary.badge ?? "Melhor encaixe para o seu momento"}</small>
                </div>

                <div className="explore-result-meta">
                  <p className="explore-result-label">Foco</p>
                  <strong>{resultRecommendations.primary.focus}</strong>
                  <p className="explore-result-label">Para quem é</p>
                  <span>{resultRecommendations.primary.audience}</span>
                </div>

                <div className="explore-result-action explore-result-action-stack">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() =>
                      openContactModal({
                        name: specialist.name,
                        title: specialist.title,
                        whatsapp: specialist.whatsapp,
                      })
                    }
                  >
                    Entrar em contato
                  </button>
                  {hasUnlockedWhatsapp ? (
                    <button className="whatsapp-button" type="button" onClick={openWhatsAppDirect}>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 11.5a8.5 8.5 0 0 1-12.76 7.38L4 20l1.18-3.1A8.5 8.5 0 1 1 20 11.5Z" />
                        <path d="M8.8 10.6c.18-.4.37-.42.54-.43h.46c.15 0 .4.06.61.51.21.45.71 1.55.77 1.66.06.1.1.23.02.37-.08.14-.12.23-.25.35-.12.12-.26.27-.37.36-.12.1-.24.2-.1.39.13.2.6.98 1.3 1.6.89.79 1.63 1.04 1.86 1.16.23.12.36.1.5-.06.14-.16.58-.67.73-.9.16-.23.31-.2.52-.12.21.08 1.34.63 1.57.75.23.12.39.18.45.29.06.1.06.6-.14 1.18-.2.58-1.15 1.12-1.58 1.18-.4.06-.91.09-1.47-.1-.34-.11-.78-.25-1.35-.49-.96-.41-1.98-1.16-2.72-2.21-.74-1.05-1.18-2.09-1.31-2.89-.13-.8-.01-1.23.09-1.5Z" />
                      </svg>
                      Falar conosco
                    </button>
                  ) : (
                    <p className="result-cta-hint">
                      Preencha seus dados para liberar o contato direto no WhatsApp.
                    </p>
                  )}
                </div>
              </article>

              {resultRecommendations.secondary.length > 0 && (
                <div className="result-secondary-block">
                  <div className="section-heading">
                    <p className="section-kicker">Outras recomendações</p>
                    <h2>Alternativas aderentes ao seu momento</h2>
                    <p className="section-subtitle">
                      Se quiser comparar caminhos, estas são as opções secundárias mais próximas do seu diagnóstico.
                    </p>
                  </div>

                  <div className="explore-results">
                    {resultRecommendations.secondary.map((item) => (
                      <article className="explore-result-card result-recommendation-secondary" key={item.id}>
                        <div className="explore-result-brand">
                          <div className="explore-result-logo">{item.name.slice(0, 1)}</div>
                          <div>
                            <p className="explore-result-kind">{item.kind}</p>
                            <h3>{item.name}</h3>
                            <span className="explore-result-badge">{formatCategoryLabel(item.category)}</span>
                          </div>
                        </div>

                        <div className="explore-result-about">
                          <p className="explore-result-label">Sobre o parceiro</p>
                          <p>{item.description}</p>
                          {item.badge && <small>{item.badge}</small>}
                        </div>

                        <div className="explore-result-meta">
                          <p className="explore-result-label">Foco</p>
                          <strong>{item.focus}</strong>
                          <p className="explore-result-label">Para quem é</p>
                          <span>{item.audience}</span>
                        </div>

                        <div className="explore-result-action">
                          <button className="dark-button" type="button" onClick={() => openExploreCategory(item.category)}>
                            Ver alternativa
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="result-actions">
              <button className="ghost-button" onClick={() => setScreen("landing")}>
                Voltar para o início
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setIsPersonalizedExplore(true);
                  setScreen("explore");
                }}
              >
                Ver todas as recomendações
              </button>
            </div>
          </section>
        </main>
      )}

      {screen === "consultor" && (
        <main className="consultant-layout">
          {!consultantAuthenticated ? (
            <section className="consultant-auth-shell">
              <div className="consultant-auth-copy">
                <p className="section-kicker">Área do parceiro</p>
                <h1>CRM operacional para seus leads mais quentes.</h1>
                <p>
                  Uma área para o consultor e para o time comercial trabalharem leads, diagnóstico, agenda e histórico
                  de contato com mais velocidade.
                </p>

                <div className="consultant-auth-points">
                  <div>
                    <strong>Leads com contexto</strong>
                    <span>Receba dor inicial, diagnóstico e objetivo principal no mesmo lugar.</span>
                  </div>
                  <div>
                    <strong>Agenda integrada</strong>
                    <span>Organize disponibilidade do time e acelere a marcação de reunião.</span>
                  </div>
                  <div>
                    <strong>Execução comercial</strong>
                    <span>Distribua, qualifique e avance os leads sem depender de planilhas soltas.</span>
                  </div>
                </div>
              </div>

              <section className="consultant-login-card">
                <p className="section-kicker">Login do parceiro</p>
                <h2>Entre na sua instância</h2>
                <p>Autenticação inicial para consultor, SDR ou gestor do parceiro.</p>

                <form className="consultant-login-form" onSubmit={handleConsultantLogin}>
                  <label>
                    Email
                    <input
                      value={consultantForm.email}
                      onChange={(event) => setConsultantForm((previous) => ({ ...previous, email: event.target.value }))}
                      type="email"
                      placeholder="voce@parceiro.com"
                      required
                    />
                  </label>
                  <label>
                    Senha
                    <input
                      value={consultantForm.password}
                      onChange={(event) => setConsultantForm((previous) => ({ ...previous, password: event.target.value }))}
                      type="password"
                      placeholder="Digite sua senha"
                      required
                    />
                  </label>
                  <label>
                    Instância
                    <input
                      value={consultantForm.instance}
                      onChange={(event) => setConsultantForm((previous) => ({ ...previous, instance: event.target.value }))}
                      placeholder="ex: marcos-tavares"
                      required
                    />
                  </label>
                  <button className="primary-button" type="submit">
                    Entrar na área do parceiro
                  </button>
                </form>
              </section>
            </section>
          ) : (
            <section className="consultant-dashboard">
              <aside className="consultant-sidebar">
                <div className="consultant-sidebar-brand">
                  <img src="/logo-sem-fundo.png" alt="Resolva Seu Negócio" />
                  <div>
                    <strong>Instância ativa</strong>
                    <span>{consultantForm.instance || "parceiro-rsn"}</span>
                  </div>
                </div>

                <div className="consultant-sidebar-nav">
                  {[
                    { id: "dashboard", label: "Dashboard" },
                    { id: "leads", label: "Leads" },
                    { id: "agenda", label: "Agenda" },
                    { id: "perfil", label: "Perfil" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      className={consultantSection === item.id ? "consultant-nav-link active" : "consultant-nav-link"}
                      type="button"
                      onClick={() => setConsultantSection(item.id as ConsultantSection)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="consultant-sidebar-card">
                  <p className="section-kicker">Próxima reunião</p>
                  <strong>{consultantAgenda[0].company}</strong>
                  <span>{consultantAgenda[0].startsAt}</span>
                  <small>{consultantAgenda[0].title}</small>
                </div>
              </aside>

              <div className="consultant-main">
                <div className="consultant-header">
                  <div>
                    <p className="section-kicker">CRM do parceiro</p>
                    <h1>
                      {consultantSection === "dashboard"
                        ? "Visão geral do comercial"
                        : consultantSection === "leads"
                          ? "Leads e diagnósticos"
                          : consultantSection === "agenda"
                            ? "Agenda e disponibilidade"
                            : "Perfil e operação do parceiro"}
                    </h1>
                    <p>
                      {consultantSection === "dashboard"
                        ? "Uma leitura rápida da operação comercial do parceiro, com dados do diagnóstico e status dos leads."
                        : consultantSection === "leads"
                          ? "Acompanhe cada lead com contexto completo de diagnóstico, momento do negócio e objetivo principal."
                          : consultantSection === "agenda"
                            ? "Controle disponibilidade, próximos slots e reuniões quentes vindas do diagnóstico."
                            : "Configure dados públicos do parceiro, equipe comercial e regras de atendimento."}
                    </p>
                  </div>
                  <button className="ghost-button" type="button" onClick={() => setConsultantAuthenticated(false)}>
                    Sair da instância
                  </button>
                </div>

                {consultantSection === "dashboard" && (
                  <>
                    <div className="consultant-stats-grid">
                      {consultantStats.map((stat) => (
                        <article className="consultant-stat-card" key={stat.label}>
                          <span>{stat.label}</span>
                          <strong>{stat.value}</strong>
                        </article>
                      ))}
                    </div>

                    <div className="consultant-panels">
                      <section className="consultant-panel">
                        <div className="consultant-panel-header">
                          <h2>Leads mais recentes</h2>
                          <span>Entrada via diagnóstico</span>
                        </div>
                        <div className="consultant-lead-list">
                          {consultantLeads.slice(0, 3).map((lead) => (
                            <article className="consultant-lead-card" key={lead.id}>
                              <div>
                                <strong>{lead.company}</strong>
                                <span>
                                  {lead.contact} · {lead.role}
                                </span>
                              </div>
                              <div className="consultant-lead-meta">
                                <span className={`status-pill status-${toStatusClassName(lead.status)}`}>
                                  {lead.status}
                                </span>
                                <small>{lead.updatedAt}</small>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>

                      <section className="consultant-panel">
                        <div className="consultant-panel-header">
                          <h2>Agenda do time</h2>
                          <span>Próximos slots confirmados</span>
                        </div>
                        <div className="consultant-agenda-list">
                          {consultantAgenda.map((item) => (
                            <article className="consultant-agenda-card" key={item.id}>
                              <div>
                                <strong>{item.title}</strong>
                                <span>{item.company}</span>
                              </div>
                              <div className="consultant-agenda-meta">
                                <small>{item.startsAt}</small>
                                <span className={`status-pill status-${toStatusClassName(item.status)}`}>{item.status}</span>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    </div>
                  </>
                )}

                {consultantSection === "leads" && (
                  <section className="consultant-data-table">
                    <div className="consultant-table-header">
                      <span>Empresa</span>
                      <span>Diagnóstico</span>
                      <span>Objetivo</span>
                      <span>Status</span>
                      <span>Atualização</span>
                    </div>
                    {consultantLeads.map((lead) => (
                      <article className="consultant-table-row" key={lead.id}>
                        <div>
                          <strong>{lead.company}</strong>
                          <span>{lead.contact}</span>
                        </div>
                        <p>{lead.diagnosis}</p>
                        <p>{lead.objective}</p>
                        <span className={`status-pill status-${toStatusClassName(lead.status)}`}>{lead.status}</span>
                        <small>{lead.updatedAt}</small>
                      </article>
                    ))}
                  </section>
                )}

                {consultantSection === "agenda" && (
                  <div className="consultant-panels">
                    <section className="consultant-panel">
                      <div className="consultant-panel-header">
                        <h2>Disponibilidade padrão</h2>
                        <span>Base para reunião quente</span>
                      </div>
                      <div className="consultant-availability-grid">
                        {[
                          "Seg · 09:00 às 12:00",
                          "Seg · 14:00 às 17:00",
                          "Qua · 09:00 às 12:00",
                          "Qui · 14:00 às 18:00",
                        ].map((slot) => (
                          <span className="availability-slot" key={slot}>
                            {slot}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section className="consultant-panel">
                      <div className="consultant-panel-header">
                        <h2>Reuniões marcadas</h2>
                        <span>Fluxo rápido para SDRs</span>
                      </div>
                      <div className="consultant-agenda-list">
                        {consultantAgenda.map((item) => (
                          <article className="consultant-agenda-card" key={item.id}>
                            <div>
                              <strong>{item.title}</strong>
                              <span>{item.company}</span>
                            </div>
                            <div className="consultant-agenda-meta">
                              <small>{item.startsAt}</small>
                              <span>{item.owner}</span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {consultantSection === "perfil" && (
                  <div className="consultant-panels">
                    <section className="consultant-panel">
                      <div className="consultant-panel-header">
                        <h2>Perfil público do parceiro</h2>
                        <span>Dados exibidos na recomendação</span>
                      </div>
                      <div className="consultant-profile-grid">
                        <div>
                          <span>Nome</span>
                          <strong>Marcos Tavares</strong>
                        </div>
                        <div>
                          <span>Especialidade</span>
                          <strong>Operação Comercial</strong>
                        </div>
                        <div>
                          <span>Foco</span>
                          <strong>Previsibilidade, playbook e rotina de gestão</strong>
                        </div>
                        <div>
                          <span>Canal principal</span>
                          <strong>WhatsApp + reunião de diagnóstico</strong>
                        </div>
                      </div>
                    </section>

                    <section className="consultant-panel">
                      <div className="consultant-panel-header">
                        <h2>Recomendação de stack</h2>
                        <span>Base recomendada para este produto</span>
                      </div>
                      <div className="consultant-recommendation-copy">
                        <strong>Recomendação: Supabase</strong>
                        <p>
                          Para esse produto, Supabase faz mais sentido que Railway porque reduz tempo de implementação,
                          entrega autenticação pronta para parceiros, Postgres gerenciado, RLS para separar instâncias,
                          storage e edge functions no mesmo stack.
                        </p>
                        <ul>
                          <li>Auth para parceiros e equipe comercial</li>
                          <li>Postgres com isolamento por instância</li>
                          <li>Policies por parceiro e por membro do time</li>
                          <li>Facilidade para agenda, leads, notas e histórico</li>
                        </ul>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      )}

      {isContactModalOpen && contactTarget && (
        <div className="modal-overlay" role="presentation" onClick={closeContactModal}>
          <section
            className="contact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="contact-modal-header">
              <div>
                <p className="section-kicker">Entrar em contato</p>
                <h2 id="contact-modal-title">{contactTarget.name}</h2>
                <p>{contactTarget.title}</p>
              </div>
              <button className="modal-close" type="button" onClick={closeContactModal} aria-label="Fechar modal">
                ×
              </button>
            </div>

            <form className="contact-modal-form" onSubmit={submitContactRequest}>
              <label>
                Nome completo
                <input
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </label>
              <label>
                Email
                <input
                  value={formData.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="voce@empresa.com"
                  type="email"
                  required
                />
              </label>
              <label>
                Telefone
                <input
                  value={formData.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="(85) 99999-9999"
                  required
                />
              </label>
              <label>
                Cargo
                <input
                  value={formData.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  placeholder="Ex: CEO, diretora comercial, operações"
                  required
                />
              </label>
              <label>
                Dor principal
                <textarea
                  value={formData.mainPain}
                  onChange={(event) => updateField("mainPain", event.target.value)}
                  placeholder="Descreva em poucas palavras o que mais está travando seu negócio hoje"
                  required
                />
              </label>

              <div className="contact-modal-actions">
                <button className="ghost-button" type="button" onClick={closeContactModal}>
                  Cancelar
                </button>
                <button className="primary-button" type="submit">
                  Enviar contato
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
