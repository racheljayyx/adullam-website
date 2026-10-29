import test from 'node:test'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'

const shouldRun = process.env.RUN_SUPABASE_INTEGRATION_TESTS === 'true'
  && Boolean(process.env.SUPABASE_URL)
  && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  && Boolean(process.env.SUPABASE_PUBLISHABLE_KEY)

test('concurrent reservations cannot overbook and private registrations remain unreadable', { skip: !shouldRun }, async () => {
  const service = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const browser = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const marker = crypto.randomUUID()
  let eventId
  let partyId

  try {
    const { data: event, error: eventError } = await service.from('events').insert({
      name: `Concurrency test ${marker}`,
      slug: `concurrency-${marker}`,
      status: 'live',
    }).select('id').single()
    assert.ifError(eventError)
    eventId = event.id

    const { data: party, error: partyError } = await service.from('watch_parties').insert({
      event_id: eventId,
      status: 'approved',
      host_name: 'Integration Test Host',
      host_email: `host-${marker}@example.com`,
      name: `Concurrency Party ${marker}`,
      city: 'Nottingham',
      city_normalized: 'nottingham',
      neighbourhood: 'Dunkirk',
      neighbourhood_normalized: 'dunkirk',
      maximum_capacity: 10,
      venue_type: 'community_space',
      consented_at: new Date().toISOString(),
    }).select('id').single()
    assert.ifError(partyError)
    partyId = party.id

    const reserve = (suffix) => service.rpc('reserve_watch_party', {
      p_watch_party_id: partyId,
      p_attendee_name: `Concurrent Attendee ${suffix}`,
      p_attendee_email: `concurrent-${suffix}-${marker}@example.com`,
      p_group_size: 6,
      p_consented_at: new Date().toISOString(),
    })
    const [first, second] = await Promise.all([reserve('a'), reserve('b')])
    assert.equal([first, second].filter((result) => !result.error).length, 1)
    assert.equal([first, second].filter((result) => result.error).length, 1)

    const { data: registrations, error: readError } = await service.from('registrations').select('group_size').eq('watch_party_id', partyId)
    assert.ifError(readError)
    assert.equal(registrations.reduce((total, registration) => total + registration.group_size, 0), 6)

    const { data: publicRegistrations, error: publicReadError } = await browser.from('registrations').select('*')
    assert.equal(publicRegistrations, null)
    assert.ok(publicReadError)
  } finally {
    if (partyId) await service.from('registrations').delete().eq('watch_party_id', partyId)
    if (partyId) await service.from('watch_parties').delete().eq('id', partyId)
    if (eventId) await service.from('events').delete().eq('id', eventId)
  }
})

