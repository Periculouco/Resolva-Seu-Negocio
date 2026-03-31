create extension if not exists "pgcrypto";

create table if not exists partner_instances (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  public_name text not null,
  category text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists partner_users (
  id uuid primary key default gen_random_uuid(),
  partner_instance_id uuid not null references partner_instances(id) on delete cascade,
  auth_user_id uuid unique,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('owner', 'manager', 'sdr', 'consultant')),
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists partner_profiles (
  id uuid primary key default gen_random_uuid(),
  partner_instance_id uuid not null references partner_instances(id) on delete cascade,
  display_name text not null,
  title text not null,
  bio text,
  focus text,
  whatsapp_number text,
  meeting_duration_minutes integer not null default 30,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'diagnostico',
  company_name text,
  contact_name text not null,
  email text not null,
  phone text not null,
  role text,
  main_pain text,
  challenge text,
  created_at timestamptz not null default now()
);

create table if not exists lead_diagnoses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references leads(id) on delete cascade,
  revenue_profile text,
  business_moment text,
  decision_making text,
  current_bottleneck text,
  solution_experience text,
  primary_goal text,
  inferred_area text,
  diagnosis_title text not null,
  diagnosis_summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  partner_instance_id uuid not null references partner_instances(id) on delete cascade,
  partner_profile_id uuid references partner_profiles(id) on delete set null,
  assigned_user_id uuid references partner_users(id) on delete set null,
  priority_score integer not null default 0,
  status text not null default 'new' check (status in ('new', 'contacting', 'qualified', 'meeting_booked', 'won', 'lost')),
  created_at timestamptz not null default now()
);

create table if not exists lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  partner_user_id uuid not null references partner_users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  partner_profile_id uuid not null references partner_profiles(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  slot_minutes integer not null default 30,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists blocked_slots (
  id uuid primary key default gen_random_uuid(),
  partner_profile_id uuid not null references partner_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  partner_profile_id uuid not null references partner_profiles(id) on delete cascade,
  partner_user_id uuid references partner_users(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  origin text not null default 'diagnostico',
  created_at timestamptz not null default now()
);

create index if not exists idx_partner_users_instance on partner_users(partner_instance_id);
create index if not exists idx_partner_profiles_instance on partner_profiles(partner_instance_id);
create index if not exists idx_lead_assignments_lead on lead_assignments(lead_id);
create index if not exists idx_lead_assignments_instance on lead_assignments(partner_instance_id);
create index if not exists idx_appointments_profile on appointments(partner_profile_id, starts_at);
