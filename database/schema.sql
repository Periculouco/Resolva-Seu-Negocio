-- Schema real do banco Supabase — Resolva Seu Negócio
-- Atualizado em 2026-04-02 para refletir o estado real das tabelas em produção.
-- Execute no SQL Editor do Supabase apenas em um banco novo.
-- Em banco existente, use migrations incrementais.

-- ============================================================
-- partner_profiles
-- Um registro por parceiro autenticado.
-- instance_slug identifica o tenant operacional.
-- ============================================================
create table if not exists partner_profiles (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references auth.users(id) on delete cascade,
  instance_slug text        not null unique,
  partner_name  text        not null,
  role          text        not null default 'consultor',
  pipeline_name text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- leads
-- Criados pelo empresário via modal de contato (source_screen = 'result_modal')
-- ou manualmente pelo parceiro (source_screen = 'consultor_manual').
-- Vinculados ao parceiro pelo partner_instance_slug.
-- ============================================================
create table if not exists leads (
  id                          uuid        primary key default gen_random_uuid(),
  partner_instance_slug       text        not null,
  company                     text,
  contact_name                text        not null,
  contact_email               text        not null,
  contact_phone               text,
  contact_role                text,
  challenge                   text,
  revenue_profile             text,
  revenue_profile_label       text,
  business_moment             text,
  business_moment_label       text,
  decision_making             text,
  decision_making_label       text,
  current_bottleneck          text,
  current_bottleneck_label    text,
  solution_experience         text,
  solution_experience_label   text,
  primary_goal                text,
  primary_goal_label          text,
  main_pain                   text,
  diagnosis_title             text        not null,
  diagnosis_summary           text,
  inferred_area               text,
  recommended_category        text,
  recommended_specialist_name text,
  source_screen               text,
  status                      text        not null default 'Novo',
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- ============================================================
-- partner_activities
-- Atividades de follow-up criadas pelo parceiro, vinculadas a um lead.
-- ============================================================
create table if not exists partner_activities (
  id                    uuid        primary key default gen_random_uuid(),
  partner_instance_slug text        not null,
  lead_id               uuid        references leads(id) on delete set null,
  title                 text        not null,
  due_date              text,
  channel               text,
  note                  text,
  status                text        not null default 'Pendente',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- partner_agenda
-- Reuniões e compromissos do parceiro.
-- ============================================================
create table if not exists partner_agenda (
  id                    uuid        primary key default gen_random_uuid(),
  partner_instance_slug text        not null,
  title                 text        not null,
  company               text,
  starts_at             timestamptz not null,
  owner_name            text,
  status                text        not null default 'Pendente',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- partner_plan_applications
-- Aplicações de parceiros para planos via PartnerPitchScreen.
-- ============================================================
create table if not exists partner_plan_applications (
  id                    uuid        primary key default gen_random_uuid(),
  partner_name          text        not null,
  partner_email         text        not null,
  partner_specialty     text        not null,
  partner_portfolio_url text,
  plan_slug             text        not null,
  billing_cycle         text        not null default 'Mensal',
  source_screen         text,
  status                text        not null default 'Novo',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ============================================================
-- funnel_events
-- Eventos de funil para rastreio de comportamento.
-- Dados pessoais são sanitizados antes de inserir (ver eventsRepository.ts).
-- ============================================================
create table if not exists funnel_events (
  id                    uuid        primary key default gen_random_uuid(),
  event_name            text        not null,
  screen                text,
  partner_instance_slug text,
  lead_id               uuid,
  metadata              jsonb,
  created_at            timestamptz not null default now()
);

-- ============================================================
-- Índices
-- ============================================================
create index if not exists idx_leads_instance      on leads(partner_instance_slug);
create index if not exists idx_leads_status        on leads(status);
create index if not exists idx_leads_created_at    on leads(created_at desc);
create index if not exists idx_activities_instance on partner_activities(partner_instance_slug);
create index if not exists idx_activities_lead     on partner_activities(lead_id);
create index if not exists idx_agenda_instance     on partner_agenda(partner_instance_slug);
create index if not exists idx_events_name         on funnel_events(event_name);

-- ============================================================
-- RLS — políticas presentes em produção (documentação)
-- Não re-execute: já estão ativas no banco.
--
-- partner_profiles:
--   INSERT authenticated  → partner_profiles_insert_own
--   SELECT authenticated  → partner_profiles_select_own
--   UPDATE authenticated  → partner_profiles_update_own
--
-- leads:
--   INSERT anon+auth      → leads_insert_public
--   SELECT authenticated  → leads_select_by_instance (usa current_instance_slug())
--   UPDATE authenticated  → leads_update_by_instance
--
-- partner_activities:
--   INSERT authenticated  → partner_activities_insert_own_instance
--   SELECT authenticated  → partner_activities_select_own_instance
--
-- partner_agenda:
--   INSERT authenticated  → partner_agenda_insert_by_instance
--   SELECT authenticated  → partner_agenda_select_by_instance
--   UPDATE authenticated  → partner_agenda_update_by_instance
--
-- partner_plan_applications:
--   INSERT anon+auth      → partner_plan_applications_insert_anon
--
-- funnel_events:
--   INSERT anon+auth      → funnel_events_insert_public
--   SELECT authenticated  → funnel_events_select_authenticated
-- ============================================================
