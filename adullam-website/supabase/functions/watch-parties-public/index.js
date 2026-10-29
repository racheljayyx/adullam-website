import { adminClient } from '../_shared/supabase.js'
import { errorResponse, handleOptions, jsonResponse, readJson } from '../_shared/http.js'
import { cleanInteger, cleanString, cleanUuid, extractPostcodeArea, normaliseLocation } from '../_shared/validation.js'

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    const body = await readJson(request)
    const admin = adminClient()

    if (body.action === 'details') {
      const id = cleanUuid(body.id, 'Watch party')
      const { data, error } = await admin.from('public_watch_parties').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      if (!data) throw Object.assign(new Error('This watch party is no longer available.'), { status: 404 })
      return jsonResponse(request, { party: data })
    }

    if (body.action !== 'search') throw Object.assign(new Error('Unknown action.'), { status: 400 })
    const location = cleanString(body.location, 'Location', { min: 2, max: 120 })
    const radiusMiles = cleanInteger(body.radiusMiles, 'Search radius', { allowed: [5, 10, 25, 50], min: 5, max: 50 })
    const locationNormalised = normaliseLocation(location)
    const postcode = extractPostcodeArea(location)

    const { data, error } = await admin.from('public_watch_parties').select('*').limit(100)
    if (error) throw error

    const parties = (data || []).filter((party) => {
      if (party.registration_status !== 'open' || party.remaining_capacity < 1) return false
      const localityMatch = party.city_normalized === locationNormalised
        || party.neighbourhood_normalized === locationNormalised
        || party.city_normalized.includes(locationNormalised)
        || party.neighbourhood_normalized.includes(locationNormalised)
      return localityMatch || (postcode && party.postcode_area === postcode)
    })

    return jsonResponse(request, { parties, radiusMiles, matchMethod: 'locality' })
  } catch (error) {
    return errorResponse(request, error)
  }
})
