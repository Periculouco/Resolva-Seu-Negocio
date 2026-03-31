import type {
  BusinessMoment,
  CurrentBottleneck,
  DecisionMaking,
  PrimaryGoal,
  RevenueProfile,
  SolutionExperience,
} from "../types/domain";

export const revenueProfileOptions: Array<{ value: RevenueProfile; label: string }> = [
  {
    value: "inconsistente",
    label: "Ainda estamos estruturando e faturamos de forma inconsistente, sem previsibilidade clara",
  },
  {
    value: "ate_30k",
    label: "Faturamos até R$30 mil/mês, mas com muita instabilidade e dificuldade de crescimento",
  },
  {
    value: "30k_100k",
    label: "Entre R$30 mil e R$100 mil/mês, com operação ativa, mas ainda desorganizada",
  },
  {
    value: "100k_300k",
    label: "Entre R$100 mil e R$300 mil/mês, com crescimento, mas enfrentando gargalos operacionais",
  },
  {
    value: "300k_1m",
    label: "Entre R$300 mil e R$1 milhão/mês, com estrutura montada, mas buscando escala",
  },
  {
    value: "acima_1m",
    label: "Acima de R$1 milhão/mês, com operação sólida e foco em otimização e crescimento estratégico",
  },
];

export const businessMomentOptions: Array<{ value: BusinessMoment; label: string }> = [
  {
    value: "comecando",
    label: "Estamos começando e ainda tentando entender como estruturar o negócio da forma correta",
  },
  {
    value: "validado_desorganizado",
    label: "Já validamos o negócio, mas enfrentamos dificuldades para organizar e crescer de forma consistente",
  },
  {
    value: "patinando",
    label: "A empresa funciona, mas sentimos que estamos patinando e não conseguimos avançar como gostaríamos",
  },
  {
    value: "crescendo_sem_prioridade",
    label: "Estamos crescendo, mas com vários problemas surgindo ao mesmo tempo e sem clareza de prioridade",
  },
  {
    value: "estruturada_subperformando",
    label: "Temos uma operação estruturada, mas sabemos que poderíamos performar muito mais",
  },
  {
    value: "escalando_com_seguranca",
    label: "Estamos em fase de crescimento e buscamos otimizar decisões para escalar com segurança",
  },
];

export const decisionMakingOptions: Array<{ value: DecisionMaking; label: string }> = [
  {
    value: "urgencia",
    label: "As decisões são tomadas no dia a dia, mais por urgência do que por planejamento",
  },
  {
    value: "tentativa_erro",
    label: "Decidimos com base em tentativa e erro, testando várias coisas sem muita direção clara",
  },
  {
    value: "alguma_estrategia",
    label: "Algumas decisões são estratégicas, mas ainda existe muita incerteza no processo",
  },
  {
    value: "organizacao_sem_clareza",
    label: "Já temos certa organização, mas nem sempre temos clareza total sobre o melhor caminho",
  },
  {
    value: "dados_sem_direcao_externa",
    label: "As decisões são baseadas em dados e planejamento, mas ainda sentimos falta de direcionamento externo",
  },
  {
    value: "processo_refinando",
    label: "Temos um processo estruturado de decisão, mas buscamos refinar e melhorar constantemente",
  },
];

export const currentBottleneckOptions: Array<{ value: CurrentBottleneck; label: string }> = [
  {
    value: "varios_sem_ordem",
    label: "Temos vários problemas ao mesmo tempo e dificuldade para entender por onde começar",
  },
  {
    value: "falhas_sem_identificar",
    label: "Sabemos que existem falhas, mas não conseguimos identificar exatamente o que está travando o crescimento",
  },
  {
    value: "problema_sem_solucao",
    label: "Já identificamos alguns problemas, mas não sabemos qual solução é a mais adequada",
  },
  {
    value: "solucoes_sem_resultado",
    label: "Tentamos resolver, mas as soluções aplicadas não trazem o resultado esperado",
  },
  {
    value: "clareza_parcial_execucao",
    label: "Temos clareza parcial dos problemas, mas falta execução ou parceiros certos",
  },
  {
    value: "clareza_busca_eficiencia",
    label: "Sabemos exatamente onde estão os gargalos e buscamos soluções mais eficientes para resolver",
  },
];

export const solutionExperienceOptions: Array<{ value: SolutionExperience; label: string }> = [
  {
    value: "interno",
    label: "Ainda não buscamos ajuda externa e tentamos resolver tudo internamente",
  },
  {
    value: "sem_criterio",
    label: "Já buscamos algumas soluções, mas sem muito critério ou estratégia",
  },
  {
    value: "sem_consistencia",
    label: "Testamos diferentes serviços ou ferramentas, mas sem resultados consistentes",
  },
  {
    value: "sem_adequacao",
    label: "Já investimos em soluções, mas sentimos que não eram adequadas para o nosso momento",
  },
  {
    value: "boas_sem_continuidade",
    label: "Tivemos boas experiências, mas ainda não encontramos um modelo contínuo de evolução",
  },
  {
    value: "estrategicas_evoluir",
    label: "Já utilizamos soluções estratégicas e buscamos evoluir ainda mais o negócio",
  },
];

export const primaryGoalOptions: Array<{ value: PrimaryGoal; label: string }> = [
  {
    value: "sair_caos",
    label: "Organizar o negócio e sair do caos operacional atual",
  },
  {
    value: "controle_operacao",
    label: "Estruturar melhor processos e ter mais controle da operação",
  },
  {
    value: "aumentar_previsibilidade",
    label: "Aumentar faturamento com mais previsibilidade",
  },
  {
    value: "corrigir_gargalos",
    label: "Corrigir gargalos que estão travando o crescimento",
  },
  {
    value: "escalar_sustentavel",
    label: "Escalar o negócio de forma estruturada e sustentável",
  },
  {
    value: "otimizar_existente",
    label: "Otimizar uma operação já existente para crescer com mais eficiência",
  },
];
