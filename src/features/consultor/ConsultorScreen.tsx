import { useState } from "react";
import type { ChangeEventHandler, FormEventHandler, MouseEventHandler } from "react";

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
  consultantInstanceSlug: string | null;
  consultantLeadsLoading: boolean;
  consultantAgendaLoading: boolean;
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
  consultantInstanceSlug,
  consultantLeadsLoading,
  consultantAgendaLoading,
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
  const [selectedLead, setSelectedLead] = useState<ConsultantLead | null>(null);
  const nextMeeting = consultantAgenda[0] ?? null;
  const openPipelineCount = consultantLeads.filter((lead) => lead.status !== "Perdido").length;
  const qualifiedCount = consultantLeads.filter(
    (lead) => lead.status === "Qualificado" || lead.status === "Reunião marcada",
  ).length;

  const getLeadPriority = (lead: ConsultantLead) => {
    const urgency = lead.urgency.toLowerCase();

    if (lead.status === "Novo" && /(trav|caos|urg|perd|apag|sem|garg)/.test(urgency)) {
      return "Alta prioridade";
    }

    if (lead.status === "Em contato" || lead.status === "Qualificado") {
      return "Em andamento";
    }

    if (lead.status === "Reunião marcada") {
      return "Reunião pronta";
    }

    if (lead.status === "Perdido") {
      return "Reengajar depois";
    }

    return "Nova oportunidade";
  };

  const getLeadPriorityClassName = (lead: ConsultantLead) => {
    const priority = getLeadPriority(lead);

    if (priority === "Alta prioridade") {
      return "consultant-priority-high";
    }

    if (priority === "Reunião pronta") {
      return "consultant-priority-ready";
    }

    if (priority === "Reengajar depois") {
      return "consultant-priority-low";
    }

    return "consultant-priority-medium";
  };

  const pipelineColumns: Array<{
    id: ConsultantLead["status"];
    label: string;
    helper: string;
  }> = [
    { id: "Novo", label: "Qualificados", helper: "Leads recém-chegados do diagnóstico" },
    { id: "Em contato", label: "Contato feito", helper: "Leads em abordagem comercial" },
    { id: "Qualificado", label: "Demo agendada", helper: "Já existe aderência e próxima ação" },
    { id: "Reunião marcada", label: "Proposta feita", helper: "Leads em reta final de conversão" },
  ];

  const stopLeadModalPropagation: MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();
  };

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
                <span>{consultantInstanceSlug || "parceiro-rsn"}</span>
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

            {consultantAgendaLoading ? (
              <div className="consultant-sidebar-card">
                <p className="section-kicker">Próxima reunião</p>
                <strong>Carregando agenda</strong>
                <span>Buscando agenda da instância</span>
                <small>Próximo slot será exibido aqui</small>
              </div>
            ) : consultantAgenda.length > 0 ? (
              <div className="consultant-sidebar-card">
                <p className="section-kicker">Próxima reunião</p>
                <strong>{consultantAgenda[0].company}</strong>
                <span>{consultantAgenda[0].startsAt}</span>
                <small>{consultantAgenda[0].title}</small>
              </div>
            ) : (
              <div className="consultant-sidebar-card">
                <p className="section-kicker">Próxima reunião</p>
                <strong>Nenhuma reunião agendada</strong>
                <span>Agenda aguardando sincronização</span>
                <small>Próximo slot será exibido aqui</small>
              </div>
            )}
          </aside>

          <div className="consultant-main">
            <div className="consultant-header">
              <div>
                <p className="section-kicker">Pipeline do parceiro</p>
                <h1>
                  {consultantSection === "dashboard"
                    ? "Dashboard comercial"
                    : consultantSection === "leads"
                      ? "Pipeline de leads"
                      : consultantSection === "agenda"
                        ? "Agenda comercial"
                        : "Configurações do parceiro"}
                </h1>
                <p>
                  {consultantSection === "dashboard"
                    ? "Visão rápida do funil, da agenda e das próximas ações."
                    : consultantSection === "leads"
                      ? "Abra os cards para ver contexto, quiz e informações de abordagem."
                      : consultantSection === "agenda"
                        ? "Controle reuniões, disponibilidade e próximos slots."
                        : "Ajuste informações públicas e base operacional do parceiro."}
                </p>
              </div>
              <div className="consultant-header-actions">
                <div className="consultant-header-badge">
                  <span>Pipeline ativo</span>
                  <strong>{openPipelineCount.toString().padStart(2, "0")}</strong>
                </div>
                <button className="ghost-button" type="button" onClick={onConsultantLogout}>
                  Sair da instância
                </button>
              </div>
            </div>

            {consultantSection === "dashboard" && (
              <>
                <div className="consultant-stats-grid">
                  {consultantStats.map((stat) => (
                    <article
                      className={
                        stat.label === "Reuniões marcadas"
                          ? "consultant-stat-card consultant-stat-card-success"
                          : stat.label === "Em contato"
                            ? "consultant-stat-card consultant-stat-card-warm"
                            : "consultant-stat-card"
                      }
                      key={stat.label}
                    >
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                      <small>
                        {stat.label === "Leads recebidos"
                          ? "Entrada total vinda da recomendação e do modal"
                          : stat.label === "Em contato"
                            ? "Leads já em abordagem ou follow-up ativo"
                            : stat.label === "Reuniões marcadas"
                              ? "Conversas que já avançaram para conversa comercial"
                              : "Leads que já chegaram com aderência suficiente"}
                      </small>
                    </article>
                  ))}
                </div>

                <div className="consultant-panels">
                  <section className="consultant-panel">
                    <div className="consultant-panel-header">
                      <h2>Pipeline comercial</h2>
                      <span>Board por etapa</span>
                    </div>
                    <div className="consultant-pipeline-board consultant-pipeline-preview">
                      {consultantLeadsLoading ? (
                        <p className="result-cta-hint">Carregando leads da instância...</p>
                      ) : consultantLeads.length === 0 ? (
                        <p className="result-cta-hint">Ainda não há leads registrados para esta instância.</p>
                      ) : (
                        pipelineColumns.map((column) => (
                          <section className="consultant-pipeline-column" key={column.id}>
                            <div className="consultant-pipeline-column-header">
                              <div>
                                <strong>{column.label}</strong>
                                <span>{column.helper}</span>
                              </div>
                              <small>{consultantLeads.filter((lead) => lead.status === column.id).length}</small>
                            </div>

                            <div className="consultant-pipeline-stack">
                              {consultantLeads.filter((lead) => lead.status === column.id).length === 0 ? (
                                <p className="result-cta-hint">Nenhum lead nesta etapa.</p>
                              ) : (
                                consultantLeads
                                  .filter((lead) => lead.status === column.id)
                                  .slice(0, 2)
                                  .map((lead) => (
                                    <button
                                      className="consultant-pipeline-card"
                                      key={lead.id}
                                      type="button"
                                      onClick={() => setSelectedLead(lead)}
                                    >
                                      <div className="consultant-pipeline-card-head">
                                        <strong>{lead.company}</strong>
                                        <span className={`consultant-priority-chip ${getLeadPriorityClassName(lead)}`}>
                                          {getLeadPriority(lead)}
                                        </span>
                                      </div>
                                      <span>
                                        {lead.contact} · {lead.role}
                                      </span>
                                      <p>{lead.diagnosis}</p>
                                      <small>{lead.objective}</small>
                                    </button>
                                  ))
                              )}
                            </div>
                          </section>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="consultant-panel">
                    <div className="consultant-panel-header">
                      <h2>Agenda e próximos slots</h2>
                      <span>Reuniões em andamento</span>
                    </div>
                    <div className="consultant-agenda-list">
                      {consultantAgendaLoading ? (
                        <p className="result-cta-hint">Carregando agenda da instância...</p>
                      ) : consultantAgenda.length === 0 ? (
                        <p className="result-cta-hint">Nenhuma reunião agendada.</p>
                      ) : (
                        consultantAgenda.map((item) => (
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
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </>
            )}

            {consultantSection === "leads" && (
              <section className="consultant-data-table consultant-leads-board">
                <div className="consultant-table-header consultant-table-header-rich">
                  <span>Funil comercial</span>
                </div>
                {consultantLeadsLoading ? (
                  <p className="result-cta-hint">Carregando leads da instância...</p>
                ) : consultantLeads.length === 0 ? (
                  <p className="result-cta-hint">Ainda não há leads registrados para esta instância.</p>
                ) : (
                  <div className="consultant-pipeline-board">
                    {pipelineColumns.map((column) => (
                      <section className="consultant-pipeline-column" key={column.id}>
                        <div className="consultant-pipeline-column-header">
                          <div>
                            <strong>{column.label}</strong>
                            <span>{column.helper}</span>
                          </div>
                          <small>{consultantLeads.filter((lead) => lead.status === column.id).length}</small>
                        </div>

                        <div className="consultant-pipeline-stack">
                          {consultantLeads.filter((lead) => lead.status === column.id).length === 0 ? (
                            <p className="result-cta-hint">Nenhum lead nesta etapa.</p>
                          ) : (
                            consultantLeads
                              .filter((lead) => lead.status === column.id)
                              .map((lead) => (
                                <button
                                  className="consultant-pipeline-card consultant-pipeline-card-detailed"
                                  key={lead.id}
                                  type="button"
                                  onClick={() => setSelectedLead(lead)}
                                >
                                  <div className="consultant-pipeline-card-head">
                                    <strong>{lead.company}</strong>
                                    <span className={`consultant-priority-chip ${getLeadPriorityClassName(lead)}`}>
                                      {getLeadPriority(lead)}
                                    </span>
                                  </div>
                                  <span>
                                    {lead.contact} · {lead.role}
                                  </span>
                                  <p>{lead.diagnosis}</p>
                                  <div className="consultant-pipeline-card-tags">
                                    <span className="consultant-context-chip">{lead.objective}</span>
                                    <span className="consultant-context-chip">{lead.recommendedCategory}</span>
                                  </div>
                                  <small>{lead.updatedAt}</small>
                                </button>
                              ))
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </section>
            )}

            {consultantSection === "agenda" && (
              <div className="consultant-panels">
                <section className="consultant-panel">
                  <div className="consultant-panel-header">
                    <h2>Disponibilidade</h2>
                    <span>Base da agenda</span>
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
                    <span>Agenda confirmada</span>
                  </div>
                  <div className="consultant-agenda-list">
                    {consultantAgendaLoading ? (
                      <p className="result-cta-hint">Carregando agenda da instância...</p>
                    ) : consultantAgenda.length === 0 ? (
                      <p className="result-cta-hint">Nenhuma reunião agendada.</p>
                    ) : (
                      consultantAgenda.map((item) => (
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
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}

            {consultantSection === "perfil" && (
              <div className="consultant-panels">
                <section className="consultant-panel">
                  <div className="consultant-panel-header">
                    <h2>Dados públicos do parceiro</h2>
                    <span>Informações exibidas ao lead</span>
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
                    <h2>Base operacional</h2>
                    <span>Estrutura atual do produto</span>
                  </div>
                  <div className="consultant-recommendation-copy">
                    <strong>Stack atual: Supabase</strong>
                    <p>
                      Auth, Postgres, RLS e dados operacionais do parceiro ficam concentrados no mesmo stack.
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

      {selectedLead && (
        <div className="modal-overlay" role="presentation" onClick={() => setSelectedLead(null)}>
          <section
            className="contact-modal consultant-lead-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultant-lead-modal-title"
            onClick={stopLeadModalPropagation}
          >
            <div className="contact-modal-header consultant-lead-modal-header">
              <div>
                <p className="section-kicker">Lead quente do diagnóstico</p>
                <h2 id="consultant-lead-modal-title">{selectedLead.company}</h2>
                <p>
                  {selectedLead.contact} · {selectedLead.role}
                </p>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setSelectedLead(null)}
                aria-label="Fechar modal"
              >
                ×
              </button>
            </div>

            <div className="consultant-lead-modal-grid">
              <div className="consultant-lead-modal-section">
                <p className="consultant-lead-label">Contato</p>
                <strong>{selectedLead.contact}</strong>
                <span>{selectedLead.email}</span>
                <span>{selectedLead.phone}</span>
              </div>
              <div className="consultant-lead-modal-section">
                <p className="consultant-lead-label">Status e prioridade</p>
                <div className="consultant-lead-modal-chips">
                  <span className={`status-pill status-${toStatusClassName(selectedLead.status)}`}>{selectedLead.status}</span>
                  <span className={`consultant-priority-chip ${getLeadPriorityClassName(selectedLead)}`}>
                    {getLeadPriority(selectedLead)}
                  </span>
                </div>
                <span>Atualizado em {selectedLead.updatedAt}</span>
              </div>
              <div className="consultant-lead-modal-section">
                <p className="consultant-lead-label">Desafio inicial</p>
                <strong>{selectedLead.challenge}</strong>
              </div>
              <div className="consultant-lead-modal-section">
                <p className="consultant-lead-label">Dor principal</p>
                <strong>{selectedLead.urgency}</strong>
              </div>
              <div className="consultant-lead-modal-section">
                <p className="consultant-lead-label">Diagnóstico</p>
                <strong>{selectedLead.diagnosis}</strong>
                <span>{selectedLead.diagnosisSummary}</span>
              </div>
              <div className="consultant-lead-modal-section">
                <p className="consultant-lead-label">Leitura do quiz</p>
                <strong>{selectedLead.objective}</strong>
                <span>Direção sugerida: {selectedLead.recommendedCategory}</span>
                <span>Especialista recomendado: {selectedLead.recommendedSpecialist}</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
