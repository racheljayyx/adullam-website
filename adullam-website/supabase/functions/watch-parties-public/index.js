import { adminClient } from '../_shared/supabase.js'
import { errorResponse, handleOptions, jsonResponse, readJson } from '../_shared/http.js'
import { enforceRateLimit } from '../_shared/security.js'
import { cleanUuid } from '../_shared/validation.js'
import { geocodeUkPostcode } from '../_shared/geocoding.js'

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
    await enforceRateLimit(request, admin, 'postcode-search', 60, 3600)
    const geocoded = await geocodeUkPostcode(body.postcode || body.location)
    const { data, error } = await admin.rpc('list_available_watch_parties_by_distance', {
      p_longitude: geocoded.longitude,
      p_latitude: geocoded.latitude,
    })
    if (error) throw error

    return jsonResponse(request, {
      parties: data || [],
      searchedPostcode: geocoded.postcode,
      matchMethod: 'nearest-first',
    })
  } catch (error) {
    return errorResponse(request, error)
  }
})
