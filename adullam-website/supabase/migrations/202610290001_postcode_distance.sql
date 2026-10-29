begin;

create extension if not exists postgis with schema extensions;

alter table public.watch_parties
  add column venue_postcode text,
  add column location extensions.geography(point, 4326),
  add constraint watch_parties_venue_postcode_format check (
    venue_postcode is null or venue_postcode ~ '^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$'
  );

alter table public.interest_list
  add column postcode text,
  add column location extensions.geography(point, 4326),
  add constraint interest_list_postcode_format check (
    postcode is null or postcode ~ '^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$'
  );

create index watch_parties_geo_idx on public.watch_parties using gist (location);
create index interest_list_geo_idx on public.interest_list using gist (location);

create or replace function public.search_watch_parties_by_distance(
  p_longitude double precision,
  p_latitude double precision,
  p_radius_miles integer
)
returns table (
  id uuid,
  event_id uuid,
  name text,
  city text,
  city_normalized text,
  neighbourhood text,
  neighbourhood_normalized text,
  postcode_area text,
  approximate_location text,
  description text,
  accessibility_notes text,
  venue_type text,
  venue_type_label text,
  registration_status text,
  maximum_capacity integer,
  remaining_capacity integer,
  distance_miles numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  search_point extensions.geography(point, 4326);
begin
  if p_radius_miles not in (5, 10, 25, 50) then
    raise exception using message = 'Choose a valid search radius.', errcode = '22023';
  end if;
  if p_longitude < -180 or p_longitude > 180 or p_latitude < -90 or p_latitude > 90 then
    raise exception using message = 'Invalid search coordinates.', errcode = '22023';
  end if;

  search_point := extensions.st_setsrid(extensions.st_makepoint(p_longitude, p_latitude), 4326)::extensions.geography;

  return query
  select
    wp.id,
    wp.event_id,
    wp.name,
    wp.city,
    wp.city_normalized,
    wp.neighbourhood,
    wp.neighbourhood_normalized,
    wp.postcode_area,
    concat_ws(', ', wp.neighbourhood, wp.city),
    wp.description,
    wp.accessibility_notes,
    wp.venue_type,
    case wp.venue_type
      when 'home' then 'Private home'
      when 'community_space' then 'Community space'
      else initcap(wp.venue_type)
    end,
    wp.registration_status,
    wp.maximum_capacity,
    wp.maximum_capacity - bookings.confirmed_people,
    round((extensions.st_distance(wp.location, search_point) / 1609.344)::numeric, 1)
  from public.watch_parties wp
  join public.events e on e.id = wp.event_id
  cross join lateral (
    select coalesce(sum(r.group_size), 0)::integer as confirmed_people
    from public.registrations r
    where r.watch_party_id = wp.id and r.status = 'confirmed'
  ) bookings
  where wp.status = 'approved'
    and wp.registration_status = 'open'
    and e.status in ('planned', 'live')
    and wp.location is not null
    and wp.maximum_capacity - bookings.confirmed_people > 0
    and extensions.st_dwithin(wp.location, search_point, p_radius_miles * 1609.344)
  order by wp.location operator(extensions.<->) search_point;
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
      (
        i.location is not null
        and wp.location is not null
        and extensions.st_dwithin(i.location, wp.location, i.search_radius_miles * 1609.344)
      )
      or (
        (i.location is null or wp.location is null)
        and (
          i.location_normalized in (wp.city_normalized, wp.neighbourhood_normalized)
          or (i.postcode_area is not null and wp.postcode_area is not null and i.postcode_area = wp.postcode_area)
        )
      )
    )
    and public.party_has_capacity(wp.id, i.group_size)
  order by i.created_at;
$$;

revoke all on function public.search_watch_parties_by_distance(double precision, double precision, integer) from public, anon, authenticated;
grant execute on function public.search_watch_parties_by_distance(double precision, double precision, integer) to service_role;

commit;
