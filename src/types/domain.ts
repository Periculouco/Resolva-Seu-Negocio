export type Area = "vendas" | "marketing" | "gestao" | "financeiro" | "outros";

export type Screen = "landing" | "explore" | "quiz" | "loading" | "result" | "consultor";

export type ConsultantSection = "dashboard" | "leads" | "agenda" | "perfil";

export type Specialist = {
  id: string;
  name: string;
  title: string;
  focus: string;
  description: string;
  bullets: string[];
  whatsapp: string;
};

export type ExploreItem = {
  id: string;
  name: string;
  kind: "Consultor" | "SaaS" | "Parceiro";
  category: string;
  focus: string;
  audience: string;
  description: string;
  badge?: string;
};

export type NumberItem = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

export type SignalItem = {
  title: string;
  description: string;
  icon: string;
  accent: string;
  time: string;
};

export type ContactTarget = {
  name: string;
  title: string;
  whatsapp: string;
};

export type ConsultantLead = {
  id: string;
  company: string;
  contact: string;
  role: string;
  status: "Novo" | "Em contato" | "Qualificado" | "Reunião marcada" | "Perdido";
  diagnosis: string;
  objective: string;
  urgency: string;
  updatedAt: string;
};

export type ConsultantAgendaItem = {
  id: string;
  title: string;
  company: string;
  startsAt: string;
  owner: string;
  status: "Confirmada" | "Pendente";
};

export type RevenueProfile =
  | "inconsistente"
  | "ate_30k"
  | "30k_100k"
  | "100k_300k"
  | "300k_1m"
  | "acima_1m";

export type BusinessMoment =
  | "comecando"
  | "validado_desorganizado"
  | "patinando"
  | "crescendo_sem_prioridade"
  | "estruturada_subperformando"
  | "escalando_com_seguranca";

export type DecisionMaking =
  | "urgencia"
  | "tentativa_erro"
  | "alguma_estrategia"
  | "organizacao_sem_clareza"
  | "dados_sem_direcao_externa"
  | "processo_refinando";

export type CurrentBottleneck =
  | "varios_sem_ordem"
  | "falhas_sem_identificar"
  | "problema_sem_solucao"
  | "solucoes_sem_resultado"
  | "clareza_parcial_execucao"
  | "clareza_busca_eficiencia";

export type SolutionExperience =
  | "interno"
  | "sem_criterio"
  | "sem_consistencia"
  | "sem_adequacao"
  | "boas_sem_continuidade"
  | "estrategicas_evoluir";

export type PrimaryGoal =
  | "sair_caos"
  | "controle_operacao"
  | "aumentar_previsibilidade"
  | "corrigir_gargalos"
  | "escalar_sustentavel"
  | "otimizar_existente";

export type FormData = {
  challenge: string;
  revenueProfile: RevenueProfile | "";
  businessMoment: BusinessMoment | "";
  decisionMaking: DecisionMaking | "";
  currentBottleneck: CurrentBottleneck | "";
  solutionExperience: SolutionExperience | "";
  primaryGoal: PrimaryGoal | "";
  name: string;
  email: string;
  phone: string;
  role: string;
  mainPain: string;
};
