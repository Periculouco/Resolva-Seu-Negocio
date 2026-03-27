import { FormEvent, useMemo, useState } from "react";

type Area = "vendas" | "marketing" | "gestao" | "financeiro";
type Timing = "imediato" | "30_dias" | "sem_pressa";

type Specialist = {
  id: string;
  name: string;
  title: string;
  focus: string;
  experience: string;
  city: string;
  description: string;
  bullets: string[];
  whatsapp: string;
};

type FormData = {
  challenge: string;
  segment: string;
  revenue: string;
  employees: string;
  area: Area;
  hasProcess: string;
  dependsOnReferral: string;
  hasPositioning: string;
  tracksChannel: string;
  hasRituals: string;
  hasCashControl: string;
  timing: Timing;
  name: string;
  email: string;
  phone: string;
  company: string;
};

const specialists: Record<Area, Specialist> = {
  vendas: {
    id: "consultor_vendas_1",
    name: "Marcos Tavares",
    title: "Especialista em Operacao Comercial",
    focus: "Estrutura times comerciais para previsibilidade de receita.",
    experience: "12 anos em B2B e servicos",
    city: "Atuacao nacional",
    description:
      "Organiza funil, metas e processo para empresas que vendem no improviso e dependem demais do fundador.",
    bullets: [
      "Implementacao de funil e playbook",
      "Ritmo de gestao comercial semanal",
      "Treinamento de prospeccao e follow-up",
    ],
    whatsapp: "https://wa.me/5585000000101",
  },
  marketing: {
    id: "consultor_marketing_1",
    name: "Camila Ferraz",
    title: "Estrategista de Marketing e Growth",
    focus: "Transforma marketing disperso em aquisicao consistente.",
    experience: "9 anos em growth e posicionamento",
    city: "Remoto para todo o Brasil",
    description:
      "Ajuda negocios a definir promessa, canais prioritarios e rotina de geracao de demanda com mensuracao.",
    bullets: [
      "Posicionamento e oferta principal",
      "Plano de conteudo e campanhas",
      "Leitura de CAC, CPL e conversao",
    ],
    whatsapp: "https://wa.me/5585000000102",
  },
  gestao: {
    id: "consultor_gestao_1",
    name: "Renata Mota",
    title: "Consultora em Gestao Empresarial",
    focus: "Cria clareza operacional e prioridade para escalar sem caos.",
    experience: "14 anos em operacoes e PMO",
    city: "Atendimento hibrido",
    description:
      "Estrutura rituais, indicadores e responsabilidades para empresas com operacao desorganizada e baixa execucao.",
    bullets: [
      "Rituais de gestao e acompanhamento",
      "Indicadores de operacao e dono por area",
      "Plano de acao para gargalos recorrentes",
    ],
    whatsapp: "https://wa.me/5585000000103",
  },
  financeiro: {
    id: "consultor_financeiro_1",
    name: "Eduardo Nery",
    title: "Especialista em Financas para PMEs",
    focus: "Dá visibilidade de caixa e margem para decisoes seguras.",
    experience: "11 anos em FP&A e reestruturacao financeira",
    city: "Atuacao nacional",
    description:
      "Resolve empresas sem previsao de caixa, precificacao confusa e baixa disciplina financeira.",
    bullets: [
      "Controle de caixa e projecao",
      "Analise de margem e precificacao",
      "Rotina financeira com indicadores-chave",
    ],
    whatsapp: "https://wa.me/5585000000104",
  },
};

const initialData: FormData = {
  challenge: "",
  segment: "",
  revenue: "",
  employees: "",
  area: "vendas",
  hasProcess: "",
  dependsOnReferral: "",
  hasPositioning: "",
  tracksChannel: "",
  hasRituals: "",
  hasCashControl: "",
  timing: "imediato",
  name: "",
  email: "",
  phone: "",
  company: "",
};

const refinementContent: Record<
  Area,
  {
    title: string;
    fields: {
      key: keyof FormData;
      label: string;
    }[];
  }
> = {
  vendas: {
    title: "Entender a operacao comercial",
    fields: [
      { key: "hasProcess", label: "Voce tem processo comercial estruturado?" },
      { key: "dependsOnReferral", label: "Hoje voce depende de indicacao para vender?" },
    ],
  },
  marketing: {
    title: "Entender sua aquisicao",
    fields: [
      { key: "hasPositioning", label: "Sua empresa tem posicionamento e oferta principal bem definidos?" },
      { key: "tracksChannel", label: "Voce acompanha resultado por canal de marketing?" },
    ],
  },
  gestao: {
    title: "Entender sua rotina de lideranca",
    fields: [
      { key: "hasRituals", label: "Existem rituais de acompanhamento com o time?" },
      { key: "hasProcess", label: "As responsabilidades estao documentadas em processos?" },
    ],
  },
  financeiro: {
    title: "Entender sua previsibilidade financeira",
    fields: [
      { key: "hasCashControl", label: "Voce tem fluxo de caixa atualizado semanalmente?" },
      { key: "hasProcess", label: "Sua precificacao segue um metodo claro?" },
    ],
  },
};

const quickChallenges = ["Aumentar vendas", "Melhorar marketing", "Organizar gestão"];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [screen, setScreen] = useState<"landing" | "quiz" | "result">("landing");
  const [formData, setFormData] = useState<FormData>(initialData);

  const specialist = specialists[formData.area];

  const diagnosis = useMemo(() => {
    if (formData.area === "vendas") {
      if (formData.hasProcess === "nao" && formData.dependsOnReferral === "sim") {
        return {
          title: "Falta de processo comercial previsivel",
          summary:
            "Sua empresa vende de forma reativa, com pouca previsibilidade e dependencia excessiva de indicacoes.",
        };
      }

      return {
        title: "Baixa consistencia no funil de vendas",
        summary:
          "Existe demanda comercial, mas falta rotina, acompanhamento e metodo para transformar oportunidades em receita recorrente.",
      };
    }

    if (formData.area === "marketing") {
      if (formData.hasPositioning === "nao" && formData.tracksChannel === "nao") {
        return {
          title: "Marketing sem foco e sem mensuracao",
          summary:
            "Sua empresa provavelmente investe energia em canais demais sem clareza de oferta, prioridade e retorno.",
        };
      }

      return {
        title: "Aquisicao sem escala",
        summary:
          "Ha esforco de marketing, mas falta um sistema claro para escalar captacao e entender o que realmente funciona.",
      };
    }

    if (formData.area === "gestao") {
      if (formData.hasRituals === "nao" && formData.hasProcess === "nao") {
        return {
          title: "Operacao dependente do dono",
          summary:
            "As decisoes e cobrancas ainda estao muito concentradas, o que reduz velocidade e gera retrabalho.",
        };
      }

      return {
        title: "Baixa cadencia de execucao",
        summary:
          "O time ate trabalha, mas falta ritmo de acompanhamento, clareza de prioridades e responsabilizacao.",
      };
    }

    if (formData.hasCashControl === "nao" && formData.hasProcess === "nao") {
      return {
        title: "Financeiro sem controle de caixa e margem",
        summary:
          "O negocio corre risco de crescer sem saber exatamente quanto sobra, o que compromete caixa e decisoes.",
      };
    }

    return {
      title: "Gestao financeira sem previsao",
      summary:
        "Existe alguma disciplina financeira, mas falta consolidar indicadores e rotina para previsibilidade de caixa.",
    };
  }, [formData]);

  const startDiagnosis = (challenge?: string) => {
    setFormData((previous) => ({ ...previous, challenge: challenge ?? previous.challenge }));
    setScreen("quiz");
    setCurrentStep(0);
  };

  const submitChallenge = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startDiagnosis();
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((step) => step + 1);
      return;
    }

    setScreen("result");
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
      return;
    }

    setScreen("landing");
  };

  const stepTitle = [
    "Contexto da empresa",
    "Qual area mais trava o crescimento?",
    refinementContent[formData.area].title,
    "Qual a urgencia?",
    "Para liberar sua recomendacao",
  ][currentStep];

  return (
    <div className="page-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">RSN</span>
          <div>
            <strong>Resolva Seu Negócio</strong>
            <span>Diagnóstico inteligente para PMEs</span>
          </div>
        </div>

        <nav className="nav">
          <a href="#como-funciona">Como funciona</a>
          <a href="#especialistas">Especialistas</a>
          <button className="ghost-button" onClick={() => startDiagnosis()}>
            Fazer diagnóstico
          </button>
        </nav>
      </header>

      {screen === "landing" && (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">Da dor ao especialista certo em poucos minutos</p>
              <h1>Descubra o problema central do seu negócio e receba a recomendação ideal.</h1>
              <p className="hero-text">
                Você responde um diagnóstico rápido e a plataforma indica o especialista mais
                aderente para destravar crescimento com velocidade.
              </p>

              <form className="challenge-card" onSubmit={submitChallenge}>
                <label htmlFor="challenge">Qual desafio você quer resolver?</label>
                <div className="challenge-row">
                  <input
                    id="challenge"
                    value={formData.challenge}
                    onChange={(event) => updateField("challenge", event.target.value)}
                    placeholder="Ex: meu time vende pouco e tudo depende de indicação"
                  />
                  <button className="primary-button" type="submit">
                    Fazer diagnóstico
                  </button>
                </div>

                <div className="tag-row">
                  {quickChallenges.map((challenge) => (
                    <button
                      className="tag"
                      key={challenge}
                      type="button"
                      onClick={() => startDiagnosis(challenge)}
                    >
                      {challenge}
                    </button>
                  ))}
                </div>
              </form>

              <div className="hero-metrics">
                <div>
                  <strong>5 min</strong>
                  <span>para concluir o diagnóstico</span>
                </div>
                <div>
                  <strong>1 match</strong>
                  <span>especialista recomendado por lead</span>
                </div>
                <div>
                  <strong>MVP lean</strong>
                  <span>curadoria manual no backstage</span>
                </div>
              </div>
            </div>

            <div className="hero-panel">
              <div className="panel-card panel-highlight">
                <span className="panel-label">Framework do MVP</span>
                <h2>Diagnóstico, recomendação e conversão.</h2>
                <p>
                  Em vez de abrir um marketplace caótico, o fluxo guia o empresário até o
                  especialista mais adequado com base em sinais simples e acionáveis.
                </p>
              </div>

              <div className="panel-grid">
                <article className="panel-card">
                  <span className="panel-label">Entrada</span>
                  <strong>Landing + busca de dor</strong>
                  <p>Captura contexto e intenção logo no primeiro clique.</p>
                </article>
                <article className="panel-card">
                  <span className="panel-label">Meio</span>
                  <strong>Quiz adaptativo</strong>
                  <p>Perguntas refinam a causa raiz por area crítica.</p>
                </article>
                <article className="panel-card">
                  <span className="panel-label">Saída</span>
                  <strong>Especialista único</strong>
                  <p>Foco na conversão, sem excesso de opções no MVP.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="section" id="como-funciona">
            <div className="section-heading">
              <p className="eyebrow">Estrutura mais enxuta para validar</p>
              <h2>Arquitetura recomendada para o MVP</h2>
            </div>

            <div className="insights-grid">
              <article className="insight-card">
                <strong>1. Comece sem perfil logado</strong>
                <p>
                  Para validar demanda, remova cadastro completo de empresário e especialista na
                  primeira versão. Deixe o lead entrar pelo diagnóstico e mantenha especialistas
                  como base curada no backoffice.
                </p>
              </article>
              <article className="insight-card">
                <strong>2. Troque marketplace por recomendação guiada</strong>
                <p>
                  O ganho aqui não é listar dezenas de consultores. É reduzir atrito e entregar
                  clareza para quem ainda não sabe qual ajuda contratar.
                </p>
              </article>
              <article className="insight-card">
                <strong>3. Faça operação manual por trás</strong>
                <p>
                  Match, qualificação e repasse podem ser parcialmente manuais no início. Isso
                  acelera lançamento e melhora aprendizado antes de automatizar.
                </p>
              </article>
            </div>
          </section>

          <section className="section" id="especialistas">
            <div className="section-heading">
              <p className="eyebrow">Base inicial de parceiros</p>
              <h2>Especialistas de entrada para o lançamento</h2>
            </div>

            <div className="specialist-grid">
              {Object.values(specialists).map((entry) => (
                <article className="specialist-card" key={entry.id}>
                  <div className="specialist-avatar">{entry.name.slice(0, 1)}</div>
                  <div>
                    <p className="specialist-role">{entry.title}</p>
                    <h3>{entry.name}</h3>
                    <p className="specialist-focus">{entry.focus}</p>
                  </div>
                  <ul>
                    {entry.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <a className="inline-link" href={entry.whatsapp} target="_blank" rel="noreferrer">
                    Falar no WhatsApp
                  </a>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {screen === "quiz" && (
        <main className="quiz-layout">
          <section className="quiz-card">
            <div className="quiz-progress">
              {[0, 1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={step <= currentStep ? "progress-dot active" : "progress-dot"}
                />
              ))}
            </div>

            <div className="quiz-header">
              <p className="eyebrow">Etapa {currentStep + 1} de 5</p>
              <h2>{stepTitle}</h2>
              <p>
                {formData.challenge
                  ? `Desafio inicial informado: "${formData.challenge}".`
                  : "Responda o suficiente para encontrarmos o especialista mais aderente."}
              </p>
            </div>

            {currentStep === 0 && (
              <div className="form-grid">
                <label>
                  Segmento
                  <input
                    value={formData.segment}
                    onChange={(event) => updateField("segment", event.target.value)}
                    placeholder="Ex: varejo, servicos, industria"
                  />
                </label>
                <label>
                  Faturamento mensal
                  <select
                    value={formData.revenue}
                    onChange={(event) => updateField("revenue", event.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="ate_50k">Até R$ 50 mil</option>
                    <option value="50k_200k">R$ 50 mil a R$ 200 mil</option>
                    <option value="200k_1m">R$ 200 mil a R$ 1 mi</option>
                    <option value="acima_1m">Acima de R$ 1 mi</option>
                  </select>
                </label>
                <label>
                  Numero de funcionarios
                  <select
                    value={formData.employees}
                    onChange={(event) => updateField("employees", event.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="1_5">1 a 5</option>
                    <option value="6_20">6 a 20</option>
                    <option value="21_50">21 a 50</option>
                    <option value="50_plus">Mais de 50</option>
                  </select>
                </label>
              </div>
            )}

            {currentStep === 1 && (
              <div className="choice-grid">
                {[
                  ["vendas", "Vendas"],
                  ["marketing", "Marketing"],
                  ["gestao", "Gestão"],
                  ["financeiro", "Financeiro"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={formData.area === value ? "choice-card selected" : "choice-card"}
                    type="button"
                    onClick={() => updateField("area", value as Area)}
                  >
                    <span>{label}</span>
                    <small>Refinar diagnóstico nesta frente</small>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-grid">
                {refinementContent[formData.area].fields.map((field) => (
                  <label key={field.key}>
                    {field.label}
                    <select
                      value={String(formData[field.key])}
                      onChange={(event) =>
                        updateField(field.key, event.target.value as FormData[typeof field.key])
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </select>
                  </label>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="choice-grid urgency-grid">
                {[
                  ["imediato", "Preciso resolver agora"],
                  ["30_dias", "Quero atacar nos próximos 30 dias"],
                  ["sem_pressa", "Quero mapear sem urgência"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={formData.timing === value ? "choice-card selected" : "choice-card"}
                    type="button"
                    onClick={() => updateField("timing", value as Timing)}
                  >
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 4 && (
              <div className="form-grid">
                <label>
                  Nome
                  <input
                    value={formData.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Seu nome"
                  />
                </label>
                <label>
                  Email
                  <input
                    value={formData.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="voce@empresa.com"
                    type="email"
                  />
                </label>
                <label>
                  Telefone
                  <input
                    value={formData.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="(85) 99999-9999"
                  />
                </label>
                <label>
                  Empresa
                  <input
                    value={formData.company}
                    onChange={(event) => updateField("company", event.target.value)}
                    placeholder="Nome da empresa"
                  />
                </label>
              </div>
            )}

            <div className="quiz-actions">
              <button className="ghost-button" type="button" onClick={previousStep}>
                Voltar
              </button>
              <button className="primary-button" type="button" onClick={nextStep}>
                {currentStep === 4 ? "Ver recomendação" : "Continuar"}
              </button>
            </div>
          </section>
        </main>
      )}

      {screen === "result" && (
        <main className="result-layout">
          <section className="result-card">
            <p className="eyebrow">Diagnóstico concluído</p>
            <h1>{diagnosis.title}</h1>
            <p className="result-summary">{diagnosis.summary}</p>

            <div className="result-grid">
              <article className="result-panel">
                <span className="panel-label">Especialista recomendado</span>
                <h2>{specialist.name}</h2>
                <p>{specialist.title}</p>
                <ul>
                  {specialist.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>

              <article className="result-panel">
                <span className="panel-label">Próximo passo</span>
                <p>
                  Pelo seu cenário, o melhor caminho é uma conversa orientada para entender causa
                  raiz, nível de urgência e plano de ataque inicial.
                </p>
                <p>
                  Lead: <strong>{formData.name || "Não informado"}</strong>
                </p>
                <p>
                  Empresa: <strong>{formData.company || "Não informada"}</strong>
                </p>
              </article>
            </div>

            <div className="result-actions">
              <a className="primary-button" href={specialist.whatsapp} target="_blank" rel="noreferrer">
                Falar com especialista
              </a>
              <button className="ghost-button" onClick={() => setScreen("landing")}>
                Refazer diagnóstico
              </button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
