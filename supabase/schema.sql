-- CampusFix v2 reference schema for PostgreSQL/Supabase.
-- This is a fresh-install schema. Apply it to an empty project, then run seed.sql.
-- Authentication passwords remain in Supabase Auth and are never stored here.

create extension if not exists pgcrypto;

create type public.issue_priority as enum ('low','medium','high','critical','emergency');
create type public.issue_status as enum ('reported','ai_analysis','verified','assigned','acknowledged','in_progress','awaiting_parts','resolved','user_verification','closed','rejected','reopened','escalated','cancelled');
create type public.attachment_purpose as enum ('evidence','before','after');
create type public.notification_channel as enum ('in_app','email');
create type public.assignment_state as enum ('assigned','accepted','rejected','completed');

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 160),
  code text not null unique check (code ~ '^[A-Z0-9_-]{2,20}$'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campuses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  code text not null check (char_length(code) between 2 and 20),
  latitude numeric(9,6),
  longitude numeric(9,6),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (institution_id, code)
);

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references public.campuses(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 140),
  code text not null check (char_length(code) between 1 and 30),
  latitude numeric(9,6),
  longitude numeric(9,6),
  active boolean not null default true,
  unique (campus_id, code)
);

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  name text not null,
  floor_number smallint,
  unique (building_id, name)
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references public.floors(id) on delete cascade,
  name text not null,
  code text not null,
  facility_type text,
  active boolean not null default true,
  unique (floor_id, code)
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  code text not null,
  email text,
  active boolean not null default true,
  unique (institution_id, code)
);

create table public.roles (
  id smallint generated always as identity primary key,
  code text not null unique check (code in ('student','lecturer','maintenance','manager','admin','super_admin')),
  name text not null unique
);

create table public.permissions (
  id smallint generated always as identity primary key,
  code text not null unique,
  description text not null
);

create table public.role_permissions (
  role_id smallint not null references public.roles(id) on delete cascade,
  permission_id smallint not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id),
  campus_id uuid references public.campuses(id),
  department_id uuid references public.departments(id),
  role_id smallint not null references public.roles(id),
  full_name text not null check (char_length(full_name) between 2 and 120),
  staff_or_student_number text,
  active boolean not null default true,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.issue_categories (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  parent_id uuid references public.issue_categories(id) on delete set null,
  name text not null,
  default_department_id uuid references public.departments(id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (institution_id, parent_id, name)
);

create table public.sla_rules (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  priority public.issue_priority not null,
  category_id uuid references public.issue_categories(id) on delete cascade,
  response_minutes integer not null check (response_minutes > 0),
  resolution_minutes integer not null check (resolution_minutes > 0),
  active boolean not null default true,
  unique nulls not distinct (institution_id, priority, category_id)
);

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^CF-[0-9]+$'),
  institution_id uuid not null references public.institutions(id),
  campus_id uuid not null references public.campuses(id),
  building_id uuid references public.buildings(id),
  floor_id uuid references public.floors(id),
  room_id uuid references public.rooms(id),
  category_id uuid not null references public.issue_categories(id),
  reporter_id uuid not null references public.profiles(id),
  department_id uuid not null references public.departments(id),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 20 and 2000),
  ai_summary text,
  subcategory text,
  location_note text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  priority public.issue_priority not null default 'medium',
  status public.issue_status not null default 'reported',
  affected_users integer not null default 1 check (affected_users >= 1),
  safety_risk boolean not null default false,
  sla_response_due_at timestamptz,
  sla_resolution_due_at timestamptz,
  responded_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.issue_attachments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  purpose public.attachment_purpose not null default 'evidence',
  storage_path text not null unique,
  original_name text not null,
  media_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now()
);

create table public.issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null check (char_length(body) between 1 and 2000),
  internal_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.issue_status_history (
  id bigint generated always as identity primary key,
  issue_id uuid not null references public.issues(id) on delete cascade,
  old_status public.issue_status,
  new_status public.issue_status not null,
  changed_by uuid references public.profiles(id),
  note text,
  changed_at timestamptz not null default now()
);

create table public.issue_assignments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  department_id uuid not null references public.departments(id),
  staff_id uuid references public.profiles(id),
  assigned_by uuid not null references public.profiles(id),
  state public.assignment_state not null default 'assigned',
  rejection_reason text,
  assigned_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  completed_at timestamptz
);

create table public.issue_followers (
  issue_id uuid not null references public.issues(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (issue_id, user_id)
);

create table public.issue_votes (
  issue_id uuid not null references public.issues(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (issue_id, user_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  issue_id uuid references public.issues(id) on delete cascade,
  channel public.notification_channel not null default 'in_app',
  title text not null,
  body text not null,
  read_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.sla_events (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  sla_rule_id uuid not null references public.sla_rules(id),
  event_type text not null check (event_type in ('response_warning','response_breach','resolution_warning','resolution_breach','cleared')),
  occurred_at timestamptz not null default now(),
  acknowledged_by uuid references public.profiles(id),
  acknowledged_at timestamptz
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null unique references public.issues(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id),
  department_id uuid not null references public.departments(id),
  staff_id uuid references public.profiles(id),
  score smallint not null check (score between 1 and 5),
  feedback text check (char_length(feedback) <= 1000),
  resolution_minutes integer check (resolution_minutes >= 0),
  created_at timestamptz not null default now()
);

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  staff_id uuid not null references public.profiles(id),
  equipment_identifier text,
  work_performed text not null,
  parts_used text,
  cost numeric(12,2) check (cost >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.ai_analysis_results (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.issues(id) on delete cascade,
  analysis_type text not null check (analysis_type in ('classification','priority','duplicate','image','summary','trend','prediction','chat')),
  provider text not null,
  model text,
  input_hash text not null,
  result jsonb not null,
  confidence numeric(5,2) check (confidence between 0 and 100),
  human_reviewed_by uuid references public.profiles(id),
  human_reviewed_at timestamptz,
  accepted boolean,
  created_at timestamptz not null default now()
);

create table public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  analysis_id uuid references public.ai_analysis_results(id) on delete set null,
  recommendation_type text not null,
  recommendation text not null,
  safety_disclaimer text,
  accepted_by uuid references public.profiles(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  institution_id uuid not null references public.institutions(id),
  actor_id uuid references public.profiles(id),
  issue_id uuid references public.issues(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  previous_value jsonb,
  new_value jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role_id);
create index profiles_department_idx on public.profiles(department_id) where active;
create index buildings_campus_idx on public.buildings(campus_id);
create index rooms_floor_idx on public.rooms(floor_id);
create index categories_parent_idx on public.issue_categories(parent_id);
create index issues_reporter_idx on public.issues(reporter_id, created_at desc);
create index issues_queue_idx on public.issues(department_id, status, priority, created_at desc);
create index issues_location_idx on public.issues(campus_id, building_id, room_id);
create index issues_sla_idx on public.issues(sla_resolution_due_at) where status not in ('closed','cancelled','rejected');
create index issues_search_idx on public.issues using gin (to_tsvector('english', title || ' ' || description));
create index assignments_staff_idx on public.issue_assignments(staff_id, state);
create index notifications_unread_idx on public.notifications(user_id, created_at desc) where read_at is null;
create index audit_issue_idx on public.audit_logs(issue_id, created_at desc);
create index audit_actor_idx on public.audit_logs(actor_id, created_at desc);
create index ai_analysis_issue_idx on public.ai_analysis_results(issue_id, analysis_type, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger institutions_updated before update on public.institutions for each row execute function public.set_updated_at();
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger issues_updated before update on public.issues for each row execute function public.set_updated_at();
create trigger comments_updated before update on public.issue_comments for each row execute function public.set_updated_at();

create or replace function public.record_status_change() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='INSERT' or old.status is distinct from new.status then
    insert into public.issue_status_history(issue_id,old_status,new_status,changed_by)
    values(new.id,case when tg_op='INSERT' then null else old.status end,new.status,auth.uid());
  end if;
  return new;
end $$;
create trigger issue_status_audit after insert or update of status on public.issues for each row execute function public.record_status_change();

alter table public.profiles enable row level security;
alter table public.issues enable row level security;
alter table public.issue_attachments enable row level security;
alter table public.issue_comments enable row level security;
alter table public.issue_status_history enable row level security;
alter table public.issue_followers enable row level security;
alter table public.issue_votes enable row level security;
alter table public.notifications enable row level security;
alter table public.ratings enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_role() returns text language sql stable security definer set search_path=public as $$
  select r.code from public.profiles p join public.roles r on r.id=p.role_id where p.id=auth.uid() and p.active
$$;
create or replace function public.is_operational_role() returns boolean language sql stable security definer set search_path=public as $$
  select coalesce(public.current_role() in ('maintenance','manager','admin','super_admin'),false)
$$;

create policy profiles_self_or_admin on public.profiles for select to authenticated using (id=auth.uid() or public.current_role() in ('admin','super_admin'));
create policy issues_visible on public.issues for select to authenticated using (institution_id=(select institution_id from public.profiles where id=auth.uid()));
create policy issues_reporter_insert on public.issues for insert to authenticated with check (reporter_id=auth.uid() and status in ('reported','verified'));
create policy issues_operational_update on public.issues for update to authenticated using (public.is_operational_role()) with check (public.is_operational_role());
create policy attachments_visible on public.issue_attachments for select to authenticated using (exists(select 1 from public.issues i where i.id=issue_id));
create policy attachments_owner_or_staff_insert on public.issue_attachments for insert to authenticated with check (uploaded_by=auth.uid() and exists(select 1 from public.issues i where i.id=issue_id and (i.reporter_id=auth.uid() or public.is_operational_role())));
create policy comments_visible on public.issue_comments for select to authenticated using (not internal_only or public.is_operational_role());
create policy comments_author_insert on public.issue_comments for insert to authenticated with check (author_id=auth.uid());
create policy history_visible on public.issue_status_history for select to authenticated using (exists(select 1 from public.issues i where i.id=issue_id));
create policy followers_self on public.issue_followers for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy votes_self on public.issue_votes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy notifications_self on public.notifications for select to authenticated using (user_id=auth.uid());
create policy notifications_self_update on public.notifications for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy ratings_reporter on public.ratings for insert to authenticated with check (reporter_id=auth.uid());
create policy ratings_visible on public.ratings for select to authenticated using (reporter_id=auth.uid() or public.is_operational_role());
create policy audit_admin_only on public.audit_logs for select to authenticated using (public.current_role() in ('manager','admin','super_admin'));

grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant insert on public.issues, public.issue_attachments, public.issue_comments, public.issue_followers, public.issue_votes, public.ratings to authenticated;
grant update (status,priority,department_id,updated_at) on public.issues to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Storage policies, email provider, rate limits and provider-backed AI functions
-- must be configured in the deployment environment before real institutional use.
