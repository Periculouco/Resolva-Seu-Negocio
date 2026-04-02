import { useEffect, useMemo, useState } from "react";
import type { ChangeEventHandler, FormEventHandler, MouseEventHandler } from "react";

import { listActivitiesByLead } from "../../lib/repositories/activitiesRepository";
import type { ConsultantAgendaItem, ConsultantLead, ConsultantSection } from "../../types/domain";
import type { PartnerActivityRow } from "../../types/database";

type ConsultantForm = {
  email: string;
  password: string;
  instance: string;
};

type ConsultantStat = {
  label: string;
  value: string;
};

type ConsultantDealDraft = {
  contactName: string;
  organization: string;
  title: string;
  value: string;
  funnel: string;
  stage: string;
  tag: string;
  expectedCloseDate: string;
  owner: string;
  sourceChannel: string;
  sourceChannelId: string;
  visibility: string;
  phone: string;
  email: string;
  role: string;
};

type ConsultorScreenProps = {
  consultantAuthenticated: boolean;
  themeMode: "light" | "dark";
  consultantSection: ConsultantSection;
  consultantForm: ConsultantForm;
  consultantAuthError: string | null;
  consultantInstanceSlug: string | null;
  consultantPipelineName: string;
  consultantLeadsLoading: boolean;
  consultantAgendaLoading: boolean;
  consultantStats: ConsultantStat[];
  consultantLeads: ConsultantLead[];
  consultantAgenda: ConsultantAgendaItem[];
  toStatusClassName: (value: string) => string;
  onCreateConsultantDeal: (draft: ConsultantDealDraft) => Promise<{
    success: boolean;
    error?: string | null;
  }>;
  onCreateConsultantActivity: (draft: {
    leadId: string;
    title: string;
    dueDate: string;
    channel: string;
    note: string;
  }) => Promise<{
    success: boolean;
    error?: string | null;
  }>;
  onSaveConsultantPipeline: (pipelineName: string) => Promise<{
    success: boolean;
    error?: string | null;
  }>;
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
  consultantPipelineName,
  consultantLeadsLoading,
  consultantAgendaLoading,
  consultantStats,
  consultantLeads,
  consultantAgenda,
  toStatusClassName,
  onCreateConsultantDeal,
  onCreateConsultantActivity,
  onSaveConsultantPipeline,
  onConsultantLogin,
  onConsultantLogout,
  onToggleTheme,
  onConsultantSectionChange,
  onConsultantEmailChange,
  onConsultantPasswordChange,
  onConsultantInstanceChange,
}: ConsultorScreenProps) {
  const [selectedLead, setSelectedLead] = useState<ConsultantLead | null>(null);
  const [kanbanSearch, setKanbanSearch] = useState("");
  const [activeToolModal, setActiveToolModal] = useState<
    null | "pipeline" | "activity" | "quick-create" | "filters" | "deal-create"
  >(null);
  const [activityLead, setActivityLead] = useState<ConsultantLead | null>(null);
  const [toolError, setToolError] = useState<string | null>(null);
  const [toolSuccess, setToolSuccess] = useState<string | null>(null);
  const [isSavingDeal, setIsSavingDeal] = useState(false);
  const [isSavingActivity, setIsSavingActivity] = useState(false);
  const [isSavingPipeline, setIsSavingPipeline] = useState(false);
  const [leadActivities, setLeadActivities] = useState<PartnerActivityRow[]>([]);
  const [leadActivitiesLoading, setLeadActivitiesLoading] = useState(false);
  const [pipelineNameDraft, setPipelineNameDraft] = useState(consultantPipelineName);
  const [hoveredStageLabel, setHoveredStageLabel] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState({
    title: "",
    dueDate: "",
    channel: "WhatsApp",
    note: "",
  });
  const [dealForm, setDealForm] = useState({
    contactName: "",
    organization: "",
    title: "",
    value: "12000",
    funnel: consultantPipelineName,
    stage: "Novo lead",
    tag: "Lead do diagnóstico",
    expectedCloseDate: "",
    owner: "Resolva Seu Negócio (Você)",
    sourceChannel: "Diagnóstico",
    sourceChannelId: "quiz-diagnostico",
    visibility: "Equipe comercial",
    phone: "",
    email: "",
    role: "",
  });
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

  const getLeadPreview = (lead: ConsultantLead) => {
    const summary = lead.diagnosisSummary?.trim() || lead.urgency?.trim() || lead.challenge?.trim() || "";
    return summary.length > 78 ? `${summary.slice(0, 78).trim()}...` : summary;
  };

  const getLeadInitials = (lead: ConsultantLead) => {
    const base = lead.company || lead.contact;
    return base
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

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

  const getLeadSourceLabel = (lead: ConsultantLead) => {
    if (lead.challenge.toLowerCase().includes("manualmente")) {
      return "Criado manualmente";
    }

    return "Diagnóstico + formulário";
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
  const selectedLeadStageIndex = selectedLead
    ? Math.max(
        pipelineColumns.findIndex((column) => column.id === selectedLead.status),
        0,
      )
    : 0;

  const stopLeadModalPropagation: MouseEventHandler<HTMLElement> = (event) => {
    event.stopPropagation();
  };

  useEffect(() => {
    setToolError(null);
    setToolSuccess(null);
  }, [activeToolModal]);

  useEffect(() => {
    setPipelineNameDraft(consultantPipelineName);
    setDealForm((current) => ({
      ...current,
      funnel: consultantPipelineName,
    }));
  }, [consultantPipelineName]);

  useEffect(() => {
    if (!selectedLead || !consultantInstanceSlug) {
      setLeadActivities([]);
      setLeadActivitiesLoading(false);
      return;
    }

    let isActive = true;
    setLeadActivitiesLoading(true);

    void listActivitiesByLead(selectedLead.id, consultantInstanceSlug).then((result) => {
      if (!isActive) {
        return;
      }

      if (!result.success) {
        setLeadActivities([]);
        setLeadActivitiesLoading(false);
        return;
      }

      setLeadActivities(result.data);
      setLeadActivitiesLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [consultantInstanceSlug, selectedLead]);

  const openActivityModal = (lead?: ConsultantLead) => {
    setActivityLead(lead ?? activeLead ?? null);
    setActivityForm({
      title: lead ? `Follow-up com ${lead.contact}` : "Novo follow-up",
      dueDate: "",
      channel: "WhatsApp",
      note: lead ? `Retomar contato com foco em ${lead.objective.toLowerCase()}.` : "",
    });
    setActiveToolModal("activity");
  };

  const openDealCreateModal = (lead?: ConsultantLead | null, preferredStage?: string) => {
    const baseLead = lead ?? activeLead ?? null;

    setDealForm({
      contactName: baseLead?.contact ?? "",
      organization: baseLead?.company ?? "",
      title: baseLead ? `${baseLead.objective} · ${baseLead.company}` : "Novo negócio",
      value: "12000",
      funnel: consultantPipelineName,
      stage:
        preferredStage ??
        (baseLead?.status === "Novo"
          ? "Novo lead"
          : baseLead?.status === "Em contato"
            ? "Contato iniciado"
            : baseLead?.status === "Qualificado"
              ? "Em negociação"
              : baseLead?.status === "Reunião marcada"
                ? "Fechado"
                : baseLead?.status ?? "Novo lead"),
      tag: baseLead ? getLeadPriority(baseLead) : "Lead do diagnóstico",
      expectedCloseDate: "",
      owner: "Resolva Seu Negócio (Você)",
      sourceChannel: "Diagnóstico",
      sourceChannelId: "quiz-diagnostico",
      visibility: "Equipe comercial",
      phone: baseLead?.phone ?? "",
      email: baseLead?.email ?? "",
      role: baseLead?.role ?? "",
    });
    setActiveToolModal("deal-create");
  };

  const closeToolModal = () => {
    setActiveToolModal(null);
    setActivityLead(null);
    setToolError(null);
    setToolSuccess(null);
  };

  const handleActivityCreate = async () => {
    const lead = activityLead ?? selectedLead ?? activeLead;

    if (!lead) {
      setToolError("Selecione um lead para criar a atividade.");
      return;
    }

    if (!activityForm.title.trim()) {
      setToolError("Informe um título para a atividade.");
      return;
    }

    setIsSavingActivity(true);
    setToolError(null);

    const result = await onCreateConsultantActivity({
      leadId: lead.id,
      title: activityForm.title.trim(),
      dueDate: activityForm.dueDate,
      channel: activityForm.channel,
      note: activityForm.note.trim(),
    });

    setIsSavingActivity(false);

    if (!result.success) {
      setToolError("Não foi possível salvar a atividade agora.");
      return;
    }

    if (consultantInstanceSlug) {
      void listActivitiesByLead(lead.id, consultantInstanceSlug).then((activitiesResult) => {
        if (activitiesResult.success) {
          setLeadActivities(activitiesResult.data);
        }
      });
    }
    setToolSuccess("Atividade criada e vinculada ao lead.");
    window.setTimeout(() => {
      closeToolModal();
    }, 300);
  };

  const handleDealCreate = async () => {
    if (!dealForm.contactName.trim() || !dealForm.organization.trim() || !dealForm.title.trim()) {
      setToolError("Preencha contato, organização e título do negócio.");
      return;
    }

    setIsSavingDeal(true);
    setToolError(null);

    const result = await onCreateConsultantDeal(dealForm);

    setIsSavingDeal(false);

    if (!result.success) {
      setToolError(result.error ?? "Não foi possível criar o negócio agora.");
      return;
    }

    setToolSuccess("Negócio criado e enviado para o pipeline.");
    window.setTimeout(() => {
      closeToolModal();
    }, 300);
  };

  const handlePipelineSave = async () => {
    if (!pipelineNameDraft.trim()) {
      setToolError("Informe um nome para o pipeline.");
      return;
    }

    setIsSavingPipeline(true);
    setToolError(null);

    const result = await onSaveConsultantPipeline(pipelineNameDraft);

    setIsSavingPipeline(false);

    if (!result.success) {
      setToolError(result.error ?? "Não foi possível salvar o pipeline agora.");
      return;
    }

    setToolSuccess("Pipeline atualizado com sucesso.");
    window.setTimeout(() => {
      closeToolModal();
    }, 300);
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
  const activeDonutStage =
    donutSegments.find((segment) => segment.label === hoveredStageLabel) ??
    donutSegments.find((segment) => segment.value > 0) ??
    donutSegments[0];

  const leadsByStatus = useMemo(
    () =>
      pipelineColumns.map((column) => ({
        ...column,
        leads: consultantLeads.filter((lead) => {
          if (lead.status !== column.id) {
            return false;
          }

          const normalizedSearch = kanbanSearch.trim().toLowerCase();

          if (!normalizedSearch) {
            return true;
          }

          return [
            lead.company,
            lead.contact,
            lead.diagnosis,
            lead.recommendedCategory,
            lead.objective,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);
        }),
      })),
    [consultantLeads, kanbanSearch, pipelineColumns],
  );

  const visibleLeadCount = leadsByStatus.reduce((total, column) => total + column.leads.length, 0);
  const selectedLeadHistory = selectedLead
    ? [
        {
          id: `${selectedLead.id}-created`,
          title: "Lead recebido no pipeline",
          meta: `Origem: ${getLeadSourceLabel(selectedLead)}`,
          body: `Entrada registrada para ${selectedLead.company} com foco em ${selectedLead.objective.toLowerCase()}.`,
        },
        {
          id: `${selectedLead.id}-diagnosis`,
          title: "Diagnóstico consolidado",
          meta: `Direção sugerida: ${selectedLead.recommendedCategory}`,
          body: selectedLead.diagnosisSummary,
        },
      ]
    : [];

  const openLeadWhatsApp = (lead: ConsultantLead) => {
    const digits = lead.phone.replace(/\D/g, "");

    if (!digits) {
      setSelectedLead(lead);
      return;
    }

    const message = encodeURIComponent(
      `Olá, ${lead.contact}. Estou entrando em contato sobre o diagnóstico da ${lead.company}.`,
    );

    window.open(`https://wa.me/${digits}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  const lineChartPath = useMemo(() => {
    const width = 560;
    const height = 240;
    const paddingLeft = 44;
    const paddingRight = 12;
    const paddingTop = 12;
    const paddingBottom = 28;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const maxValue = Math.max(...dailyLeadSeries.map((item) => item.count), 1);

    return dailyLeadSeries
      .map((item, index) => {
        const x = paddingLeft + (index / Math.max(dailyLeadSeries.length - 1, 1)) * chartWidth;
        const y = paddingTop + chartHeight - (item.count / maxValue) * chartHeight;

        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }, [dailyLeadSeries]);
  const lineChartMetrics = useMemo(() => {
    const width = 560;
    const height = 240;
    const paddingLeft = 44;
    const paddingRight = 12;
    const paddingTop = 12;
    const paddingBottom = 28;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const maxValue = Math.max(...dailyLeadSeries.map((item) => item.count), 1);
    const tickBase = Math.max(maxValue, 3);
    const ticks = Array.from(new Set([0, Math.ceil(tickBase / 3), Math.ceil((tickBase * 2) / 3), tickBase])).sort(
      (a, b) => a - b,
    );

    const points = dailyLeadSeries.map((item, index) => {
      const x = paddingLeft + (index / Math.max(dailyLeadSeries.length - 1, 1)) * chartWidth;
      const y = paddingTop + chartHeight - (item.count / maxValue) * chartHeight;

      return {
        ...item,
        x,
        y,
      };
    });

    const areaPath = `${lineChartPath} L ${paddingLeft + chartWidth} ${paddingTop + chartHeight} L ${paddingLeft} ${
      paddingTop + chartHeight
    } Z`;

    const gridLines = ticks.map((tick) => {
      const y = paddingTop + chartHeight - (tick / maxValue) * chartHeight;

      return {
        tick,
        y,
      };
    });

    return {
      width,
      height,
      paddingLeft,
      paddingTop,
      chartWidth,
      chartHeight,
      points,
      ticks,
      gridLines,
      areaPath,
    };
  }, [dailyLeadSeries, lineChartPath]);

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
            <div className="consultant-sidebar-app-switcher" aria-hidden="true">
              <span className="consultant-sidebar-app-logo">R</span>
              <span className="consultant-sidebar-app-dot active" />
              <span className="consultant-sidebar-app-dot" />
              <span className="consultant-sidebar-app-dot" />
            </div>

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
                { id: "dashboard", label: "Dashboard", icon: "◫" },
                { id: "leads", label: "Leads", icon: "▥" },
                { id: "agenda", label: "Agenda", icon: "◷" },
                { id: "perfil", label: "Perfil", icon: "⚙" },
              ].map((item) => (
                <button
                  key={item.id}
                  className={consultantSection === item.id ? "consultant-nav-link active" : "consultant-nav-link"}
                  type="button"
                  onClick={() => onConsultantSectionChange(item.id as ConsultantSection)}
                >
                  <span className="consultant-nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
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
            <div className="consultant-tool-header">
              <div className="consultant-tool-header-left">
                <div className="consultant-tool-header-title">
                  <strong>Resolva CRM</strong>
                  <span>Operação comercial</span>
                </div>
                <label className="consultant-tool-search" aria-label="Busca global da ferramenta">
                  <span aria-hidden="true">⌕</span>
                  <input type="text" placeholder="Buscar lead, empresa, agenda ou atividade" readOnly value="" />
                </label>
              </div>
              <div className="consultant-tool-header-right">
                <button className="consultant-tool-chip" type="button" onClick={() => setActiveToolModal("pipeline")}>
                  {consultantPipelineName}
                </button>
                <button
                  className="consultant-tool-action"
                  type="button"
                  aria-label="Filtro rápido"
                  onClick={() => setActiveToolModal("filters")}
                >
                  <span aria-hidden="true">⌯</span>
                  Filtros
                </button>
                <button
                  className="consultant-tool-action"
                  type="button"
                  aria-label="Ações rápidas"
                  onClick={() => setActiveToolModal("quick-create")}
                >
                  <span aria-hidden="true">◉</span>
                  Ações
                </button>
                <button
                  className="consultant-tool-action consultant-tool-action-primary"
                  type="button"
                  aria-label="Adicionar"
                  onClick={() => openDealCreateModal()}
                >
                  <span aria-hidden="true">＋</span>
                  Novo
                </button>
              </div>
            </div>

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
                      ? "Pipeline de leads"
                      : consultantSection === "agenda"
                        ? "Agenda e disponibilidade"
                        : "Perfil operacional"}
                </h1>
                <p>
                  {consultantSection === "dashboard"
                    ? "KPIs e ações do dia."
                    : consultantSection === "leads"
                      ? "Triagem rápida por etapa."
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

            {selectedLead ? (
              <section className="consultant-deal-page">
                <div className="consultant-deal-toolbar">
                  <button className="consultant-deal-back" type="button" onClick={() => setSelectedLead(null)}>
                    ← Voltar ao pipeline
                  </button>
                  <div className="consultant-deal-toolbar-actions">
                    <button
                      className="consultant-card-action consultant-card-action-whatsapp"
                      type="button"
                      onClick={() => openLeadWhatsApp(selectedLead)}
                    >
                      WhatsApp
                    </button>
                    <button
                      className="consultant-card-action consultant-card-action-secondary"
                      type="button"
                      onClick={() => openActivityModal(selectedLead)}
                    >
                      Criar atividade
                    </button>
                    <button className="primary-button" type="button" onClick={() => onConsultantSectionChange("leads")}>
                      Ver no pipeline
                    </button>
                  </div>
                </div>

                <div className="consultant-deal-hero">
                  <div className="consultant-deal-hero-copy">
                    <p className="section-kicker">Negócio em operação</p>
                    <h2>{selectedLead.company}</h2>
                    <p>
                      {selectedLead.contact} · {selectedLead.role}
                    </p>
                  </div>
                  <div className="consultant-deal-hero-meta">
                    <span className={`status-pill status-${toStatusClassName(selectedLead.status)}`}>{selectedLead.status}</span>
                    <span className={`consultant-priority-chip ${getLeadPriorityClassName(selectedLead)}`}>
                      {getLeadPriority(selectedLead)}
                    </span>
                    <span className="consultant-context-chip">{consultantPipelineName}</span>
                  </div>
                </div>

                <div className="consultant-deal-stage-strip">
                  {pipelineColumns.map((column, index) => (
                    <div
                      key={column.id}
                      className={
                        index < selectedLeadStageIndex
                          ? "consultant-deal-stage completed"
                          : index === selectedLeadStageIndex
                            ? "consultant-deal-stage active"
                            : "consultant-deal-stage"
                      }
                    >
                      <span>{column.label}</span>
                    </div>
                  ))}
                </div>

                <div className="consultant-deal-layout">
                  <aside className="consultant-deal-sidebar">
                    <section className="consultant-deal-card">
                      <h3>Resumo</h3>
                      <div className="consultant-deal-list">
                        <div>
                          <span>Contato</span>
                          <strong>{selectedLead.contact}</strong>
                          <small>{selectedLead.email}</small>
                          <small>{selectedLead.phone}</small>
                        </div>
                        <div>
                          <span>Empresa</span>
                          <strong>{selectedLead.company}</strong>
                          <small>{selectedLead.role}</small>
                        </div>
                        <div>
                          <span>Origem</span>
                          <strong>{getLeadSourceLabel(selectedLead)}</strong>
                          <small>{consultantPipelineName}</small>
                        </div>
                      </div>
                    </section>

                    <section className="consultant-deal-card">
                      <h3>Dados do quiz</h3>
                      <div className="consultant-deal-list">
                        <div>
                          <span>Objetivo</span>
                          <strong>{selectedLead.objective}</strong>
                        </div>
                        <div>
                          <span>Diagnóstico</span>
                          <strong>{selectedLead.diagnosis}</strong>
                        </div>
                        <div>
                          <span>Dor principal</span>
                          <strong>{selectedLead.urgency}</strong>
                        </div>
                      </div>
                    </section>

                    <section className="consultant-deal-card">
                      <h3>Tags e leitura</h3>
                      <div className="consultant-deal-chip-cloud">
                        <span className="consultant-context-chip">{selectedLead.recommendedCategory}</span>
                        <span className="consultant-context-chip">{getLeadPriority(selectedLead)}</span>
                        <span className="consultant-context-chip">{selectedLead.status}</span>
                      </div>
                    </section>
                  </aside>

                  <div className="consultant-deal-main">
                    <section className="consultant-deal-card">
                      <div className="consultant-panel-header">
                        <h3>Atividade</h3>
                        <span>Próximo passo comercial</span>
                      </div>
                      <div className="consultant-deal-activity-composer">
                        <button
                          className="consultant-deal-composer-button"
                          type="button"
                          onClick={() => openActivityModal(selectedLead)}
                        >
                          Criar atividade para {selectedLead.contact}
                        </button>
                        <div className="consultant-deal-composer-hint">
                          <strong>Sugestão prática</strong>
                          <p>
                            Entrar citando {selectedLead.diagnosis.toLowerCase()} e conectar o próximo passo com{" "}
                            {selectedLead.objective.toLowerCase()}.
                          </p>
                        </div>
                      </div>
                    </section>

                    <section className="consultant-deal-card">
                      <div className="consultant-panel-header">
                        <h3>Histórico e atividades</h3>
                        <span>Timeline operacional</span>
                      </div>
                      <div className="consultant-deal-tabbar">
                        <button className="consultant-deal-tab active" type="button">
                          Atividades
                        </button>
                        <button className="consultant-deal-tab" type="button">
                          Histórico
                        </button>
                        <button className="consultant-deal-tab" type="button">
                          Notas
                        </button>
                      </div>
                      <div className="consultant-deal-timeline">
                        {leadActivitiesLoading ? (
                          <p className="result-cta-hint">Carregando atividades...</p>
                        ) : leadActivities.length > 0 ? (
                          leadActivities.map((activity) => (
                            <article className="consultant-deal-timeline-item" key={activity.id}>
                              <div className="consultant-deal-timeline-dot" />
                              <div className="consultant-deal-timeline-body">
                                <strong>{activity.title}</strong>
                                <span>
                                  {activity.channel || "Canal não informado"}
                                  {activity.due_date ? ` · ${activity.due_date}` : ""}
                                </span>
                                <p>{activity.note || "Atividade registrada para este lead."}</p>
                              </div>
                              <span className="consultant-context-chip">{activity.status}</span>
                            </article>
                          ))
                        ) : (
                          selectedLeadHistory.map((item) => (
                            <article className="consultant-deal-timeline-item" key={item.id}>
                              <div className="consultant-deal-timeline-dot" />
                              <div className="consultant-deal-timeline-body">
                                <strong>{item.title}</strong>
                                <span>{item.meta}</span>
                                <p>{item.body}</p>
                              </div>
                            </article>
                          ))
                        )}
                      </div>
                    </section>

                    <div className="consultant-deal-main-grid">
                      <section className="consultant-deal-card">
                        <div className="consultant-panel-header">
                          <h3>Notas do deal</h3>
                          <span>Leitura consolidada</span>
                        </div>
                        <p className="consultant-deal-note">
                          {selectedLead.diagnosisSummary || "Sem nota consolidada ainda para este lead."}
                        </p>
                      </section>

                      <section className="consultant-deal-card">
                        <div className="consultant-panel-header">
                          <h3>Próximos passos</h3>
                          <span>Plano recomendado</span>
                        </div>
                        <ul className="consultant-deal-next-steps">
                          <li>Confirmar aderência à dor principal e validar urgência.</li>
                          <li>Apresentar caminho comercial ligado a {selectedLead.recommendedCategory.toLowerCase()}.</li>
                          <li>Registrar atividade e mover o lead após resposta.</li>
                        </ul>
                      </section>
                    </div>
                  </div>
                </div>
              </section>
            ) : consultantSection === "dashboard" && (
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
                          <strong>Entradas por data</strong>
                          <span>
                            {dailyLeadSeries.reduce((total, item) => total + item.count, 0)} leads no período · pico de {maxDailyLeadCount}
                          </span>
                        </div>
                        <div className="consultant-line-chart consultant-line-chart-expanded">
                          <svg viewBox={`0 0 ${lineChartMetrics.width} ${lineChartMetrics.height}`} aria-hidden="true">
                            <defs>
                              <linearGradient id="consultantLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgba(249, 115, 22, 0.24)" />
                                <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
                              </linearGradient>
                            </defs>
                            {lineChartMetrics.gridLines.map((line) => (
                              <g key={line.tick}>
                                <path
                                  className="consultant-line-chart-gridline"
                                  d={`M ${lineChartMetrics.paddingLeft} ${line.y} H ${
                                    lineChartMetrics.paddingLeft + lineChartMetrics.chartWidth
                                  }`}
                                />
                                <text className="consultant-line-chart-axis-label" x="0" y={line.y + 4}>
                                  {line.tick}
                                </text>
                              </g>
                            ))}
                            <path className="consultant-line-chart-area" d={lineChartMetrics.areaPath} />
                            <path className="consultant-line-chart-path" d={lineChartPath} />
                            {lineChartMetrics.points.map((item) => {
                              return (
                                <g key={item.label}>
                                  <circle className="consultant-line-chart-dot" cx={item.x} cy={item.y} r="4" />
                                  <text className="consultant-line-chart-value" x={item.x} y={item.y - 12}>
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
                                  className={
                                    activeDonutStage?.label === segment.label
                                      ? "consultant-donut-segment active"
                                      : "consultant-donut-segment"
                                  }
                                  cx="70"
                                  cy="70"
                                  r="52"
                                  stroke={segment.color}
                                  strokeDasharray={`${segment.length} ${segment.circumference - segment.length}`}
                                  strokeDashoffset={segment.offset}
                                  onMouseEnter={() => setHoveredStageLabel(segment.label)}
                                  onMouseLeave={() => setHoveredStageLabel(null)}
                                />
                              ))}
                            </svg>
                            <div className="consultant-donut-center">
                              <strong>{(activeDonutStage?.value ?? totalStageCount).toString().padStart(2, "0")}</strong>
                              <span>{activeDonutStage?.label ?? "leads"}</span>
                            </div>
                          </div>
                          <div className="consultant-donut-legend">
                            {stageSeries.map((stage, index) => (
                              <button
                                className={
                                  activeDonutStage?.label === stage.label
                                    ? "consultant-donut-legend-row active"
                                    : "consultant-donut-legend-row"
                                }
                                key={stage.label}
                                type="button"
                                onMouseEnter={() => setHoveredStageLabel(stage.label)}
                                onMouseLeave={() => setHoveredStageLabel(null)}
                              >
                                <span
                                  className="consultant-donut-dot"
                                  style={{ backgroundColor: donutSegments[index]?.color }}
                                />
                                <strong>{stage.label}</strong>
                                <span>{stage.value.toString().padStart(2, "0")}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </article>
                    </div>

                    <div className="consultant-dashboard-metrics">
                      <article className="consultant-mini-dashboard-card">
                        <span>Melhor etapa agora</span>
                        <strong>{activeDonutStage?.label ?? "Novo lead"}</strong>
                        <small>{(activeDonutStage?.value ?? 0).toString().padStart(2, "0")} leads nesta etapa</small>
                      </article>
                      <article className="consultant-mini-dashboard-card">
                        <span>Novas entradas</span>
                        <strong>
                          {dailyLeadSeries[dailyLeadSeries.length - 1]?.count.toString().padStart(2, "0") ?? "00"}
                        </strong>
                        <small>Leads registrados na data mais recente</small>
                      </article>
                      <article className="consultant-mini-dashboard-card">
                        <span>Pipeline ativo</span>
                        <strong>{openPipelineCount.toString().padStart(2, "0")}</strong>
                        <small>{qualifiedCount.toString().padStart(2, "0")} com avanço comercial</small>
                      </article>
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
                  <span>{visibleLeadCount} leads no pipeline</span>
                </div>
                <div className="consultant-kanban-toolbar">
                  <div className="consultant-kanban-toolbar-group">
                    <button className="consultant-toolbar-icon active" type="button" aria-label="Visualização em kanban">
                      |||
                    </button>
                    <button className="consultant-toolbar-icon" type="button" aria-label="Visualização em lista">
                      ≣
                    </button>
                    <button className="consultant-toolbar-icon" type="button" aria-label="Atualizar pipeline">
                      ↻
                    </button>
                    <label className="consultant-kanban-search" aria-label="Buscar lead no pipeline">
                      <input
                        type="text"
                        placeholder="Buscar lead"
                        value={kanbanSearch}
                        onChange={(event) => setKanbanSearch(event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="consultant-kanban-toolbar-meta">
                    <span className="consultant-toolbar-total">
                      {openPipelineCount.toString().padStart(2, "0")} ativos · {conversionRate}% conversão
                    </span>
                    <button className="consultant-toolbar-select" type="button" onClick={() => setActiveToolModal("pipeline")}>
                      {consultantPipelineName}
                    </button>
                    <button className="consultant-toolbar-select" type="button" onClick={() => setActiveToolModal("filters")}>
                      Todos os leads
                    </button>
                  </div>
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
                          <div className="consultant-pipeline-column-actions">
                            <small>{column.leads.length}</small>
                            <button
                              className="consultant-pipeline-column-add"
                              type="button"
                              aria-label={`Adicionar negócio em ${column.label}`}
                              onClick={() => openDealCreateModal(null, column.label)}
                            >
                              +
                            </button>
                          </div>
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
                                  <span
                                    className={`consultant-pipeline-card-accent consultant-pipeline-card-accent-${toStatusClassName(lead.status)}`}
                                  />
                                  <div className="consultant-pipeline-card-head">
                                    <div className="consultant-pipeline-card-brand">
                                      <span className="consultant-pipeline-card-avatar">{getLeadInitials(lead)}</span>
                                      <strong>{lead.company}</strong>
                                    </div>
                                    <span className={`status-pill status-${toStatusClassName(lead.status)}`}>
                                      {lead.status}
                                    </span>
                                  </div>
                                  <div className="consultant-pipeline-card-person">
                                    <span>{lead.contact}</span>
                                    <small>{lead.role}</small>
                                  </div>
                                  <p>{lead.diagnosis}</p>
                                  <small className="consultant-pipeline-card-meta">{getLeadPreview(lead)}</small>
                                  <div className="consultant-pipeline-card-footer">
                                    <small>{lead.updatedAt}</small>
                                    <div className="consultant-pipeline-card-actions">
                                      <span className="consultant-context-chip">{lead.recommendedCategory}</span>
                                      <span className={`consultant-priority-chip ${getLeadPriorityClassName(lead)}`}>{getLeadPriority(lead)}</span>
                                    </div>
                                  </div>
                                  <div className="consultant-pipeline-card-quick-actions">
                                    <button
                                      className="consultant-card-action consultant-card-action-whatsapp"
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openLeadWhatsApp(lead);
                                      }}
                                    >
                                      WhatsApp
                                    </button>
                                    <button
                                      className="consultant-card-action consultant-card-action-secondary"
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openActivityModal(lead);
                                      }}
                                    >
                                      Atividade
                                    </button>
                                    <button
                                      className="consultant-card-action consultant-card-action-secondary"
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedLead(lead);
                                      }}
                                    >
                                      Abrir
                                    </button>
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

      {activeToolModal && (
        <div className="modal-overlay" role="presentation" onClick={closeToolModal}>
          <section
            className={`contact-modal consultant-tool-modal ${
              themeMode === "dark" ? "consultant-theme-dark" : "consultant-theme-light"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="consultant-tool-modal-title"
            onClick={stopLeadModalPropagation}
          >
            <div className="contact-modal-header consultant-tool-modal-header">
              <div>
                <p className="section-kicker">Operação rápida</p>
                <h2 id="consultant-tool-modal-title">
                  {activeToolModal === "pipeline"
                    ? "Configurar pipeline"
                    : activeToolModal === "activity"
                      ? "Criar atividade"
                      : activeToolModal === "filters"
                        ? "Filtros rápidos"
                        : activeToolModal === "deal-create"
                          ? "Adicionar negócio"
                        : "Criar novo"}
                </h2>
                <p>
                  {activeToolModal === "pipeline"
                    ? "Organize o funil atual e o nome exibido no board."
                    : activeToolModal === "activity"
                      ? "Adicione um próximo passo para o lead em foco."
                      : activeToolModal === "filters"
                        ? "Refine a visualização do board como em um CRM."
                        : activeToolModal === "deal-create"
                          ? "Crie um novo negócio com base nos dados do lead e do diagnóstico."
                        : "Escolha a próxima ação operacional do time."}
                </p>
              </div>
              <button className="modal-close" type="button" onClick={closeToolModal} aria-label="Fechar modal">
                ×
              </button>
            </div>

            {(toolError || toolSuccess) && (
              <div className={toolError ? "consultant-tool-feedback consultant-tool-feedback-error" : "consultant-tool-feedback consultant-tool-feedback-success"}>
                {toolError ?? toolSuccess}
              </div>
            )}

            {activeToolModal === "pipeline" && (
              <div className="consultant-tool-modal-grid">
                <div className="consultant-tool-summary-card consultant-tool-summary-card-hero">
                  <strong>Estrutura do funil</strong>
                  <span>Defina o nome do pipeline e revise como as etapas aparecem no board do parceiro.</span>
                </div>
                <label className="consultant-tool-field">
                  Nome do pipeline
                  <input
                    value={pipelineNameDraft}
                    onChange={(event) => setPipelineNameDraft(event.target.value)}
                    placeholder="Pipeline comercial"
                  />
                </label>
                <div className="consultant-tool-summary-card">
                  <strong>Etapas atuais</strong>
                  <div className="consultant-tool-pill-list">
                    {pipelineColumns.map((column) => (
                      <span key={column.id} className="consultant-context-chip">
                        {column.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="consultant-tool-inline-fields">
                  <div className="consultant-tool-summary-card">
                    <strong>Leads ativos</strong>
                    <span>{openPipelineCount.toString().padStart(2, "0")} no pipeline atual</span>
                  </div>
                  <div className="consultant-tool-summary-card">
                    <strong>Conversão</strong>
                    <span>{conversionRate}% da base com avanço real</span>
                  </div>
                </div>
                <div className="consultant-tool-modal-actions">
                  <button className="consultant-card-action" type="button" onClick={closeToolModal}>
                    Fechar
                  </button>
                  <button className="primary-button" type="button" onClick={handlePipelineSave} disabled={isSavingPipeline}>
                    {isSavingPipeline ? "Salvando..." : "Salvar pipeline"}
                  </button>
                </div>
              </div>
            )}

            {activeToolModal === "activity" && (
              <div className="consultant-tool-modal-grid">
                <div className="consultant-tool-summary-card">
                  <strong>Lead da atividade</strong>
                  <span>{activityLead ? `${activityLead.company} · ${activityLead.contact}` : "Lead em foco do board"}</span>
                </div>
                <div className="consultant-tool-inline-fields">
                  <div className="consultant-tool-summary-card">
                    <strong>Objetivo</strong>
                    <span>{activityLead?.objective ?? "Objetivo do lead em foco"}</span>
                  </div>
                  <div className="consultant-tool-summary-card">
                    <strong>Prioridade</strong>
                    <span>{activityLead ? getLeadPriority(activityLead) : "Nova oportunidade"}</span>
                  </div>
                </div>
                <label className="consultant-tool-field">
                  Título
                  <input
                    value={activityForm.title}
                    onChange={(event) => setActivityForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Ex: Follow-up comercial"
                  />
                </label>
                <div className="consultant-tool-inline-fields">
                  <label className="consultant-tool-field">
                    Data
                    <input
                      type="date"
                      value={activityForm.dueDate}
                      onChange={(event) => setActivityForm((current) => ({ ...current, dueDate: event.target.value }))}
                    />
                  </label>
                  <label className="consultant-tool-field">
                    Canal
                    <select
                      value={activityForm.channel}
                      onChange={(event) => setActivityForm((current) => ({ ...current, channel: event.target.value }))}
                    >
                      <option>WhatsApp</option>
                      <option>Ligação</option>
                      <option>Email</option>
                      <option>Reunião</option>
                    </select>
                  </label>
                </div>
                <label className="consultant-tool-field">
                  Observação
                  <textarea
                    value={activityForm.note}
                    onChange={(event) => setActivityForm((current) => ({ ...current, note: event.target.value }))}
                    rows={4}
                    placeholder="Contexto do próximo passo"
                  />
                </label>
                <div className="consultant-tool-summary-card">
                  <strong>Sugestão prática</strong>
                  <span>
                    {activityLead
                      ? `Entrar em contato citando ${activityLead.diagnosis.toLowerCase()} e puxar o próximo passo comercial.`
                      : "Criar uma atividade ligada ao lead em foco com data, canal e contexto."}
                  </span>
                </div>
                <div className="consultant-tool-modal-actions">
                  <button className="consultant-card-action" type="button" onClick={closeToolModal}>
                    Cancelar
                  </button>
                  <button className="primary-button" type="button" onClick={handleActivityCreate} disabled={isSavingActivity}>
                    {isSavingActivity ? "Salvando..." : "Criar atividade"}
                  </button>
                </div>
              </div>
            )}

            {activeToolModal === "filters" && (
              <div className="consultant-tool-modal-grid">
                <div className="consultant-tool-summary-card">
                  <strong>Filtrar board</strong>
                  <div className="consultant-tool-pill-list">
                    <span className="consultant-context-chip">Todos os leads</span>
                    <span className="consultant-context-chip">Quentes</span>
                    <span className="consultant-context-chip">Com atividade</span>
                    <span className="consultant-context-chip">Sem retorno</span>
                  </div>
                </div>
                <div className="consultant-tool-inline-fields">
                  <div className="consultant-tool-summary-card">
                    <strong>Visualização ativa</strong>
                    <span>{consultantPipelineName} · {visibleLeadCount} itens visíveis</span>
                  </div>
                  <div className="consultant-tool-summary-card">
                    <strong>Resumo do board</strong>
                    <span>{openPipelineCount.toString().padStart(2, "0")} ativos · {conversionRate}% conversão</span>
                  </div>
                </div>
                <div className="consultant-tool-modal-actions">
                  <button className="consultant-card-action" type="button" onClick={closeToolModal}>
                    Fechar
                  </button>
                </div>
              </div>
            )}

            {activeToolModal === "deal-create" && (
              <div className="consultant-tool-modal-grid consultant-deal-create-grid">
                <div className="consultant-deal-create-main">
                  <div className="consultant-tool-summary-card consultant-tool-summary-card-hero">
                    <strong>Novo negócio no pipeline</strong>
                    <span>Os leads costumam chegar preenchidos pelo quiz e pelo modal inicial. Aqui o time só complementa e organiza o deal.</span>
                  </div>

                  <label className="consultant-tool-field">
                    Pessoa de contato
                    <input
                      value={dealForm.contactName}
                      onChange={(event) => setDealForm((current) => ({ ...current, contactName: event.target.value }))}
                      placeholder="Nome do contato"
                    />
                  </label>

                  <label className="consultant-tool-field">
                    Organização
                    <input
                      value={dealForm.organization}
                      onChange={(event) => setDealForm((current) => ({ ...current, organization: event.target.value }))}
                      placeholder="Nome da empresa"
                    />
                  </label>

                  <label className="consultant-tool-field">
                    Título
                    <input
                      value={dealForm.title}
                      onChange={(event) => setDealForm((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Título do negócio"
                    />
                  </label>

                  <div className="consultant-tool-inline-fields">
                    <label className="consultant-tool-field">
                      Valor estimado
                      <input
                        value={dealForm.value}
                        onChange={(event) => setDealForm((current) => ({ ...current, value: event.target.value }))}
                        placeholder="12000"
                      />
                    </label>
                    <label className="consultant-tool-field">
                      Pipeline stage
                      <select
                        value={dealForm.stage}
                        onChange={(event) => setDealForm((current) => ({ ...current, stage: event.target.value }))}
                      >
                        {pipelineColumns.map((column) => (
                          <option key={column.id}>{column.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="consultant-tool-inline-fields">
                    <label className="consultant-tool-field">
                      Funil
                      <select
                        value={dealForm.funnel}
                        onChange={(event) => setDealForm((current) => ({ ...current, funnel: event.target.value }))}
                      >
                        <option>{consultantPipelineName}</option>
                      </select>
                    </label>
                    <label className="consultant-tool-field">
                      Etiqueta
                      <input
                        value={dealForm.tag}
                        onChange={(event) => setDealForm((current) => ({ ...current, tag: event.target.value }))}
                        placeholder="Lead do diagnóstico"
                      />
                    </label>
                  </div>

                  <div className="consultant-tool-inline-fields">
                    <label className="consultant-tool-field">
                      Data de fechamento esperada
                      <input
                        type="date"
                        value={dealForm.expectedCloseDate}
                        onChange={(event) =>
                          setDealForm((current) => ({ ...current, expectedCloseDate: event.target.value }))
                        }
                      />
                    </label>
                    <label className="consultant-tool-field">
                      Proprietário
                      <select
                        value={dealForm.owner}
                        onChange={(event) => setDealForm((current) => ({ ...current, owner: event.target.value }))}
                      >
                        <option>Resolva Seu Negócio (Você)</option>
                      </select>
                    </label>
                  </div>

                  <div className="consultant-tool-inline-fields">
                    <label className="consultant-tool-field">
                      Canal de origem
                      <select
                        value={dealForm.sourceChannel}
                        onChange={(event) => setDealForm((current) => ({ ...current, sourceChannel: event.target.value }))}
                      >
                        <option>Diagnóstico</option>
                        <option>Formulário</option>
                        <option>WhatsApp</option>
                        <option>Manual</option>
                      </select>
                    </label>
                    <label className="consultant-tool-field">
                      ID do canal de origem
                      <input
                        value={dealForm.sourceChannelId}
                        onChange={(event) => setDealForm((current) => ({ ...current, sourceChannelId: event.target.value }))}
                        placeholder="quiz-diagnostico"
                      />
                    </label>
                  </div>

                  <label className="consultant-tool-field">
                    Visível para
                    <select
                      value={dealForm.visibility}
                      onChange={(event) => setDealForm((current) => ({ ...current, visibility: event.target.value }))}
                    >
                      <option>Equipe comercial</option>
                      <option>Somente proprietário</option>
                    </select>
                  </label>
                </div>

                <aside className="consultant-deal-create-side">
                  <div className="consultant-tool-summary-card">
                    <strong>Pessoa</strong>
                    <div className="consultant-tool-inline-fields">
                      <label className="consultant-tool-field">
                        Telefone
                        <input
                          value={dealForm.phone}
                          onChange={(event) => setDealForm((current) => ({ ...current, phone: event.target.value }))}
                          placeholder="(85) 99999-1001"
                        />
                      </label>
                      <label className="consultant-tool-field">
                        Cargo
                        <input
                          value={dealForm.role}
                          onChange={(event) => setDealForm((current) => ({ ...current, role: event.target.value }))}
                          placeholder="CEO"
                        />
                      </label>
                    </div>
                    <label className="consultant-tool-field">
                      E-mail
                      <input
                        value={dealForm.email}
                        onChange={(event) => setDealForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="email@empresa.com"
                      />
                    </label>
                  </div>

                  <div className="consultant-tool-summary-card">
                    <strong>Pré-preenchimento do lead</strong>
                    <span>{activeLead ? `${activeLead.company} · ${activeLead.contact}` : "Sem lead em foco"}</span>
                    <div className="consultant-tool-pill-list">
                      <span className="consultant-context-chip">{activeLead?.recommendedCategory ?? "Categoria"}</span>
                      <span className="consultant-context-chip">{activeLead?.objective ?? "Objetivo"}</span>
                    </div>
                  </div>

                  <div className="consultant-tool-summary-card">
                    <strong>Resumo operacional</strong>
                    <span>{activeLead?.diagnosis ?? "Diagnóstico do lead em foco"}</span>
                    <span>{activeLead?.diagnosisSummary ?? "Resumo do diagnóstico"}</span>
                  </div>
                </aside>

                <div className="consultant-tool-modal-actions consultant-deal-create-actions">
                  <button className="consultant-card-action" type="button" onClick={closeToolModal}>
                    Cancelar
                  </button>
                  <button className="primary-button" type="button" onClick={handleDealCreate} disabled={isSavingDeal}>
                    {isSavingDeal ? "Salvando..." : "Salvar negócio"}
                  </button>
                </div>
              </div>
            )}

            {activeToolModal === "quick-create" && (
              <div className="consultant-tool-quick-grid">
                <button className="consultant-tool-quick-card" type="button" onClick={() => openDealCreateModal(activeLead)}>
                  <strong>Novo negócio</strong>
                  <span>Criar um novo deal já puxando o contexto do lead mais quente.</span>
                </button>
                <button className="consultant-tool-quick-card" type="button" onClick={() => setActiveToolModal("activity")}>
                  <strong>Nova atividade</strong>
                  <span>Criar follow-up, ligação, email ou reunião para um lead do pipeline.</span>
                </button>
                <button className="consultant-tool-quick-card" type="button" onClick={() => setActiveToolModal("pipeline")}>
                  <strong>Novo funil</strong>
                  <span>Preparar um pipeline novo para outra operação.</span>
                </button>
                <button className="consultant-tool-quick-card" type="button" onClick={() => setActiveToolModal("filters")}>
                  <strong>Filtrar board</strong>
                  <span>Refinar a leitura do pipeline por contexto comercial.</span>
                </button>
                <button className="consultant-tool-quick-card" type="button" onClick={() => setSelectedLead(activeLead)}>
                  <strong>Abrir lead em foco</strong>
                  <span>Ir direto para o lead mais urgente do board.</span>
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
