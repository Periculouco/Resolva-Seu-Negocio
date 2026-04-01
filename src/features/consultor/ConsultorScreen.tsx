import type { ChangeEventHandler, FormEventHandler } from "react";

import type { ConsultantAgendaItem, ConsultantLead, ConsultantSection } from "../../types/domain";

type ConsultantForm = {
  email: string;
  password: string;
  instance: string;
};

type ConsultantStat = {
  label: string;
  value: string;
};

type ConsultorScreenProps = {
  consultantAuthenticated: boolean;
  consultantSection: ConsultantSection;
  consultantForm: ConsultantForm;
  consultantAuthError: string | null;
  consultantStats: ConsultantStat[];
  consultantLeads: ConsultantLead[];
  consultantAgenda: ConsultantAgendaItem[];
  toStatusClassName: (value: string) => string;
  onConsultantLogin: FormEventHandler<HTMLFormElement>;
  onConsultantLogout: () => void;
  onConsultantSectionChange: (section: ConsultantSection) => void;
  onConsultantEmailChange: ChangeEventHandler<HTMLInputElement>;
  onConsultantPasswordChange: ChangeEventHandler<HTMLInputElement>;
  onConsultantInstanceChange: ChangeEventHandler<HTMLInputElement>;
};

export function ConsultorScreen({
  consultantAuthenticated,
  consultantSection,
  consultantForm,
  consultantAuthError,
  consultantStats,
  consultantLeads,
  consultantAgenda,
  toStatusClassName,
  onConsultantLogin,
  onConsultantLogout,
  onConsultantSectionChange,
  onConsultantEmailChange,
  onConsultantPasswordChange,
  onConsultantInstanceChange,
}: ConsultorScreenProps) {
  return (
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

            <form className="consultant-login-form" onSubmit={onConsultantLogin}>
              <label>
                Email
                <input
                  value={consultantForm.email}
                  onChange={onConsultantEmailChange}
                  type="email"
                  placeholder="voce@parceiro.com"
                  required
                />
              </label>
              <label>
                Senha
                <input
                  value={consultantForm.password}
                  onChange={onConsultantPasswordChange}
                  type="password"
                  placeholder="Digite sua senha"
                  required
                />
              </label>
              <label>
                Instância
                <input
                  value={consultantForm.instance}
                  onChange={onConsultantInstanceChange}
                  placeholder="ex: marcos-tavares"
                  required
                />
              </label>
              <button className="primary-button" type="submit">
                Entrar na área do parceiro
              </button>
              {consultantAuthError && <p className="result-cta-hint">{consultantAuthError}</p>}
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
                  onClick={() => onConsultantSectionChange(item.id as ConsultantSection)}
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
              <button className="ghost-button" type="button" onClick={onConsultantLogout}>
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
  );
}
