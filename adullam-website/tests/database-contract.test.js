import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const migrationUrl = new URL('../supabase/migrations/202610280001_watch_parties.sql', import.meta.url)
const sql = await readFile(migrationUrl, 'utf8')
const manageInterest = await readFile(new URL('../supabase/functions/manage-interest/index.js', import.meta.url), 'utf8')
const adminFunction = await readFile(new URL('../supabase/functions/admin-watch-parties/index.js', import.meta.url), 'utf8')

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
