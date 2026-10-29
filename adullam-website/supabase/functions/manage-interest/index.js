import { adminClient } from '../_shared/supabase.js'
import { errorResponse, handleOptions, jsonResponse, readJson } from '../_shared/http.js'
import { sha256, verifyPreferenceToken } from '../_shared/security.js'
import { cleanInteger, cleanString, normaliseLocation } from '../_shared/validation.js'
import { notifyMatches } from '../_shared/matching.js'
import { geocodeUkPostcode } from '../_shared/geocoding.js'

async function authorisedInterest(admin, token) {
  const parsed = await verifyPreferenceToken(token)
  if (!parsed) throw Object.assign(new Error('This preference link is invalid.'), { status: 401 })
  const { data, error } = await admin.from('interest_list')
    .select('id, postcode, location_query, search_radius_miles, group_size, active, verified_at, preferences_token_version')
    .eq('id', parsed.interestId).eq('preferences_token_version', parsed.version).maybeSingle()
  if (error) throw error
  if (!data) throw Object.assign(new Error('This preference link is no longer active.'), { status: 401 })
  return data
}

function publicPreferences(interest) {
  return {
    postcode: interest.postcode || interest.location_query,
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
        .select('id, event_id, verification_expires_at').eq('verification_token_hash', tokenHash).maybeSingle()
      if (error) throw error
      if (!interest) throw Object.assign(new Error('This verification link is invalid or has already been used.'), { status: 400 })
      if (!interest.verification_expires_at || new Date(interest.verification_expires_at) < new Date()) {
        throw Object.assign(new Error('This verification link has expired. Register for alerts again to receive a new one.'), { status: 400 })
      }
      const { error: updateError } = await admin.from('interest_list').update({
        verified_at: new Date().toISOString(), active: true, verification_token_hash: null, verification_expires_at: null,
      }).eq('id', interest.id)
      if (updateError) throw updateError

      // Approval may have happened while the verification email was waiting to be opened.
      // Check existing open parties now so a newly verified person is not missed.
      const notifications = { sent: 0, skipped: 0, failed: 0 }
      try {
        const { data: parties, error: partyError } = await admin.from('watch_parties')
          .select('id')
          .eq('event_id', interest.event_id)
          .eq('status', 'approved')
          .eq('registration_status', 'open')
        if (partyError) throw partyError

        for (const party of parties || []) {
          const result = await notifyMatches(admin, party.id)
          notifications.sent += result.sent
          notifications.skipped += result.skipped
          notifications.failed += result.failed
        }
      } catch (notificationError) {
        // Verification must remain successful even if a notification provider is unavailable.
        console.error(notificationError)
        notifications.failed += 1
      }

      return jsonResponse(request, { verified: true, notifications })
    }

    if (body.action === 'get') {
      const interest = await authorisedInterest(admin, body.token)
      return jsonResponse(request, { preferences: publicPreferences(interest) })
    }

    if (body.action === 'update') {
      const interest = await authorisedInterest(admin, body.token)
      const geocoded = await geocodeUkPostcode(body.postcode || body.location)
      const radiusMiles = cleanInteger(body.radiusMiles, 'Search radius', { allowed: [5, 10, 25, 50], min: 5, max: 50 })
      const groupSize = cleanInteger(body.groupSize, 'Group size', { min: 1, max: 50 })
      const active = body.active === true
      if (active && !interest.verified_at) throw Object.assign(new Error('Verify your email before enabling alerts.'), { status: 400 })
      const locality = geocoded.region || geocoded.district || geocoded.postcode
      const { data, error } = await admin.from('interest_list').update({
        location_query: geocoded.postcode, location_normalized: normaliseLocation(locality),
        postcode_area: geocoded.outcode, postcode: geocoded.postcode, location: geocoded.point,
        search_radius_miles: radiusMiles,
        group_size: groupSize, active, unsubscribed_at: active ? null : new Date().toISOString(),
      }).eq('id', interest.id).select('postcode, location_query, search_radius_miles, group_size, active').single()
      if (error) throw error
      return jsonResponse(request, { preferences: publicPreferences(data) })
    }

    throw Object.assign(new Error('Unknown action.'), { status: 400 })
  } catch (error) {
    return errorResponse(request, error)
  }
})
