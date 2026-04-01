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
import { trackEvent } from "./lib/repositories/eventsRepository";
import { createLead } from "./lib/repositories/leadsRepository";
import { ConsultorScreen } from "./features/consultor/ConsultorScreen";
import { ExploreScreen } from "./features/explore/ExploreScreen";
import { LandingScreen } from "./features/landing/LandingScreen";
import { QuizScreen } from "./features/quiz/QuizScreen";
import { ResultScreen } from "./features/result/ResultScreen";
import { ContactModal } from "./features/shared/ContactModal";

import type {
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
  const [contactRequestError, setContactRequestError] = useState<string | null>(null);
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
    void trackEvent({
      event_name: "diagnosis_started",
      screen: "landing",
      metadata: {
        has_challenge: Boolean(challenge ?? formData.challenge),
      },
    });
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

  const openExplore = () => {
    setIsPersonalizedExplore(false);
    setExploreQuery("");
    setActiveExploreCategory("Todos");
    setScreen("explore");
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

    void trackEvent({
      event_name: "quiz_step_completed",
      screen: "quiz",
      metadata: {
        step: currentStep + 1,
      },
    });

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
      void trackEvent({
        event_name: "diagnosis_completed",
        screen: "loading",
        metadata: {
          inferred_area: inferredArea,
          recommended_category: preferredExploreCategory,
        },
      });
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
    setContactRequestError(null);
    void trackEvent({
      event_name: "contact_modal_opened",
      screen: "result",
      metadata: {
        specialist_name: target.name,
      },
    });
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setContactRequestError(null);
    setIsContactModalOpen(false);
  };

  const toPartnerInstanceSlug = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const submitContactRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contactTarget) {
      return;
    }

    const primaryGoalLabel = findOptionLabel(primaryGoalOptions, formData.primaryGoal);
    const currentBottleneckLabel = findOptionLabel(currentBottleneckOptions, formData.currentBottleneck);
    const leadResult = await createLead({
      partner_instance_slug: toPartnerInstanceSlug(contactTarget.name),
      company: null,
      contact_name: formData.name,
      contact_email: formData.email,
      contact_phone: formData.phone,
      contact_role: formData.role,
      challenge: formData.challenge,
      main_pain: formData.mainPain,
      diagnosis_title: diagnosis.title,
      diagnosis_summary: diagnosis.summary,
      inferred_area: inferredArea,
      recommended_category: resultRecommendations.primary.category,
      recommended_specialist_name: specialist.name,
      primary_goal_label: primaryGoalLabel || null,
      current_bottleneck_label: currentBottleneckLabel || null,
      source_screen: "result_modal",
      status: "Novo",
    });

    if (!leadResult.success) {
      void trackEvent({
        event_name: "lead_submit_error",
        screen: "result_modal",
        metadata: {
          specialist_name: contactTarget.name,
        },
      });
      setContactRequestError("Não conseguimos salvar seu contato agora. Tente novamente em instantes.");
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
    void trackEvent({
      event_name: "lead_submit_success",
      screen: "result_modal",
      metadata: {
        lead_id: leadResult.data.id,
        specialist_name: contactTarget.name,
      },
    });
    setContactRequestError(null);
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
    void trackEvent({
      event_name: "whatsapp_opened",
      screen: "result",
      metadata: {
        specialist_name: specialist.name,
        has_unlocked_whatsapp: hasUnlockedWhatsapp,
      },
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleConsultantLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConsultantAuthenticated(true);
    setConsultantSection("dashboard");
  };

  const handleConsultantLogout = () => {
    setConsultantAuthenticated(false);
  };

  const handleViewAllRecommendations = () => {
    setIsPersonalizedExplore(true);
    setScreen("explore");
  };

  const handleContactModalOpen = () => {
    openContactModal({
      name: specialist.name,
      title: specialist.title,
      whatsapp: specialist.whatsapp,
    });
  };

  const quizOptions = {
    revenueProfileOptions,
    businessMomentOptions,
    decisionMakingOptions,
    currentBottleneckOptions,
    solutionExperienceOptions,
    primaryGoalOptions,
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
            onClick={openExplore}
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
        <ExploreScreen
          activeExploreCategory={activeExploreCategory}
          setActiveExploreCategory={setActiveExploreCategory}
          exploreQuery={exploreQuery}
          setExploreQuery={setExploreQuery}
          isPersonalizedExplore={isPersonalizedExplore}
          filteredExploreItems={filteredExploreItems}
          recommendedExploreId={recommendedExploreId}
          exploreCategories={exploreCategories}
          formatCategoryLabel={formatCategoryLabel}
          onStartDiagnosis={startDiagnosis}
        />
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
        <QuizScreen
          currentStep={currentStep}
          formData={formData}
          stepTitle={stepTitle}
          canContinue={canContinue}
          options={quizOptions}
          onUpdateField={updateField}
          onPreviousStep={previousStep}
          onNextStep={nextStep}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          diagnosis={diagnosis}
          resultRecommendations={resultRecommendations}
          formData={formData}
          specialist={specialist}
          hasUnlockedWhatsapp={hasUnlockedWhatsapp}
          primaryGoalLabel={findOptionLabel(primaryGoalOptions, formData.primaryGoal)}
          businessMomentLabel={findOptionLabel(businessMomentOptions, formData.businessMoment)}
          formatCategoryLabel={formatCategoryLabel}
          onOpenContactModal={handleContactModalOpen}
          onOpenWhatsAppDirect={openWhatsAppDirect}
          onGoHome={goHome}
          onViewAllRecommendations={handleViewAllRecommendations}
          onOpenExploreCategory={openExploreCategory}
        />
      )}

      {screen === "consultor" && (
        <ConsultorScreen
          consultantAuthenticated={consultantAuthenticated}
          consultantSection={consultantSection}
          consultantForm={consultantForm}
          consultantStats={consultantStats}
          consultantLeads={consultantLeads}
          consultantAgenda={consultantAgenda}
          toStatusClassName={toStatusClassName}
          onConsultantLogin={handleConsultantLogin}
          onConsultantLogout={handleConsultantLogout}
          onConsultantSectionChange={setConsultantSection}
          onConsultantEmailChange={(event) =>
            setConsultantForm((previous) => ({ ...previous, email: event.target.value }))
          }
          onConsultantPasswordChange={(event) =>
            setConsultantForm((previous) => ({ ...previous, password: event.target.value }))
          }
          onConsultantInstanceChange={(event) =>
            setConsultantForm((previous) => ({ ...previous, instance: event.target.value }))
          }
        />
      )}

      <ContactModal
        isOpen={isContactModalOpen}
        contactTarget={contactTarget}
        formData={formData}
        errorMessage={contactRequestError}
        onClose={closeContactModal}
        onSubmit={submitContactRequest}
        onUpdateField={updateField}
      />
    </div>
  );
}

export default App;
