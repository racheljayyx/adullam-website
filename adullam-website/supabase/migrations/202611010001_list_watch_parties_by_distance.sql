begin;

create or replace function public.list_available_watch_parties_by_distance(
  p_longitude double precision,
  p_latitude double precision
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
  order by extensions.st_distance(wp.location, search_point), wp.name;
end;
$$;

revoke all on function public.list_available_watch_parties_by_distance(double precision, double precision) from public, anon, authenticated;
grant execute on function public.list_available_watch_parties_by_distance(double precision, double precision) to service_role;

commit;
