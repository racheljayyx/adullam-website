import { adminClient } from '../_shared/supabase.js'
import { errorResponse, handleOptions, jsonResponse, readJson } from '../_shared/http.js'
import { sha256, verifyPreferenceToken } from '../_shared/security.js'
import { cleanInteger, cleanString, extractPostcodeArea, normaliseLocation } from '../_shared/validation.js'

async function authorisedInterest(admin, token) {
  const parsed = await verifyPreferenceToken(token)
  if (!parsed) throw Object.assign(new Error('This preference link is invalid.'), { status: 401 })
  const { data, error } = await admin.from('interest_list')
    .select('id, location_query, search_radius_miles, group_size, active, verified_at, preferences_token_version')
    .eq('id', parsed.interestId).eq('preferences_token_version', parsed.version).maybeSingle()
  if (error) throw error
  if (!data) throw Object.assign(new Error('This preference link is no longer active.'), { status: 401 })
  return data
}

function publicPreferences(interest) {
  return {
    location: interest.location_query,
    radiusMiles: interest.search_radius_miles,
    groupSize: interest.group_size,
    active: interest.active,
  }
}

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    const body = await readJson(request)
    const admin = adminClient()

    if (body.action === 'verify') {
      const tokenHash = await sha256(cleanString(body.token, 'Verification token', { min: 32, max: 200 }))
      const { data: interest, error } = await admin.from('interest_list')
        .select('id, verification_expires_at').eq('verification_token_hash', tokenHash).maybeSingle()
      if (error) throw error
      if (!interest) throw Object.assign(new Error('This verification link is invalid or has already been used.'), { status: 400 })
      if (!interest.verification_expires_at || new Date(interest.verification_expires_at) < new Date()) {
        throw Object.assign(new Error('This verification link has expired. Register for alerts again to receive a new one.'), { status: 400 })
      }
      const { error: updateError } = await admin.from('interest_list').update({
        verified_at: new Date().toISOString(), active: true, verification_token_hash: null, verification_expires_at: null,
      }).eq('id', interest.id)
      if (updateError) throw updateError
      return jsonResponse(request, { verified: true })
    }

    if (body.action === 'get') {
      const interest = await authorisedInterest(admin, body.token)
      return jsonResponse(request, { preferences: publicPreferences(interest) })
    }

    if (body.action === 'update') {
      const interest = await authorisedInterest(admin, body.token)
      const location = cleanString(body.location, 'Town or postcode', { min: 2, max: 120 })
      const radiusMiles = cleanInteger(body.radiusMiles, 'Search radius', { allowed: [5, 10, 25, 50], min: 5, max: 50 })
      const groupSize = cleanInteger(body.groupSize, 'Group size', { min: 1, max: 50 })
      const active = body.active === true
      if (active && !interest.verified_at) throw Object.assign(new Error('Verify your email before enabling alerts.'), { status: 400 })
      const { data, error } = await admin.from('interest_list').update({
        location_query: location, location_normalized: normaliseLocation(location),
        postcode_area: extractPostcodeArea(location), search_radius_miles: radiusMiles,
        group_size: groupSize, active, unsubscribed_at: active ? null : new Date().toISOString(),
      }).eq('id', interest.id).select('location_query, search_radius_miles, group_size, active').single()
      if (error) throw error
      return jsonResponse(request, { preferences: publicPreferences(data) })
    }

    throw Object.assign(new Error('Unknown action.'), { status: 400 })
  } catch (error) {
    return errorResponse(request, error)
  }
})

