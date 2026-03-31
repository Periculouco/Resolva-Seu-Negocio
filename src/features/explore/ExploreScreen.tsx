import type { Dispatch, SetStateAction } from "react";

import type { ExploreItem } from "../../types/domain";

type ExploreScreenProps = {
  activeExploreCategory: string;
  setActiveExploreCategory: Dispatch<SetStateAction<string>>;
  exploreQuery: string;
  setExploreQuery: Dispatch<SetStateAction<string>>;
  isPersonalizedExplore: boolean;
  filteredExploreItems: ExploreItem[];
  recommendedExploreId?: string;
  exploreCategories: string[];
  formatCategoryLabel: (label: string) => string;
  onStartDiagnosis: (challenge?: string) => void;
};

export function ExploreScreen({
  activeExploreCategory,
  setActiveExploreCategory,
  exploreQuery,
  setExploreQuery,
  isPersonalizedExplore,
  filteredExploreItems,
  recommendedExploreId,
  exploreCategories,
  formatCategoryLabel,
  onStartDiagnosis,
}: ExploreScreenProps) {
  return (
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
                <button className="dark-button" type="button" onClick={() => onStartDiagnosis(item.focus)}>
                  Ver detalhes
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
