import { useMemo, useState } from "react";
import type { ChangeEventHandler, FormEvent } from "react";

type BillingCycle = "Mensal" | "Anual";

type PartnerPlan = {
  slug: string;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  badge?: string;
  description: string;
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
    slug: "starter",
    name: "Starter",
    monthlyPrice: "R$ 297",
    annualPrice: "R$ 2.970",
    description: "Para especialistas que querem começar com presença, posicionamento e primeiros leads.",
    bullets: ["Perfil validado na rede", "Presença nas recomendações da plataforma", "Até 15 leads qualificados por mês"],
  },
  {
    slug: "growth",
    name: "Growth",
    monthlyPrice: "R$ 697",
    annualPrice: "R$ 6.970",
    badge: "Mais procurado",
    description: "Para parceiros que querem previsibilidade comercial com volume maior e prioridade de exposição.",
    bullets: ["Prioridade nas recomendações", "Volume ampliado de leads", "Dashboard comercial completo"],
  },
  {
    slug: "scale",
    name: "Scale",
    monthlyPrice: "R$ 1.490",
    annualPrice: "R$ 14.900",
    description: "Para operações que já fecham bem e querem transformar a rede em canal recorrente de aquisição.",
    bullets: ["Maior prioridade de matching", "Leads com contexto ampliado", "Suporte tático de operação comercial"],
  },
];

export function PartnerPitchScreen({
  themeMode,
  onGoBack,
  onOpenConsultantArea,
  onSubmitApplication,
}: PartnerPitchScreenProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Mensal");
  const [selectedPlanSlug, setSelectedPlanSlug] = useState("growth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    partnerName: "",
    partnerEmail: "",
    partnerSpecialty: "",
    partnerPortfolioUrl: "",
  });

  const selectedPlan =
    fixedPlans.find((plan) => plan.slug === selectedPlanSlug) ?? fixedPlans[0];

  const currentPrice = useMemo(() => {
    if (selectedPlanSlug === "enterprise") {
      return "Sob consulta";
    }

    return billingCycle === "Mensal" ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;
  }, [billingCycle, selectedPlan, selectedPlanSlug]);

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

    setSubmitSuccess("Interesse registrado. Nosso time vai analisar seu perfil e entrar em contato.");
    setFormData({
      partnerName: "",
      partnerEmail: "",
      partnerSpecialty: "",
      partnerPortfolioUrl: "",
    });
  };

  return (
    <main className={`partner-pitch-shell partner-pitch-shell-${themeMode}`}>
      <section className="partner-pitch-hero">
        <div className="partner-pitch-copy">
          <p className="section-kicker">Planos para parceiros</p>
          <h1>Entre para a rede que conecta especialistas a empresas com demanda real.</h1>
          <p>
            Escolha o modelo de entrada da sua operação. Os planos fixos atendem parceiros com oferta clara. O plano
            enterprise serve para operações que precisam de posicionamento, demanda e entrega sob medida.
          </p>

          <div className="partner-pitch-actions">
            <button className="gold-button" type="button" onClick={onGoBack}>
              Voltar para o site
            </button>
            <button className="ghost-button partner-secondary-cta" type="button" onClick={onOpenConsultantArea}>
              Ver área do parceiro
            </button>
          </div>
        </div>

        <div className="partner-pitch-highlight">
          <span>Entrada validada</span>
          <strong>{currentPrice}</strong>
          <small>
            {selectedPlanSlug === "enterprise"
              ? "Plano variável conforme necessidade comercial."
              : billingCycle === "Mensal"
                ? "cobrança mensal"
                : "cobrança anual"}
          </small>
        </div>
      </section>

      <section className="partner-pitch-plans">
        <div className="partner-pitch-heading">
          <h2>Planos para diferentes níveis de ambição comercial</h2>
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

        <div className="partner-plan-grid">
          {fixedPlans.map((plan) => {
            const isSelected = selectedPlanSlug === plan.slug;
            const price = billingCycle === "Mensal" ? plan.monthlyPrice : plan.annualPrice;

            return (
              <button
                className={isSelected ? "partner-plan-card active" : "partner-plan-card"}
                key={plan.slug}
                type="button"
                onClick={() => setSelectedPlanSlug(plan.slug)}
              >
                <div className="partner-plan-head">
                  <strong>{plan.name}</strong>
                  {plan.badge ? <span>{plan.badge}</span> : null}
                </div>
                <div className="partner-plan-price">
                  <strong>{price}</strong>
                  <small>{billingCycle === "Mensal" ? "/mês" : "/ano"}</small>
                </div>
                <p>{plan.description}</p>
                <ul>
                  {plan.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </button>
            );
          })}

          <button
            className={selectedPlanSlug === "enterprise" ? "partner-plan-card active enterprise" : "partner-plan-card enterprise"}
            type="button"
            onClick={() => setSelectedPlanSlug("enterprise")}
          >
            <div className="partner-plan-head">
              <strong>Enterprise</strong>
              <span>Custom</span>
            </div>
            <div className="partner-plan-price">
              <strong>Sob consulta</strong>
              <small>escopo variável</small>
            </div>
            <p>Para operações que precisam de posicionamento, geração de demanda e entrega alinhada ao momento do parceiro.</p>
            <ul>
              <li>Diagnóstico comercial do parceiro</li>
              <li>Posicionamento e distribuição de demanda sob medida</li>
              <li>Modelo variável conforme especialidade e operação</li>
            </ul>
          </button>
        </div>
      </section>

      <section className="partner-pitch-form-section">
        <div className="partner-pitch-form-copy">
          <p className="section-kicker">Aplicação do parceiro</p>
          <h2>Deixe seus dados e o time valida seu fit com a rede.</h2>
          <p>
            A maioria dos leads entra de forma automática pelo diagnóstico. Aqui a gente valida se sua especialidade,
            posicionamento e capacidade de entrega combinam com a demanda que a plataforma distribui.
          </p>

          <div className="partner-pitch-summary">
            <span>Plano selecionado</span>
            <strong>{selectedPlanSlug === "enterprise" ? "Enterprise" : selectedPlan.name}</strong>
            <small>
              {selectedPlanSlug === "enterprise"
                ? "Escopo consultivo e comercial variável"
                : `${currentPrice} • ${billingCycle}`}
            </small>
          </div>
        </div>

        <form className="partner-pitch-form" onSubmit={handleSubmit}>
          <label>
            Nome do parceiro
            <input value={formData.partnerName} onChange={handleFieldChange("partnerName")} placeholder="Seu nome ou da empresa" />
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
              placeholder="https://linkedin.com/in/... ou site/portfólio"
            />
          </label>

          {submitError ? <p className="partner-pitch-feedback error">{submitError}</p> : null}
          {submitSuccess ? <p className="partner-pitch-feedback success">{submitSuccess}</p> : null}

          <button className="gold-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Quero entrar na rede"}
          </button>
        </form>
      </section>
    </main>
  );
}
