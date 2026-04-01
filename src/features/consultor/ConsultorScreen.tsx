import { useMemo, useState } from "react";
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
  themeMode: "light" | "dark";
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
  onToggleTheme: () => void;
  onConsultantSectionChange: (section: ConsultantSection) => void;
  onConsultantEmailChange: ChangeEventHandler<HTMLInputElement>;
  onConsultantPasswordChange: ChangeEventHandler<HTMLInputElement>;
  onConsultantInstanceChange: ChangeEventHandler<HTMLInputElement>;
};

export function ConsultorScreen({
  consultantAuthenticated,
  themeMode,
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
  onToggleTheme,
  onConsultantSectionChange,
  onConsultantEmailChange,
  onConsultantPasswordChange,
  onConsultantInstanceChange,
}: ConsultorScreenProps) {
  const [selectedLead, setSelectedLead] = useState<ConsultantLead | null>(null);
  const nextMeeting = consultantAgenda[0] ?? null;
  const openPipelineCount = consultantLeads.filter((lead) => lead.status !== "Perdido").length;
  const contactedCount = consultantLeads.filter((lead) => lead.status === "Em contato").length;
  const qualifiedCount = consultantLeads.filter(
    (lead) => lead.status === "Qualificado" || lead.status === "Reunião marcada",
  ).length;
  const lostCount = consultantLeads.filter((lead) => lead.status === "Perdido").length;
  const conversionRate = consultantLeads.length > 0 ? Math.round((qualifiedCount / consultantLeads.length) * 100) : 0;
  const activeLead = consultantLeads.find((lead) => lead.status !== "Perdido") ?? consultantLeads[0] ?? null;
  const agendaPreview = consultantAgenda.slice(0, 3);
  const recentLeads = consultantLeads.slice(0, 5);

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
    { id: "Novo", label: "Novo lead", helper: "Entradas do diagnóstico" },
    { id: "Em contato", label: "Contato iniciado", helper: "Primeiro follow-up em andamento" },
    { id: "Qualificado", label: "Em negociação", helper: "Lead com aderência e avanço" },
    { id: "Reunião marcada", label: "Fechado", helper: "Call ou fechamento confirmado" },
    { id: "Perdido", label: "Perdido", helper: "Leads fora da janela atual" },
  ];

  const stopLeadModalPropagation: MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();
  };

  const dailyLeadSeries = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return {
        key: date.toISOString().slice(0, 10),
        label: formatter.format(date),
        count: 0,
      };
    });

    const dayIndex = new Map(days.map((day, index) => [day.key, index]));

    consultantLeads.forEach((lead) => {
      const key = lead.createdAtIso.slice(0, 10);
      const index = dayIndex.get(key);

      if (index !== undefined) {
        days[index].count += 1;
      }
    });

    return days;
  }, [consultantLeads]);

  const stageSeries = useMemo(
    () =>
      pipelineColumns.map((column) => ({
        label: column.label,
        value: consultantLeads.filter((lead) => lead.status === column.id).length,
      })),
    [consultantLeads, pipelineColumns],
  );

  const maxDailyLeadCount = Math.max(...dailyLeadSeries.map((item) => item.count), 1);
  const totalStageCount = Math.max(stageSeries.reduce((total, stage) => total + stage.value, 0), 1);

  const donutSegments = useMemo(() => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const colors = ["#f97316", "#fb923c", "#60a5fa", "#22c55e", "#f87171"];
    let offset = 0;

    return stageSeries.map((stage, index) => {
      const ratio = stage.value / totalStageCount;
      const length = circumference * ratio;
      const segment = {
        ...stage,
        color: colors[index % colors.length],
        circumference,
        length,
        offset,
      };
      offset -= length;
      return segment;
    });
  }, [stageSeries, totalStageCount]);

  const leadsByStatus = useMemo(
    () =>
      pipelineColumns.map((column) => ({
        ...column,
        leads: consultantLeads.filter((lead) => lead.status === column.id),
      })),
    [consultantLeads, pipelineColumns],
  );

  const lineChartPath = useMemo(() => {
    const width = 360;
    const height = 152;
    const maxValue = Math.max(...dailyLeadSeries.map((item) => item.count), 1);

    return dailyLeadSeries
      .map((item, index) => {
        const x = (index / Math.max(dailyLeadSeries.length - 1, 1)) * width;
        const y = height - (item.count / maxValue) * (height - 18) - 9;

        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [dailyLeadSeries]);

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
        <section
          className={
            themeMode === "dark"
              ? "consultant-dashboard consultant-theme-dark"
              : "consultant-dashboard consultant-theme-light"
          }
        >
          <aside className="consultant-sidebar">
            <div className="consultant-sidebar-brand">
              <img src="/logo-sem-fundo.png" alt="Resolva Seu Negócio" />
              <div>
                <strong>Instância ativa</strong>
                <span>{consultantInstanceSlug || "parceiro-rsn"}</span>
              </div>
            </div>

            <label className="consultant-sidebar-search" aria-label="Buscar">
              <span>Buscar</span>
              <input type="text" placeholder="Leads, agenda, empresa..." readOnly value="" />
            </label>

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
            <div className="consultant-app-bar">
              <div className="consultant-app-bar-copy">
                <p className="section-kicker">Pipeline do parceiro</p>
                <strong>
                  {consultantSection === "dashboard"
                    ? "Dashboard comercial"
                    : consultantSection === "leads"
                      ? "Kanban de leads"
                      : consultantSection === "agenda"
                        ? "Agenda comercial"
                        : "Perfil do parceiro"}
                </strong>
              </div>
              <div className="consultant-app-bar-meta">
                <div className="consultant-app-bar-pill">
                  <span>Pipeline ativo</span>
                  <strong>{openPipelineCount.toString().padStart(2, "0")}</strong>
                </div>
                <button className="ghost-button" type="button" onClick={onConsultantLogout}>
                  Sair da instância
                </button>
              </div>
            </div>

            <div className="consultant-header">
              <div>
                <h1>
                  {consultantSection === "dashboard"
                    ? "Dashboard comercial"
                    : consultantSection === "leads"
                      ? "Gerenciar leads"
                      : consultantSection === "agenda"
                        ? "Agenda e disponibilidade"
                        : "Perfil operacional"}
                </h1>
                <p>
                  {consultantSection === "dashboard"
                    ? "KPIs, pipeline e ações do dia."
                    : consultantSection === "leads"
                      ? "Board por etapa com abertura rápida do lead."
                      : consultantSection === "agenda"
                        ? "Reuniões e disponibilidade."
                        : "Dados exibidos ao lead e estrutura interna do parceiro."}
                </p>
              </div>
              <div className="consultant-toolbar">
                <button className="consultant-toolbar-button" type="button" onClick={() => onConsultantSectionChange("leads")}>
                  Abrir pipeline
                </button>
                <button className="consultant-toolbar-button" type="button" onClick={() => activeLead && setSelectedLead(activeLead)}>
                  Lead em foco
                </button>
              </div>
            </div>

            {consultantSection === "dashboard" && (
              <>
                <div className="consultant-stats-grid">
                  <article className="consultant-stat-card">
                    <span>Leads recebidos hoje</span>
                    <strong>{consultantStats[0]?.value ?? "00"}</strong>
                    <small>Entradas novas do diagnóstico e formulário</small>
                  </article>
                  <article className="consultant-stat-card consultant-stat-card-warm">
                    <span>Em andamento</span>
                    <strong>{contactedCount.toString().padStart(2, "0")}</strong>
                    <small>Leads em follow-up comercial</small>
                  </article>
                  <article className="consultant-stat-card consultant-stat-card-success">
                    <span>Leads fechados</span>
                    <strong>{qualifiedCount.toString().padStart(2, "0")}</strong>
                    <small>Qualificados e reuniões em fase final</small>
                  </article>
                  <article className="consultant-stat-card">
                    <span>Taxa de conversão</span>
                    <strong>{conversionRate}%</strong>
                    <small>Percentual da base ativa com avanço real</small>
                  </article>
                </div>

                <div className="consultant-dashboard-grid">
                  <section className="consultant-panel">
                    <div className="consultant-panel-header">
                      <h2>Receita e andamento</h2>
                      <span>Leitura rápida do pipeline</span>
                    </div>
                    <div className="consultant-chart-grid">
                      <article className="consultant-chart-card">
                        <div className="consultant-chart-card-header">
                          <strong>Entradas por dia</strong>
                          <span>
                            {dailyLeadSeries.reduce((total, item) => total + item.count, 0)} leads · pico de {maxDailyLeadCount}
                          </span>
                        </div>
                        <div className="consultant-line-chart">
                          <svg viewBox="0 0 360 180" aria-hidden="true">
                            <defs>
                              <linearGradient id="consultantLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.24)" />
                                <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
                              </linearGradient>
                            </defs>
                            <path className="consultant-line-chart-gridline" d="M 0 150 H 360" />
                            <path className="consultant-line-chart-gridline" d="M 0 102 H 360" />
                            <path className="consultant-line-chart-gridline" d="M 0 54 H 360" />
                            <path className="consultant-line-chart-area" d={`${lineChartPath} L 360 180 L 0 180 Z`} />
                            <path className="consultant-line-chart-path" d={lineChartPath} />
                            {dailyLeadSeries.map((item, index) => {
                              const x = (index / Math.max(dailyLeadSeries.length - 1, 1)) * 360;
                              const y = 152 - (item.count / maxDailyLeadCount) * (152 - 18);

                              return (
                                <g key={item.label}>
                                  <circle className="consultant-line-chart-dot" cx={x} cy={y} r="4" />
                                  <text className="consultant-line-chart-value" x={x} y={y - 12}>
                                    {item.count}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                          <div className="consultant-line-chart-labels">
                            {dailyLeadSeries.map((item) => (
                              <span key={item.label}>{item.label}</span>
                            ))}
                          </div>
                        </div>
                      </article>
                      <article className="consultant-chart-card">
                        <div className="consultant-chart-card-header">
                          <strong>Distribuição por etapa</strong>
                          <span>{totalStageCount.toString().padStart(2, "0")} leads no pipeline</span>
                        </div>
                        <div className="consultant-donut-card">
                          <div className="consultant-donut-chart">
                            <svg viewBox="0 0 140 140" aria-hidden="true">
                              <circle className="consultant-donut-track" cx="70" cy="70" r="52" />
                              {donutSegments.map((segment) => (
                                <circle
                                  key={segment.label}
                                  className="consultant-donut-segment"
                                  cx="70"
                                  cy="70"
                                  r="52"
                                  stroke={segment.color}
                                  strokeDasharray={`${segment.length} ${segment.circumference - segment.length}`}
                                  strokeDashoffset={segment.offset}
                                />
                              ))}
                            </svg>
                            <div className="consultant-donut-center">
                              <strong>{totalStageCount.toString().padStart(2, "0")}</strong>
                              <span>leads</span>
                            </div>
                          </div>
                          <div className="consultant-donut-legend">
                            {stageSeries.map((stage, index) => (
                              <div className="consultant-donut-legend-row" key={stage.label}>
                                <span
                                  className="consultant-donut-dot"
                                  style={{ backgroundColor: donutSegments[index]?.color }}
                                />
                                <strong>{stage.label}</strong>
                                <span>{stage.value.toString().padStart(2, "0")}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </article>
                    </div>

                    <div className="consultant-list-panel">
                      <div className="consultant-list-panel-header">
                        <strong>Leads recentes</strong>
                        <span>Últimas entradas</span>
                      </div>
                      {consultantLeadsLoading ? (
                        <p className="result-cta-hint">Carregando leads da instância...</p>
                      ) : recentLeads.length === 0 ? (
                        <p className="result-cta-hint">Ainda não há leads registrados para esta instância.</p>
                      ) : (
                        <div className="consultant-rows">
                          {recentLeads.map((lead) => (
                            <button className="consultant-row" key={lead.id} type="button" onClick={() => setSelectedLead(lead)}>
                              <div className="consultant-row-main">
                                <strong>{lead.company}</strong>
                                <span>{lead.contact}</span>
                              </div>
                              <span className="consultant-row-tag">{lead.status}</span>
                              <span>{lead.updatedAt}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="consultant-panel consultant-dashboard-side">
                    <div className="consultant-panel-header">
                      <h2>Notificações e agenda</h2>
                      <span>Hoje</span>
                    </div>
                    <div className="consultant-dashboard-side-grid">
                      {activeLead ? (
                        <button
                          className="consultant-focus-card"
                          type="button"
                          onClick={() => setSelectedLead(activeLead)}
                        >
                          <div className="consultant-focus-card-header">
                            <span className="consultant-kicker-chip">Lead em foco</span>
                            <span className={`consultant-priority-chip ${getLeadPriorityClassName(activeLead)}`}>
                              {getLeadPriority(activeLead)}
                            </span>
                          </div>
                          <strong>{activeLead.company}</strong>
                          <p>{activeLead.contact}</p>
                          <small>{activeLead.diagnosis}</small>
                        </button>
                      ) : (
                        <div className="consultant-empty-card">
                          <strong>Nenhum lead em foco</strong>
                          <span>Assim que entrar um lead, ele aparece aqui para ação rápida.</span>
                        </div>
                      )}

                      <div className="consultant-mini-metrics">
                        <div>
                          <span>Qualificados</span>
                          <strong>{qualifiedCount.toString().padStart(2, "0")}</strong>
                        </div>
                        <div>
                          <span>Perdidos</span>
                          <strong>{lostCount.toString().padStart(2, "0")}</strong>
                        </div>
                      </div>

                      <div className="consultant-agenda-list consultant-agenda-list-compact">
                        {consultantAgendaLoading ? (
                          <p className="result-cta-hint">Carregando agenda da instância...</p>
                        ) : agendaPreview.length === 0 ? (
                          <p className="result-cta-hint">Nenhuma reunião agendada.</p>
                        ) : (
                          agendaPreview.map((item) => (
                            <article className="consultant-agenda-card" key={item.id}>
                              <div className="consultant-agenda-main">
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

                      <div className="consultant-tip-card">
                        <strong>Melhor ação agora</strong>
                        <p>
                          {activeLead
                            ? `Responder ${activeLead.contact} com foco em ${activeLead.objective.toLowerCase()}.`
                            : "Assim que entrar um lead, a próxima melhor ação aparece aqui."}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            )}

            {consultantSection === "leads" && (
              <section className="consultant-data-table consultant-leads-board">
                <div className="consultant-panel-header">
                  <h2>Kanban comercial</h2>
                  <span>Abra o card para ver quiz, diagnóstico e abordagem</span>
                </div>
                {consultantLeadsLoading ? (
                  <p className="result-cta-hint">Carregando leads da instância...</p>
                ) : consultantLeads.length === 0 ? (
                  <p className="result-cta-hint">Ainda não há leads registrados para esta instância.</p>
                ) : (
                  <div className="consultant-pipeline-board">
                    {leadsByStatus.map((column) => (
                      <section className="consultant-pipeline-column" key={column.id}>
                        <div className="consultant-pipeline-column-header">
                          <div>
                            <strong>{column.label}</strong>
                            <span>{column.helper}</span>
                          </div>
                          <small>{column.leads.length}</small>
                        </div>

                        <div className="consultant-pipeline-stack">
                          {column.leads.length === 0 ? (
                            <p className="result-cta-hint">Nenhum lead nesta etapa.</p>
                          ) : (
                            column.leads.map((lead) => (
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
                                  <div className="consultant-pipeline-card-person">
                                    <span>{lead.contact}</span>
                                    <small>{lead.role}</small>
                                  </div>
                                  <p>{lead.diagnosis}</p>
                                  <div className="consultant-pipeline-card-tags">
                                    <span className="consultant-context-chip">{lead.recommendedCategory}</span>
                                  </div>
                                  <div className="consultant-pipeline-card-footer">
                                    <small>{lead.updatedAt}</small>
                                    <small>{lead.objective}</small>
                                  </div>
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
                              <span className={`status-pill status-${toStatusClassName(item.status)}`}>{item.status}</span>
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
                    <h2>Aparência e operação</h2>
                    <span>Modo visual e stack atual</span>
                  </div>
                  <div className="consultant-theme-switcher">
                    <div>
                      <span>Tema global da plataforma</span>
                      <strong>{themeMode === "light" ? "Light ativo" : "Dark ativo"}</strong>
                    </div>
                    <div className="consultant-theme-actions">
                      <button className="consultant-theme-button active" type="button" onClick={onToggleTheme}>
                        {themeMode === "light" ? "Trocar para dark" : "Trocar para light"}
                      </button>
                    </div>
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
