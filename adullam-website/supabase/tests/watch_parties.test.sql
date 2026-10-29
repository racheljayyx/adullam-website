begin;
select plan(22);

select has_table('public', 'events', 'events table exists');
select has_table('public', 'watch_parties', 'watch_parties table exists');
select has_table('public', 'registrations', 'registrations table exists');
select has_table('public', 'interest_list', 'interest_list table exists');
select has_table('public', 'notification_log', 'notification_log table exists');

select ok((select relrowsecurity from pg_class where oid = 'public.watch_parties'::regclass), 'watch_parties has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.registrations'::regclass), 'registrations has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.interest_list'::regclass), 'interest_list has RLS');
select ok(not has_table_privilege('anon', 'public.registrations', 'SELECT'), 'anon cannot read registrations');
select ok(not has_table_privilege('anon', 'public.interest_list', 'SELECT'), 'anon cannot read interest list');
select ok(not has_table_privilege('anon', 'public.watch_parties', 'SELECT'), 'anon cannot read private watch party table');
select ok(has_table_privilege('anon', 'public.public_watch_parties', 'SELECT'), 'anon can read only the sanitised view');
select ok(not has_function_privilege('anon', 'public.reserve_watch_party(uuid,text,text,integer,timestamptz)', 'EXECUTE'), 'anon cannot invoke atomic reservation directly');

insert into public.events (id, name, slug, status)
values ('10000000-0000-4000-8000-000000000001', 'Test Virtual Programme', 'test-virtual-programme', 'live');

insert into public.watch_parties (
  id, event_id, status, host_name, host_email, name, city, city_normalized,
  neighbourhood, neighbourhood_normalized, maximum_capacity, venue_type, consented_at
) values (
  '20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'pending',
  'Test Host', 'host@example.com', 'Nottingham Test Party', 'Nottingham', 'nottingham',
  'Dunkirk', 'dunkirk', 10, 'community_space', now()
);

select is((select count(*) from public.public_watch_parties where id = '20000000-0000-4000-8000-000000000001'), 0::bigint, 'pending party is not public');
update public.watch_parties set status = 'approved', approved_at = now() where id = '20000000-0000-4000-8000-000000000001';
select is((select count(*) from public.public_watch_parties where id = '20000000-0000-4000-8000-000000000001'), 1::bigint, 'approved party becomes public');

select is((
  select remaining_capacity from public.reserve_watch_party(
    '20000000-0000-4000-8000-000000000001', 'First Attendee', 'first@example.com', 6, now()
  )
), 4, 'a multi-space booking updates remaining capacity');

select throws_ok(
  $$select * from public.reserve_watch_party('20000000-0000-4000-8000-000000000001', 'Too Many', 'many@example.com', 5, now())$$,
  'P0001', 'Only 4 spaces remain.', 'capacity cannot be exceeded'
);

select throws_ok(
  $$select * from public.reserve_watch_party('20000000-0000-4000-8000-000000000001', 'Duplicate', 'first@example.com', 1, now())$$,
  '23505', 'This email already has a registration for this watch party.', 'duplicate party registration is rejected'
);

insert into public.interest_list (
  id, event_id, name, email, location_query, location_normalized,
  search_radius_miles, group_size, email_consent, consented_at, verified_at, active
) values (
  '30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
  'Interested Person', 'waiting@example.com', 'Nottingham', 'nottingham', 10, 2, true, now(), now(), true
);

select is((select count(*) from public.matching_interest_for_party('20000000-0000-4000-8000-000000000001')), 1::bigint, 'verified opted-in locality match is eligible');
select ok(public.claim_party_notification('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001'), 'first notification claim succeeds');
select ok(not public.claim_party_notification('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001'), 'duplicate notification claim is prevented');
select is((select count(*) from public.notification_log where interest_id = '30000000-0000-4000-8000-000000000001'), 1::bigint, 'only one notification log record exists');

select * from finish();
rollback;
