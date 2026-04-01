import type { ExploreItem, FormData, Specialist } from "../../types/domain";

type Diagnosis = {
  title: string;
  summary: string;
};

type ResultRecommendations = {
  primary: ExploreItem;
  secondary: ExploreItem[];
};

type ResultScreenProps = {
  diagnosis: Diagnosis;
  resultRecommendations: ResultRecommendations;
  formData: FormData;
  specialist: Specialist;
  hasUnlockedWhatsapp: boolean;
  primaryGoalLabel: string;
  businessMomentLabel: string;
  formatCategoryLabel: (label: string) => string;
  onOpenContactModal: () => void;
  onOpenWhatsAppDirect: () => void;
  onGoHome: () => void;
  onViewAllRecommendations: () => void;
  onOpenExploreCategory: (category: string) => void;
};

export function ResultScreen({
  diagnosis,
  resultRecommendations,
  specialist,
  hasUnlockedWhatsapp,
  primaryGoalLabel,
  businessMomentLabel,
  formatCategoryLabel,
  onOpenContactModal,
  onOpenWhatsAppDirect,
  onGoHome,
  onViewAllRecommendations,
  onOpenExploreCategory,
}: ResultScreenProps) {
  return (
    <main className="result-layout">
      <section className="result-card">
        <p className="section-kicker">Diagnóstico concluído</p>
        <h1>{diagnosis.title}</h1>
        <p className="result-summary">{diagnosis.summary}</p>

        <div className="result-diagnosis-strip">
          <div className="result-diagnosis-chip">
            <span>Objetivo principal</span>
            <strong>{primaryGoalLabel}</strong>
          </div>
          <div className="result-diagnosis-chip">
            <span>Momento do negócio</span>
            <strong>{businessMomentLabel}</strong>
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
              <button className="primary-button" type="button" onClick={onOpenContactModal}>
                Entrar em contato
              </button>
              {hasUnlockedWhatsapp ? (
                <button className="whatsapp-button" type="button" onClick={onOpenWhatsAppDirect}>
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
                      <button className="dark-button" type="button" onClick={() => onOpenExploreCategory(item.category)}>
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
          <button className="ghost-button" onClick={onGoHome}>
            Voltar para o início
          </button>
          <button className="ghost-button" type="button" onClick={onViewAllRecommendations}>
            Ver todas as recomendações
          </button>
        </div>
      </section>
    </main>
  );
}
