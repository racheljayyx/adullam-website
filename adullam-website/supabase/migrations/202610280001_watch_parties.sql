begin;

create extension if not exists pgcrypto with schema extensions;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'planned' check (status in ('planned', 'live', 'closed')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table public.watch_parties (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  registration_status text not null default 'open' check (registration_status in ('open', 'closed')),
  host_name text not null check (char_length(host_name) between 2 and 100),
  host_email text not null check (char_length(host_email) <= 254),
  host_phone text check (host_phone is null or char_length(host_phone) <= 40),
  name text not null check (char_length(name) between 2 and 120),
  city text not null check (char_length(city) between 2 and 100),
  city_normalized text not null check (char_length(city_normalized) between 2 and 100),
  neighbourhood text not null check (char_length(neighbourhood) between 2 and 100),
  neighbourhood_normalized text not null check (char_length(neighbourhood_normalized) between 2 and 100),
  postcode_area text check (postcode_area is null or char_length(postcode_area) between 2 and 4),
  private_address text check (private_address is null or char_length(private_address) <= 300),
  maximum_capacity integer not null check (maximum_capacity between 2 and 500),
  venue_type text not null check (venue_type in ('home', 'church', 'community_space', 'workplace', 'other')),
  description text check (description is null or char_length(description) <= 1000),
  accessibility_notes text check (accessibility_notes is null or char_length(accessibility_notes) <= 1000),
  consented_at timestamptz not null,
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index watch_parties_event_status_idx on public.watch_parties (event_id, status, registration_status);
create index watch_parties_location_idx on public.watch_parties (city_normalized, neighbourhood_normalized, postcode_area);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  watch_party_id uuid not null references public.watch_parties(id) on delete restrict,
  attendee_name text not null check (char_length(attendee_name) between 2 and 100),
  attendee_email text not null check (char_length(attendee_email) <= 254),
  group_size integer not null check (group_size between 1 and 50),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  consented_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index registrations_party_email_unique
  on public.registrations (watch_party_id, lower(attendee_email))
  where status = 'confirmed';
create index registrations_party_status_idx on public.registrations (watch_party_id, status);

create table public.interest_list (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  location_query text not null check (char_length(location_query) between 2 and 120),
  location_normalized text not null check (char_length(location_normalized) between 2 and 120),
  postcode_area text check (postcode_area is null or char_length(postcode_area) between 2 and 4),
  search_radius_miles integer not null check (search_radius_miles in (5, 10, 25, 50)),
  group_size integer not null check (group_size between 1 and 50),
  email_consent boolean not null check (email_consent = true),
  consented_at timestamptz not null,
  verified_at timestamptz,
  verification_token_hash text,
  verification_expires_at timestamptz,
  preferences_token_version integer not null default 1 check (preferences_token_version > 0),
  active boolean not null default false,
  unsubscribed_at timestamptz,
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index interest_event_email_unique on public.interest_list (event_id, lower(email));
create index interest_matching_idx on public.interest_list (event_id, active, location_normalized, postcode_area, group_size);

create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null references public.interest_list(id) on delete cascade,
  watch_party_id uuid not null references public.watch_parties(id) on delete cascade,
  notification_type text not null default 'party_match' check (notification_type in ('party_match', 'verification')),
  status text not null default 'processing' check (status in ('processing', 'sent', 'failed')),
  provider_message_id text,
  error_message text check (error_message is null or char_length(error_message) <= 1000),
  attempt_count integer not null default 1 check (attempt_count between 1 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (interest_id, watch_party_id, notification_type)
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'organiser' check (role in ('organiser', 'owner')),
  created_at timestamptz not null default now()
);

create table public.rate_limits (
  key_hash text not null,
  action text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (key_hash, action)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger watch_parties_set_updated_at before update on public.watch_parties for each row execute function public.set_updated_at();
create trigger registrations_set_updated_at before update on public.registrations for each row execute function public.set_updated_at();
create trigger interest_list_set_updated_at before update on public.interest_list for each row execute function public.set_updated_at();
create trigger notification_log_set_updated_at before update on public.notification_log for each row execute function public.set_updated_at();

create or replace function public.is_watch_party_admin(candidate_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = candidate_user_id
  );
$$;

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_row public.rate_limits%rowtype;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate-limit configuration';
  end if;

  insert into public.rate_limits (key_hash, action, window_started_at, request_count)
  values (p_key_hash, p_action, now(), 1)
  on conflict (key_hash, action) do update
    set window_started_at = case
      when public.rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
      else public.rate_limits.window_started_at
    end,
    request_count = case
      when public.rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
      else public.rate_limits.request_count + 1
    end
  returning * into current_row;

  return current_row.request_count <= p_limit;
end;
$$;

create or replace function public.reserve_watch_party(
  p_watch_party_id uuid,
  p_attendee_name text,
  p_attendee_email text,
  p_group_size integer,
  p_consented_at timestamptz
)
returns table (registration_id uuid, remaining_capacity integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  party public.watch_parties%rowtype;
  already_booked integer;
  new_registration_id uuid;
begin
  if p_group_size < 1 or p_group_size > 50 then
    raise exception using message = 'Choose a valid group size.', errcode = '22023';
  end if;

  select wp.* into party
  from public.watch_parties wp
  join public.events e on e.id = wp.event_id
  where wp.id = p_watch_party_id
    and wp.status = 'approved'
    and wp.registration_status = 'open'
    and e.status in ('planned', 'live')
  for update of wp;

  if not found then
    raise exception using message = 'This watch party is not accepting registrations.', errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.registrations
    where watch_party_id = p_watch_party_id
      and lower(attendee_email) = lower(trim(p_attendee_email))
      and status = 'confirmed'
  ) then
    raise exception using message = 'This email already has a registration for this watch party.', errcode = '23505';
  end if;

  select coalesce(sum(group_size), 0)::integer into already_booked
  from public.registrations
  where watch_party_id = p_watch_party_id and status = 'confirmed';

  if already_booked + p_group_size > party.maximum_capacity then
    raise exception using message = format('Only %s spaces remain.', party.maximum_capacity - already_booked), errcode = 'P0001';
  end if;

  insert into public.registrations (
    watch_party_id, attendee_name, attendee_email, group_size, consented_at
  ) values (
    p_watch_party_id, trim(p_attendee_name), lower(trim(p_attendee_email)), p_group_size, p_consented_at
  ) returning id into new_registration_id;

  return query select new_registration_id, party.maximum_capacity - already_booked - p_group_size;
end;
$$;

create or replace function public.party_has_capacity(p_watch_party_id uuid, p_group_size integer)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.watch_parties wp
    where wp.id = p_watch_party_id
      and wp.status = 'approved'
      and wp.registration_status = 'open'
      and wp.maximum_capacity - coalesce((
        select sum(r.group_size) from public.registrations r
        where r.watch_party_id = wp.id and r.status = 'confirmed'
      ), 0) >= p_group_size
  );
$$;

create or replace function public.claim_party_notification(p_interest_id uuid, p_watch_party_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_id uuid;
begin
  insert into public.notification_log (interest_id, watch_party_id, notification_type, status)
  values (p_interest_id, p_watch_party_id, 'party_match', 'processing')
  on conflict (interest_id, watch_party_id, notification_type) do update
    set status = 'processing',
        attempt_count = public.notification_log.attempt_count + 1,
        error_message = null
    where public.notification_log.attempt_count < 3
      and (
        (public.notification_log.status = 'failed' and public.notification_log.updated_at < now() - interval '5 minutes')
        or (public.notification_log.status = 'processing' and public.notification_log.updated_at < now() - interval '15 minutes')
      )
  returning id into claimed_id;

  return claimed_id is not null;
end;
$$;

create or replace function public.matching_interest_for_party(p_watch_party_id uuid)
returns table (
  interest_id uuid,
  recipient_name text,
  recipient_email text,
  group_size integer,
  preferences_token_version integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.name, i.email, i.group_size, i.preferences_token_version
  from public.interest_list i
  join public.watch_parties wp on wp.event_id = i.event_id
  where wp.id = p_watch_party_id
    and wp.status = 'approved'
    and wp.registration_status = 'open'
    and i.active = true
    and i.verified_at is not null
    and i.email_consent = true
    and i.unsubscribed_at is null
    and (
      i.location_normalized in (wp.city_normalized, wp.neighbourhood_normalized)
      or (i.postcode_area is not null and wp.postcode_area is not null and i.postcode_area = wp.postcode_area)
    )
    and public.party_has_capacity(wp.id, i.group_size)
  order by i.created_at;
$$;

alter table public.events enable row level security;
alter table public.watch_parties enable row level security;
alter table public.registrations enable row level security;
alter table public.interest_list enable row level security;
alter table public.notification_log enable row level security;
alter table public.admin_users enable row level security;
alter table public.rate_limits enable row level security;

create policy deny_browser_events on public.events for all to anon, authenticated using (false) with check (false);
create policy deny_browser_watch_parties on public.watch_parties for all to anon, authenticated using (false) with check (false);
create policy deny_browser_registrations on public.registrations for all to anon, authenticated using (false) with check (false);
create policy deny_browser_interest_list on public.interest_list for all to anon, authenticated using (false) with check (false);
create policy deny_browser_notification_log on public.notification_log for all to anon, authenticated using (false) with check (false);
create policy deny_browser_admin_users on public.admin_users for all to anon, authenticated using (false) with check (false);
create policy deny_browser_rate_limits on public.rate_limits for all to anon, authenticated using (false) with check (false);

revoke all on public.events, public.watch_parties, public.registrations, public.interest_list,
  public.notification_log, public.admin_users, public.rate_limits from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.is_watch_party_admin(uuid) from public, anon;
revoke all on function public.consume_rate_limit(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.reserve_watch_party(uuid, text, text, integer, timestamptz) from public, anon, authenticated;
revoke all on function public.party_has_capacity(uuid, integer) from public, anon, authenticated;
revoke all on function public.claim_party_notification(uuid, uuid) from public, anon, authenticated;
revoke all on function public.matching_interest_for_party(uuid) from public, anon, authenticated;

grant execute on function public.is_watch_party_admin(uuid) to authenticated, service_role;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
grant execute on function public.reserve_watch_party(uuid, text, text, integer, timestamptz) to service_role;
grant execute on function public.party_has_capacity(uuid, integer) to service_role;
grant execute on function public.claim_party_notification(uuid, uuid) to service_role;
grant execute on function public.matching_interest_for_party(uuid) to service_role;

create or replace view public.public_watch_parties
with (security_barrier = true)
as
select
  wp.id,
  wp.event_id,
  wp.name,
  wp.city,
  wp.city_normalized,
  wp.neighbourhood,
  wp.neighbourhood_normalized,
  wp.postcode_area,
  concat_ws(', ', wp.neighbourhood, wp.city) as approximate_location,
  wp.description,
  wp.accessibility_notes,
  wp.venue_type,
  case wp.venue_type
    when 'home' then 'Private home'
    when 'community_space' then 'Community space'
    else initcap(wp.venue_type)
  end as venue_type_label,
  wp.registration_status,
  wp.maximum_capacity,
  wp.maximum_capacity - coalesce(bookings.confirmed_people, 0) as remaining_capacity
from public.watch_parties wp
join public.events e on e.id = wp.event_id
left join lateral (
  select coalesce(sum(r.group_size), 0)::integer as confirmed_people
  from public.registrations r
  where r.watch_party_id = wp.id and r.status = 'confirmed'
) bookings on true
where wp.status = 'approved'
  and e.status in ('planned', 'live');

revoke all on public.public_watch_parties from public;
grant select on public.public_watch_parties to anon, authenticated, service_role;

commit;
