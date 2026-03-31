import type {
  BusinessMoment,
  CurrentBottleneck,
  DecisionMaking,
  FormData,
  PrimaryGoal,
  RevenueProfile,
  SolutionExperience,
} from "../../types/domain";

type QuizOption<T extends string> = {
  value: T;
  label: string;
};

type QuizScreenProps = {
  currentStep: number;
  formData: FormData;
  stepTitle: string;
  canContinue: boolean;
  options: {
    revenueProfileOptions: QuizOption<RevenueProfile>[];
    businessMomentOptions: QuizOption<BusinessMoment>[];
    decisionMakingOptions: QuizOption<DecisionMaking>[];
    currentBottleneckOptions: QuizOption<CurrentBottleneck>[];
    solutionExperienceOptions: QuizOption<SolutionExperience>[];
    primaryGoalOptions: QuizOption<PrimaryGoal>[];
  };
  onUpdateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
};

export function QuizScreen({
  currentStep,
  formData,
  stepTitle,
  canContinue,
  options,
  onUpdateField,
  onPreviousStep,
  onNextStep,
}: QuizScreenProps) {
  const {
    revenueProfileOptions,
    businessMomentOptions,
    decisionMakingOptions,
    currentBottleneckOptions,
    solutionExperienceOptions,
    primaryGoalOptions,
  } = options;

  return (
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
                onClick={() => onUpdateField("revenueProfile", option.value)}
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
                onClick={() => onUpdateField("businessMoment", option.value)}
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
                onClick={() => onUpdateField("decisionMaking", option.value)}
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
                onClick={() => onUpdateField("currentBottleneck", option.value)}
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
                onClick={() => onUpdateField("solutionExperience", option.value)}
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
                onClick={() => onUpdateField("primaryGoal", option.value)}
              >
                <strong className="choice-index">{index + 1}.</strong>
                <span className="choice-detail">{option.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="quiz-actions">
          <button className="ghost-button" type="button" onClick={onPreviousStep}>
            Voltar
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={onNextStep}
            disabled={!canContinue}
          >
            {currentStep === 5 ? "Ver recomendação" : "Continuar"}
          </button>
        </div>
      </section>
    </main>
  );
}
