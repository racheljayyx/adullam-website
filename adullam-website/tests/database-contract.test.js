import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const migrationUrl = new URL('../supabase/migrations/202610280001_watch_parties.sql', import.meta.url)
const sql = await readFile(migrationUrl, 'utf8')
const distanceSql = await readFile(new URL('../supabase/migrations/202610290001_postcode_distance.sql', import.meta.url), 'utf8')
const nearestFirstSql = await readFile(new URL('../supabase/migrations/202611010001_list_watch_parties_by_distance.sql', import.meta.url), 'utf8')
const idempotencySql = await readFile(new URL('../supabase/migrations/202611020001_watch_party_submission_idempotency.sql', import.meta.url), 'utf8')
const manageInterest = await readFile(new URL('../supabase/functions/manage-interest/index.js', import.meta.url), 'utf8')
const adminFunction = await readFile(new URL('../supabase/functions/admin-watch-parties/index.js', import.meta.url), 'utf8')
const submitHostFunction = await readFile(new URL('../supabase/functions/submit-watch-party/index.js', import.meta.url), 'utf8')
const createBookingFunction = await readFile(new URL('../supabase/functions/create-booking/index.js', import.meta.url), 'utf8')
const sharedHttp = await readFile(new URL('../supabase/functions/_shared/http.js', import.meta.url), 'utf8')

test('capacity reservation locks the party row before counting bookings', () => {
  const reservationFunction = sql.slice(sql.indexOf('create or replace function public.reserve_watch_party'), sql.indexOf('create or replace function public.party_has_capacity'))
  assert.match(reservationFunction, /for update of wp/i)
  assert.match(reservationFunction, /already_booked \+ p_group_size > party\.maximum_capacity/i)
})

test('duplicate bookings and duplicate notifications are constrained in the database', () => {
  assert.match(sql, /registrations_party_email_unique/i)
  assert.match(sql, /unique \(interest_id, watch_party_id, notification_type\)/i)
  assert.match(sql, /on conflict \(interest_id, watch_party_id, notification_type\)/i)
})

test('all private tables enable RLS and revoke browser-role access', () => {
  for (const table of ['events', 'watch_parties', 'registrations', 'interest_list', 'notification_log', 'admin_users', 'rate_limits']) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, 'i'))
  }
  assert.match(sql, /revoke all on public\.events[\s\S]*from public, anon, authenticated/i)
  assert.match(sql, /create policy deny_browser_registrations[\s\S]*using \(false\) with check \(false\)/i)
})

test('the public view omits private host and attendee fields', () => {
  const view = sql.slice(sql.indexOf('create or replace view public.public_watch_parties'))
  assert.doesNotMatch(view, /host_email/)
  assert.doesNotMatch(view, /host_phone/)
  assert.doesNotMatch(view, /private_address/)
  assert.doesNotMatch(view, /attendee_email/)
})

test('matching runs after verification and can be retried safely by an organiser', () => {
  assert.match(manageInterest, /await notifyMatches\(admin, party\.id\)/)
  assert.match(adminFunction, /body\.action === 'notify'/)
  assert.match(sql, /unique \(interest_id, watch_party_id, notification_type\)/i)
})

test('postcode distance matching uses private PostGIS points and a genuine radius', () => {
  assert.match(distanceSql, /create extension if not exists postgis with schema extensions/i)
  assert.match(distanceSql, /using gist \(location\)/i)
  assert.match(distanceSql, /extensions\.st_dwithin\(i\.location, wp\.location, i\.search_radius_miles \* 1609\.344\)/i)
  assert.match(distanceSql, /grant execute on function public\.search_watch_parties_by_distance[\s\S]*to service_role/i)
  assert.doesNotMatch(distanceSql, /grant execute on function public\.search_watch_parties_by_distance[\s\S]*to (anon|authenticated)/i)

  const publicReturnShape = distanceSql.slice(
    distanceSql.indexOf('returns table ('),
    distanceSql.indexOf('language plpgsql'),
  )
  assert.doesNotMatch(publicReturnShape, /private_address|venue_postcode|location extensions/i)
})

test('public discovery lists every available party from closest to furthest', () => {
  assert.match(nearestFirstSql, /wp\.status = 'approved'/i)
  assert.match(nearestFirstSql, /wp\.registration_status = 'open'/i)
  assert.match(nearestFirstSql, /wp\.maximum_capacity - bookings\.confirmed_people > 0/i)
  assert.match(nearestFirstSql, /order by extensions\.st_distance\(wp\.location, search_point\)/i)
  assert.doesNotMatch(nearestFirstSql, /st_dwithin/i)
  assert.match(nearestFirstSql, /grant execute on function public\.list_available_watch_parties_by_distance[\s\S]*to service_role/i)
  assert.doesNotMatch(nearestFirstSql, /grant execute on function public\.list_available_watch_parties_by_distance[\s\S]*to (anon|authenticated)/i)
})

test('host retries cannot create duplicate applications', () => {
  assert.match(idempotencySql, /add column submission_key uuid/i)
  assert.match(idempotencySql, /unique index watch_parties_submission_key_unique/i)
  assert.match(submitHostFunction, /submission_key: submissionKey/i)
  assert.match(submitHostFunction, /error\?\.code === '23505'/i)
})

test('booking retries return the existing registration instead of duplicating attendance', () => {
  assert.match(createBookingFunction, /reservationError\?\.code === '23505'/i)
  assert.match(createBookingFunction, /duplicate: true/i)
  assert.match(createBookingFunction, /from\('registrations'\)/i)
})

test('Edge Functions return structured errors with correlation identifiers', () => {
  assert.match(sharedHttp, /x-request-id/i)
  assert.match(sharedHttp, /requestId/i)
  assert.match(sharedHttp, /error: \{ code, message:/i)
  assert.doesNotMatch(sharedHttp, /\{ error: safeMessage \}/i)
})
