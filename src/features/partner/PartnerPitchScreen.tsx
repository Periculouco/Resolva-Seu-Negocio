import { useMemo, useState } from "react";
import type { ChangeEventHandler, FormEvent, MouseEventHandler } from "react";

type BillingCycle = "Mensal" | "Anual";

type PartnerPlan = {
  slug: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  annualFootnote: string;
  savings: string;
  cta: string;
  bullets: string[];
};

type PartnerPitchScreenProps = {
  themeMode: "light" | "dark";
  onGoBack: () => void;
  onOpenConsultantArea: () => void;
  onSubmitApplication: (payload: {
    partnerName: string;
    partnerEmail: string;
    partnerSpecialty: string;
    partnerPortfolioUrl: string;
    planSlug: string;
    billingCycle: "Mensal" | "Anual" | "Enterprise";
  }) => Promise<{
    success: boolean;
    error?: string | null;
  }>;
};

const fixedPlans: PartnerPlan[] = [
  {
    slug: "essential",
    name: "Essential",
    monthlyPrice: "R$297",
    annualPrice: "R$2.970",
    annualFootnote: "cobrança anual",
    savings: "Economize R$594 por ano",
    cta: "Selecionar Essential",
    bullets: [
      "Perfil validado na rede",
      "Até 15 leads qualificados por mês",
      "Presença base nas recomendações",
      "Pipeline comercial com CRM",
      "Contato via WhatsApp e histórico",
      "Ideal para operação em validação",
    ],
  },
  {
    slug: "plus",
    name: "Plus",
    monthlyPrice: "R$697",
    annualPrice: "R$6.970",
    annualFootnote: "cobrança anual",
    savings: "Economize R$1.394 por ano",
    cta: "Selecionar Plus",
    bullets: [
      "Maior prioridade nas recomendações",
      "Até 40 leads qualificados por mês",
      "Leads com contexto completo do quiz",
      "Atividades, deal page e histórico",
      "Mais espaço para o time comercial",
      "Ideal para operação em crescimento",
    ],
  },
  {
    slug: "premium",
    name: "Premium",
    monthlyPrice: "R$1.490",
    annualPrice: "R$14.900",
    annualFootnote: "cobrança anual",
    savings: "Economize R$2.980 por ano",
    cta: "Selecionar Premium",
    bullets: [
      "Prioridade máxima de matching",
      "Até 90 leads qualificados por mês",
      "Distribuição reforçada por especialidade",
      "Mais inteligência comercial na operação",
      "Acompanhamento tático do time Resolva",
      "Fila preferencial de novos diagnósticos",
      "Para meta agressiva de aquisição",
    ],
  },
];

const enterprisePlan = {
  slug: "enterprise",
  name: "Enterprise",
  price: "Personalizado",
  footnote: "escopo variável",
  savings: "Projeto sob medida para posicionamento e demanda",
  cta: "Falar com o time",
  bullets: [
    "Diagnóstico da operação do parceiro",
    "Posicionamento e distribuição sob medida",
    "Demanda calibrada por especialidade",
    "Modelo variável conforme necessidade",
    "Atuação conjunta com o time comercial",
    "Indicado para operações enterprise",
  ],
};

export function PartnerPitchScreen({
  themeMode,
  onGoBack,
  onOpenConsultantArea,
  onSubmitApplication,
}: PartnerPitchScreenProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Mensal");
  const [selectedPlanSlug, setSelectedPlanSlug] = useState("plus");
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    partnerName: "",
    partnerEmail: "",
    partnerSpecialty: "",
    partnerPortfolioUrl: "",
  });

  const selectedFixedPlan = useMemo(
    () => fixedPlans.find((plan) => plan.slug === selectedPlanSlug) ?? fixedPlans[1],
    [selectedPlanSlug],
  );

  const selectedPlan = selectedPlanSlug === "enterprise" ? enterprisePlan : selectedFixedPlan;

  const selectedPlanPriceLabel =
    selectedPlanSlug === "enterprise"
      ? "Personalizado"
      : billingCycle === "Mensal"
        ? selectedFixedPlan.monthlyPrice
        : selectedFixedPlan.annualPrice;

  const stopPropagation: MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();
  };

  const handleFieldChange =
    (field: keyof typeof formData): ChangeEventHandler<HTMLInputElement> =>
    (event) => {
      setSubmitError(null);
      setSubmitSuccess(null);
      setFormData((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.partnerName.trim() || !formData.partnerEmail.trim() || !formData.partnerSpecialty.trim()) {
      setSubmitError("Preencha nome, email e especialidade para seguir.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await onSubmitApplication({
      partnerName: formData.partnerName.trim(),
      partnerEmail: formData.partnerEmail.trim(),
      partnerSpecialty: formData.partnerSpecialty.trim(),
      partnerPortfolioUrl: formData.partnerPortfolioUrl.trim(),
      planSlug: selectedPlanSlug,
      billingCycle: selectedPlanSlug === "enterprise" ? "Enterprise" : billingCycle,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error ?? "Não foi possível registrar seu interesse agora.");
      return;
    }

    setSubmitSuccess("Aplicação registrada. Nosso time vai analisar seu perfil e entrar em contato.");
    setFormData({
      partnerName: "",
      partnerEmail: "",
      partnerSpecialty: "",
      partnerPortfolioUrl: "",
    });
    setIsApplicationModalOpen(false);
  };

  return (
    <main className={`partner-pitch-shell partner-pitch-shell-${themeMode}`}>
      <section className="partner-pricing-intro">
        <div className="partner-pricing-intro-copy">
          <p className="section-kicker">Planos para parceiros</p>
          <h1>Entre para a rede que conecta especialistas a empresas com demanda real.</h1>
          <p>
            Escolha o modelo de entrada da sua operação. Os planos fixos atendem parceiros com oferta clara. O plano
            enterprise serve para operações que precisam de posicionamento, demanda e entrega sob medida.
          </p>
        </div>

        <div className="partner-pricing-intro-actions">
          <button className="ghost-button partner-secondary-cta" type="button" onClick={onGoBack}>
            Voltar para o site
          </button>
          <button className="ghost-button partner-secondary-cta" type="button" onClick={onOpenConsultantArea}>
            Ver área do parceiro
          </button>
        </div>
      </section>

      <section className="partner-pricing-surface">
        <div className="partner-pricing-header">
          <div className="partner-pricing-header-copy">
            <h2>Escolha o plano que acompanha o ritmo da sua operação</h2>
            <p>
              Compare os formatos de entrada da rede e selecione o plano mais aderente ao momento comercial do seu
              parceiro.
            </p>
          </div>

          <div className="partner-pricing-highlight">
            <span>{selectedPlanSlug === "enterprise" ? "Plano consultivo" : "Entrada validada"}</span>
            <strong>
              {selectedPlanPriceLabel}
            </strong>
            <small>
              {selectedPlanSlug === "enterprise"
                ? "Escopo comercial variável"
                : billingCycle === "Mensal"
                  ? "cobrança mensal"
                  : "cobrança anual"}
            </small>
          </div>
        </div>

        <div className="partner-pricing-hero">
          <div className="partner-pricing-hero-backdrop" />
          <div className="partner-pricing-hero-copy">
            <h3>Planos para todos os níveis de ambição</h3>
            <div className="partner-billing-toggle" role="tablist" aria-label="Ciclo de cobrança">
              <button
                className={billingCycle === "Mensal" ? "active" : ""}
                type="button"
                onClick={() => setBillingCycle("Mensal")}
              >
                Mensal
              </button>
              <button
                className={billingCycle === "Anual" ? "active" : ""}
                type="button"
                onClick={() => setBillingCycle("Anual")}
              >
                Anual
              </button>
            </div>
          </div>

          <div className="partner-pricing-grid">
            {fixedPlans.map((plan) => {
              const isSelected = selectedPlanSlug === plan.slug;
              const price = billingCycle === "Mensal" ? plan.monthlyPrice : plan.annualPrice;

              return (
                <article
                  className={isSelected ? "partner-pricing-card active" : "partner-pricing-card"}
                  key={plan.slug}
                  onClick={() => setSelectedPlanSlug(plan.slug)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPlanSlug(plan.slug);
                    }
                  }}
                >
                  <div className="partner-pricing-card-top">
                    <strong>{plan.name}</strong>
                  </div>
                  <div className="partner-pricing-card-price">
                    <span>{price}</span>
                    <small>{billingCycle === "Mensal" ? "/mês" : "/ano"}</small>
                  </div>
                  <p className="partner-pricing-card-footnote">{plan.annualFootnote}</p>
                  <p className="partner-pricing-card-savings">{plan.savings}</p>
                  <button
                    className="partner-pricing-card-cta"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedPlanSlug(plan.slug);
                      setSubmitError(null);
                      setSubmitSuccess(null);
                      setIsApplicationModalOpen(true);
                    }}
                  >
                    {plan.cta}
                  </button>
                  <ul>
                    {plan.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </article>
              );
            })}

            <article
              className={
                selectedPlanSlug === "enterprise"
                  ? "partner-pricing-card partner-pricing-card-enterprise active"
                  : "partner-pricing-card partner-pricing-card-enterprise"
              }
              onClick={() => setSelectedPlanSlug("enterprise")}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedPlanSlug("enterprise");
                }
              }}
            >
              <div className="partner-pricing-card-top">
                <strong>{enterprisePlan.name}</strong>
              </div>
              <div className="partner-pricing-card-price">
                <span>{enterprisePlan.price}</span>
                <small>{enterprisePlan.footnote}</small>
              </div>
              <p className="partner-pricing-card-footnote">modelo consultivo</p>
              <p className="partner-pricing-card-savings">{enterprisePlan.savings}</p>
              <button
                className="partner-pricing-card-cta"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedPlanSlug("enterprise");
                  setSubmitError(null);
                  setSubmitSuccess(null);
                  setIsApplicationModalOpen(true);
                }}
              >
                {enterprisePlan.cta}
              </button>
              <ul>
                {enterprisePlan.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {isApplicationModalOpen ? (
        <div className="modal-overlay" role="presentation" onClick={() => setIsApplicationModalOpen(false)}>
          <section
            className={`contact-modal partner-application-modal partner-application-modal-${themeMode}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-application-title"
            onClick={stopPropagation}
          >
            <div className="contact-modal-header partner-application-modal-header">
              <div className="partner-application-copy">
                <p className="section-kicker">Aplicação do parceiro</p>
                <h2 id="partner-application-title">Enviar aplicação</h2>
                <p>
                  Preencha os dados do parceiro para o time da Resolva validar aderência e seguir com a formalização.
                </p>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setIsApplicationModalOpen(false)}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <div className="partner-application-modal-layout">
              <form className="partner-pitch-form" onSubmit={handleSubmit}>
                <div className="partner-pitch-summary partner-pitch-summary-compact">
                  <span>Plano</span>
                  <strong>{selectedPlan.name}</strong>
                  <small>
                    {selectedPlanSlug === "enterprise"
                      ? "Projeto customizado"
                      : `${selectedPlanPriceLabel} • ${billingCycle}`}
                  </small>
                </div>

                <label>
                  Nome
                  <input
                    value={formData.partnerName}
                    onChange={handleFieldChange("partnerName")}
                    placeholder="Seu nome ou empresa"
                  />
                </label>
                <label>
                  E-mail
                  <input
                    type="email"
                    value={formData.partnerEmail}
                    onChange={handleFieldChange("partnerEmail")}
                    placeholder="voce@empresa.com"
                  />
                </label>
                <label>
                  Especialidade
                  <input
                    value={formData.partnerSpecialty}
                    onChange={handleFieldChange("partnerSpecialty")}
                    placeholder="Ex: operação comercial, jurídico B2B, performance"
                  />
                </label>
                <label>
                  LinkedIn ou portfólio
                  <input
                    value={formData.partnerPortfolioUrl}
                    onChange={handleFieldChange("partnerPortfolioUrl")}
                    placeholder="https://linkedin.com/in/... ou site"
                  />
                </label>

                {submitError ? <p className="partner-pitch-feedback error">{submitError}</p> : null}
                {submitSuccess ? <p className="partner-pitch-feedback success">{submitSuccess}</p> : null}

                <div className="partner-application-modal-actions">
                  <button className="ghost-button" type="button" onClick={() => setIsApplicationModalOpen(false)}>
                    Cancelar
                  </button>
                  <button className="gold-button" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar aplicação"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
