import type { Area, ExploreItem, FormData, Specialist } from "../types/domain";

export type Diagnosis = {
  title: string;
  summary: string;
};

export type ExploreCategory =
  | "Todos"
  | "Vendas"
  | "Marketing & Growth"
  | "Gestao & Estrategia"
  | "Financas";

export type ResultRecommendations = {
  primary: ExploreItem;
  secondary: ExploreItem[];
};

type InferAreaParams = Pick<FormData, "challenge" | "primaryGoal" | "currentBottleneck" | "revenueProfile">;

type DiagnosisParams = Pick<
  FormData,
  "businessMoment" | "currentBottleneck" | "decisionMaking" | "primaryGoal" | "solutionExperience"
> & {
  inferredArea: Area;
  normalizedChallenge: string;
};

type ResultRecommendationsParams = {
  exploreItems: ExploreItem[];
  preferredExploreCategory: ExploreCategory;
  specialist: Specialist;
};

export function inferArea({
  challenge,
  currentBottleneck,
  primaryGoal,
  revenueProfile,
}: InferAreaParams): Area {
  const normalizedChallenge = challenge.toLowerCase();

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
    primaryGoal === "aumentar_previsibilidade"
  ) {
    return "vendas";
  }

  if (
    primaryGoal === "sair_caos" ||
    primaryGoal === "controle_operacao" ||
    primaryGoal === "escalar_sustentavel" ||
    currentBottleneck === "varios_sem_ordem" ||
    currentBottleneck === "falhas_sem_identificar"
  ) {
    return "gestao";
  }

  if (primaryGoal === "otimizar_existente" && (revenueProfile === "300k_1m" || revenueProfile === "acima_1m")) {
    return "gestao";
  }

  return "outros";
}

export function buildDiagnosis({
  businessMoment,
  currentBottleneck,
  decisionMaking,
  inferredArea,
  normalizedChallenge,
  primaryGoal,
  solutionExperience,
}: DiagnosisParams): Diagnosis {
  if (currentBottleneck === "varios_sem_ordem" || currentBottleneck === "falhas_sem_identificar") {
    return {
      title: "Falta de clareza sobre prioridade de crescimento",
      summary:
        "Seu negócio já sente o peso de vários gargalos ao mesmo tempo, mas ainda sem uma leitura clara do que precisa ser atacado primeiro.",
    };
  }

  if (
    inferredArea === "vendas" &&
    (primaryGoal === "aumentar_previsibilidade" ||
      currentBottleneck === "problema_sem_solucao" ||
      currentBottleneck === "solucoes_sem_resultado")
  ) {
    return {
      title: "Falta de previsibilidade comercial",
      summary:
        "Hoje a empresa até gera movimento comercial, mas ainda sem processo consistente o suficiente para transformar esforço em receita previsível.",
    };
  }

  if (
    inferredArea === "marketing" &&
    (currentBottleneck === "problema_sem_solucao" ||
      solutionExperience === "sem_consistencia" ||
      solutionExperience === "sem_criterio")
  ) {
    return {
      title: "Aquisição sem previsibilidade",
      summary:
        "Existe tentativa de gerar demanda, mas ainda sem uma estrutura clara para saber o que realmente traz clientes e o que só consome energia.",
    };
  }

  if (
    inferredArea === "financeiro" ||
    (primaryGoal === "controle_operacao" &&
      (normalizedChallenge.includes("caixa") || normalizedChallenge.includes("margem")))
  ) {
    return {
      title: "Falta de clareza financeira para crescer com segurança",
      summary:
        "A operação pode até estar rodando, mas decisões importantes ainda acontecem sem visibilidade suficiente de caixa, margem e impacto real no negócio.",
    };
  }

  if (
    businessMoment === "crescendo_sem_prioridade" ||
    businessMoment === "escalando_com_seguranca" ||
    primaryGoal === "escalar_sustentavel" ||
    primaryGoal === "otimizar_existente"
  ) {
    return {
      title: "Gargalos operacionais travando a escala",
      summary:
        "Sua empresa já passou da fase inicial, mas o crescimento está esbarrando em execução, priorização e estrutura para sustentar a próxima etapa.",
    };
  }

  if (decisionMaking === "urgencia" || decisionMaking === "tentativa_erro" || solutionExperience === "interno") {
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
}

export function getPreferredExploreCategory(inferredArea: Area): ExploreCategory {
  if (inferredArea === "vendas") {
    return "Vendas";
  }

  if (inferredArea === "marketing") {
    return "Marketing & Growth";
  }

  if (inferredArea === "gestao") {
    return "Gestao & Estrategia";
  }

  if (inferredArea === "financeiro") {
    return "Financas";
  }

  return "Todos";
}

export function buildResultRecommendations({
  exploreItems,
  preferredExploreCategory,
  specialist,
}: ResultRecommendationsParams): ResultRecommendations {
  const primaryCategory = preferredExploreCategory === "Todos" ? "Gestao & Estrategia" : preferredExploreCategory;
  const exactSpecialistMatch = exploreItems.find((item) => item.name === specialist.name);

  const primary =
    exactSpecialistMatch ??
    ({
      id: `diag-${specialist.id}`,
      name: specialist.name,
      kind: "Consultor",
      category: primaryCategory,
      focus: specialist.focus,
      audience: "Empresas com cenário parecido com o seu diagnóstico",
      description: specialist.description,
      badge: "Recomendação principal",
    } satisfies ExploreItem);

  const secondary = exploreItems
    .filter((item) => item.id !== primary.id)
    .filter((item) => item.category === primaryCategory || item.kind === "Parceiro")
    .slice(0, 2);

  return { primary, secondary };
}
