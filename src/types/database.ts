export type LeadStatus = "Novo" | "Em contato" | "Qualificado" | "Reunião marcada" | "Perdido";

export type LeadInsert = {
  partner_instance_slug: string;
  company?: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone?: string | null;
  contact_role?: string | null;
  challenge?: string | null;
  revenue_profile?: string | null;
  revenue_profile_label?: string | null;
  business_moment?: string | null;
  business_moment_label?: string | null;
  decision_making?: string | null;
  decision_making_label?: string | null;
  main_pain?: string | null;
  current_bottleneck?: string | null;
  diagnosis_title: string;
  diagnosis_summary?: string | null;
  inferred_area?: string | null;
  recommended_category?: string | null;
  recommended_specialist_name?: string | null;
  solution_experience?: string | null;
  solution_experience_label?: string | null;
  primary_goal?: string | null;
  primary_goal_label?: string | null;
  current_bottleneck_label?: string | null;
  source_screen?: string | null;
  status?: LeadStatus;
};

export type LeadRow = {
  id: string;
  partner_instance_slug: string;
  company: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  contact_role: string | null;
  challenge: string | null;
  revenue_profile: string | null;
  revenue_profile_label: string | null;
  business_moment: string | null;
  business_moment_label: string | null;
  decision_making: string | null;
  decision_making_label: string | null;
  main_pain: string | null;
  current_bottleneck: string | null;
  diagnosis_title: string;
  diagnosis_summary: string | null;
  inferred_area: string | null;
  recommended_category: string | null;
  recommended_specialist_name: string | null;
  solution_experience: string | null;
  solution_experience_label: string | null;
  primary_goal: string | null;
  primary_goal_label: string | null;
  current_bottleneck_label: string | null;
  source_screen: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
};

export type FunnelEventInsert = {
  event_name: string;
  screen?: string | null;
  partner_instance_slug?: string | null;
  lead_id?: string | null;
  metadata?: Record<string, unknown>;
};

export type PartnerActivityStatus = "Pendente" | "Concluída";

export type PartnerActivityInsert = {
  partner_instance_slug: string;
  lead_id?: string | null;
  title: string;
  due_date?: string | null;
  channel?: string | null;
  note?: string | null;
  status?: PartnerActivityStatus;
};

export type PartnerActivityRow = {
  id: string;
  partner_instance_slug: string;
  lead_id: string | null;
  title: string;
  due_date: string | null;
  channel: string | null;
  note: string | null;
  status: PartnerActivityStatus;
  created_at: string;
  updated_at: string;
};

export type PartnerProfileRow = {
  id: string;
  user_id: string;
  instance_slug: string;
  partner_name: string;
  role: string;
  pipeline_name: string | null;
  created_at: string;
  updated_at: string;
};

export type PartnerAgendaRow = {
  id: string;
  partner_instance_slug: string;
  title: string;
  company: string | null;
  starts_at: string;
  owner_name: string | null;
  status: "Confirmada" | "Pendente" | "Cancelada";
  created_at: string;
  updated_at: string;
};
