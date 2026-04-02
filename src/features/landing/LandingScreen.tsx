import type { ChangeEventHandler, ComponentType, FormEventHandler } from "react";

import type { ExploreItem, NumberItem, SignalItem } from "../../types/domain";

type FeaturedPartner = {
  name: string;
  category: string;
  benefit: string;
};

type Category = {
  title: string;
  exploreCategory: string;
  description: string;
  accent: boolean;
  signal: string;
};

type HowItWorksItem = {
  title: string;
  description: string;
};

type LandingScreenProps = {
  challenge: string;
  quickChallenges: string[];
  ecosystemLogos: string[];
  numbers: NumberItem[];
  diagnosisSignals: SignalItem[];
  successSignals: SignalItem[];
  featuredPartners: FeaturedPartner[];
  categories: Category[];
  howItWorks: HowItWorksItem[];
  exploreItems: ExploreItem[];
  onChallengeChange: ChangeEventHandler<HTMLInputElement>;
  onSubmitChallenge: FormEventHandler<HTMLFormElement>;
  onStartDiagnosis: (challenge?: string) => void;
  onOpenExploreCategory: (exploreCategory: string) => void;
  onOpenPartnerPitch: () => void;
  onOpenConsultantArea: () => void;
  AnimatedSignalList: ComponentType<{ items: SignalItem[] }>;
  AnimatedNumber: ComponentType<{ value: number; prefix?: string; suffix?: string }>;
};

export function LandingScreen({
  challenge,
  quickChallenges,
  ecosystemLogos,
  numbers,
  diagnosisSignals,
  successSignals,
  featuredPartners,
  categories,
  howItWorks,
  exploreItems,
  onChallengeChange,
  onSubmitChallenge,
  onStartDiagnosis,
  onOpenExploreCategory,
  onOpenPartnerPitch,
  onOpenConsultantArea,
  AnimatedSignalList,
  AnimatedNumber,
}: LandingScreenProps) {
  return (
    <main className="landing-light">
      <section className="search-hero">
        <div className="search-hero-pattern" />
        <div className="search-hero-glow" />
        <div className="search-hero-content">
          <p className="section-kicker centered">Resolva seu negócio</p>
          <h1>
            Conectamos você
            <br />
            à solução <span className="accent-word">exata</span>
            <br />
            para o seu
            <br />
            negócio
          </h1>
          <p className="hero-support">
            Entenda o que trava seu negócio e com quem resolver isso primeiro.
          </p>

          <form className="search-box" onSubmit={onSubmitChallenge}>
            <input
              id="challenge"
              value={challenge}
              onChange={onChallengeChange}
              placeholder="Ex: minha empresa vende, mas tudo depende de indicação"
            />
            <button className="search-button" type="submit">
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
          </form>

          <div className="popular-row">
            <span>Populares:</span>
            {quickChallenges.map((item) => (
              <button
                className="light-tag"
                key={item}
                type="button"
                onClick={() => onStartDiagnosis(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="logo-strip" aria-label="Frentes que mais travam empresas">
        <div className="logo-marquee">
          {[0, 1].map((track) => (
            <div className="logo-marquee-track" key={track}>
              <span>frentes que mais travam empresas</span>
              {ecosystemLogos.map((logo) => (
                <strong key={`${track}-${logo}`}>{logo}</strong>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="light-section" id="como-funciona">
        <div className="section-heading">
          <p className="section-kicker">Como resolvemos</p>
          <h2>
            Você mostra a dor. A plataforma mostra o que fazer <span className="accent-word-inline">primeiro</span>.
          </h2>
        </div>

        <div className="process-grid">
          {howItWorks.map((item, index) => (
            <article className="process-card" key={item.title}>
              <div className="process-illustration">{index + 1}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="light-section" id="numeros">
        <div className="numbers-showcase">
          <div className="numbers-main">
            <div className="section-heading">
              <p className="section-kicker">O tamanho do problema</p>
              <h2>O que é Resolva Seu Negócio em números:</h2>
            </div>

            <div className="numbers-grid">
              {numbers.map((item) => (
                <article className="number-card" key={`${item.prefix ?? ""}${item.value}${item.suffix ?? ""}`}>
                  <strong>
                    <AnimatedNumber value={item.value} prefix={item.prefix} suffix={item.suffix} />
                  </strong>
                  <p>{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="numbers-feed">
            <div className="numbers-feed-copy">
              <p className="section-kicker">Principais dores</p>
              <h3>Todos os dias empresários nos reportam:</h3>
            </div>
            <AnimatedSignalList items={diagnosisSignals} />
          </aside>
        </div>
      </section>

      <section className="light-section" id="parceiros">
        <div className="section-heading">
          <p className="section-kicker">Quem resolve</p>
          <h2>
            Especialistas preparados para atacar <span className="accent-word-inline">dores reais</span> do negócio
          </h2>
          <p className="section-subtitle">
            Consultores e parceiros para vendas, marketing, gestão e finanças.
          </p>
        </div>

        <div className="partners-grid">
          {featuredPartners.map((partner) => (
            <article className="partner-card" key={partner.name}>
              <div className="partner-badge">{partner.name.slice(0, 1)}</div>
              <div className="partner-copy">
                <h3>{partner.name}</h3>
                <p className="partner-category">{partner.category}</p>
                <span>{partner.benefit}</span>
              </div>
              <button className="partner-link" type="button" onClick={() => onStartDiagnosis(partner.category)}>
                Ver mais
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="light-section" id="categorias">
        <div className="section-heading centered-heading">
          <p className="section-kicker">Por onde sua empresa está travando</p>
          <h2>Explore por categoria</h2>
          <p className="section-subtitle narrow">
            Escolha a frente que mais pesa hoje. Se não souber, o diagnóstico encontra.
          </p>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <button
              className={category.accent ? "category-card accent category-card-button" : "category-card category-card-button"}
              key={category.title}
              type="button"
              onClick={() => onOpenExploreCategory(category.exploreCategory)}
            >
              <div className="category-icon">{category.title.slice(0, 1)}</div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
              <div className="category-meta">
                <span className="category-count">
                  +{exploreItems.filter((item) => item.category === category.exploreCategory).length}
                </span>
                <span className="category-signal">{category.signal}</span>
              </div>
              <span className="category-link">
                Explorar categoria
              </span>
              <div className="category-footer-indicator" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="light-section">
        <div className="section-heading centered-heading">
          <p className="section-kicker">Antes e depois</p>
          <h2>Da dor recorrente ao resultado certo.</h2>
          <p className="section-subtitle narrow">
            O diagnóstico mostra o que trava. A direção certa mostra o que começa a andar.
          </p>
        </div>

        <div className="before-after-grid">
          <article className="comparison-card">
            <div className="numbers-feed-copy">
              <p className="section-kicker">Antes do diagnóstico</p>
              <h3>O que os empresários reportam quando chegam.</h3>
            </div>
            <AnimatedSignalList items={diagnosisSignals} />
          </article>

          <article className="comparison-card success">
            <div className="numbers-feed-copy">
              <p className="section-kicker">Depois da direção certa</p>
              <h3>O que eles começam a relatar após agir com clareza.</h3>
            </div>
            <AnimatedSignalList items={successSignals} />
          </article>
        </div>
      </section>

      <section className="light-section cta-section">
        <div className="cta-copy">
          <p className="section-kicker">Pare de correr atrás do próprio rabo</p>
          <h2>
            Seu negócio não precisa de mais tentativa e erro. Precisa de <span className="accent-word-inline">direção</span>.
          </h2>
          <p className="section-subtitle">
            Comece pelo diagnóstico e entenda qual gargalo atacar agora.
          </p>
          <button className="dark-button" type="button" onClick={() => onStartDiagnosis()}>
            Fazer diagnóstico agora
          </button>
        </div>

        <aside className="partner-cta-card">
          <p className="section-kicker">Seja parceiro</p>
          <h3>Você resolve dores empresariais de verdade?</h3>
          <p>
            Se sua especialidade destrava crescimento, faz sentido conversar com a gente.
          </p>
          <button className="gold-button" type="button" onClick={onOpenPartnerPitch}>
            Quero entrar na rede
          </button>
          <button className="ghost-button partner-secondary-cta" type="button" onClick={onOpenConsultantArea}>
            Ver área do parceiro
          </button>
        </aside>
      </section>
    </main>
  );
}
