import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  categories,
  consultantAgenda,
  consultantLeads,
  diagnosisSignals,
  ecosystemLogos,
  exploreCategories,
  exploreItems,
  featuredPartners,
  howItWorks,
  initialData,
  numbers,
  quickChallenges,
  specialists,
  successSignals,
} from "./data/catalogs";
import {
  businessMomentOptions,
  currentBottleneckOptions,
  decisionMakingOptions,
  primaryGoalOptions,
  revenueProfileOptions,
  solutionExperienceOptions,
} from "./data/quizOptions";
import {
  buildDiagnosis,
  buildResultRecommendations,
  getPreferredExploreCategory,
  inferArea,
} from "./lib/diagnosis";
import { findOptionLabel, formatCategoryLabel, toStatusClassName } from "./lib/formatters";
import { LandingScreen } from "./features/landing/LandingScreen";
import type {
  ConsultantAgendaItem,
  ConsultantLead,
  ConsultantSection,
  ContactTarget,
  FormData,
  Screen,
  SignalItem,
} from "./types/domain";

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

  const inferredArea = useMemo(
    () => inferArea(formData),
    [formData],
  );

  const specialist = specialists[inferredArea];

  const diagnosis = useMemo(
    () =>
      buildDiagnosis({
        ...formData,
        inferredArea,
        normalizedChallenge,
      }),
    [formData, inferredArea, normalizedChallenge],
  );

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

  const preferredExploreCategory = useMemo(() => getPreferredExploreCategory(inferredArea), [inferredArea]);

  const resultRecommendations = useMemo(
    () =>
      buildResultRecommendations({
        exploreItems,
        preferredExploreCategory,
        specialist,
      }),
    [preferredExploreCategory, specialist],
  );

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
        <LandingScreen
          challenge={formData.challenge}
          quickChallenges={quickChallenges}
          ecosystemLogos={ecosystemLogos}
          numbers={numbers}
          diagnosisSignals={diagnosisSignals}
          successSignals={successSignals}
          featuredPartners={featuredPartners}
          categories={categories}
          howItWorks={howItWorks}
          exploreItems={exploreItems}
          onChallengeChange={(event) => updateField("challenge", event.target.value)}
          onSubmitChallenge={submitChallenge}
          onStartDiagnosis={startDiagnosis}
          onOpenExploreCategory={openExploreCategory}
          onOpenConsultantArea={openConsultantArea}
          AnimatedSignalList={AnimatedSignalList}
          AnimatedNumber={AnimatedNumber}
        />
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
