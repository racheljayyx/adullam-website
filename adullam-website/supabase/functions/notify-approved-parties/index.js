import { adminClient } from '../_shared/supabase.js'
import { errorResponse, jsonResponse } from '../_shared/http.js'
import { notifyMatches } from '../_shared/matching.js'

Deno.serve(async (request) => {
  try {
    if (request.method !== 'POST') throw Object.assign(new Error('Method not allowed.'), { status: 405 })
    const expected = Deno.env.get('MATCHING_CRON_SECRET')
    const provided = request.headers.get('x-matching-secret')
    if (!expected || !provided || provided !== expected) throw Object.assign(new Error('Unauthorised.'), { status: 401 })

    const admin = adminClient()
    const { data: parties, error } = await admin.from('watch_parties').select('id').eq('status', 'approved').eq('registration_status', 'open')
    if (error) throw error
    const results = []
    for (const party of parties || []) results.push({ partyId: party.id, ...(await notifyMatches(admin, party.id)) })
    return jsonResponse(request, { results })
  } catch (error) {
    return errorResponse(request, error)
  }
})

