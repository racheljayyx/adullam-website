import { activeEvent, adminClient } from '../_shared/supabase.js'
import { errorResponse, handleOptions, jsonResponse, readJson } from '../_shared/http.js'
import { enforceRateLimit } from '../_shared/security.js'
import { button, emailFrame, escapeHtml, sendEmail, siteUrl } from '../_shared/email.js'
import { cleanEmail, cleanInteger, cleanString, normaliseLocation, rejectHoneypot, requireConsent } from '../_shared/validation.js'
import { geocodeUkPostcode } from '../_shared/geocoding.js'

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    const body = await readJson(request)
    if (rejectHoneypot(body.website)) return jsonResponse(request, { submitted: true })

    const admin = adminClient()
    await enforceRateLimit(request, admin, 'submit-host', 5, 3600)
    const event = await activeEvent(admin)
    const hostName = cleanString(body.hostName, 'Host name', { min: 2, max: 100 })
    const email = cleanEmail(body.email)
    const phone = cleanString(body.phone, 'Contact number', { max: 40, optional: true })
    const partyName = cleanString(body.partyName, 'Watch party name', { min: 2, max: 120 })
    const city = cleanString(body.city, 'City or town', { min: 2, max: 100 })
    const neighbourhood = cleanString(body.neighbourhood, 'Neighbourhood', { min: 2, max: 100 })
    const addressLine1 = cleanString(body.addressLine1, 'Address line 1', { min: 2, max: 150 })
    const addressLine2 = cleanString(body.addressLine2, 'Address line 2', { max: 100, optional: true })
    const geocoded = await geocodeUkPostcode(body.postcode)
    const privateAddress = [addressLine1, addressLine2, city, geocoded.postcode].filter(Boolean).join(', ')
    const maximumCapacity = cleanInteger(body.maximumCapacity, 'Maximum capacity', { min: 2, max: 500 })
    const venueType = cleanString(body.venueType, 'Venue type', { max: 30 })
    if (!['home', 'church', 'community_space', 'workplace', 'other'].includes(venueType)) throw Object.assign(new Error('Choose a valid venue type.'), { status: 400 })
    const description = cleanString(body.description, 'Description', { max: 1000, optional: true })
    const accessibilityNotes = cleanString(body.accessibilityNotes, 'Accessibility notes', { max: 1000, optional: true })
    requireConsent(body.consent, 'Consent is required to submit a host application.')

    const { data: party, error } = await admin.from('watch_parties').insert({
      event_id: event.id, host_name: hostName, host_email: email, host_phone: phone,
      name: partyName, city, city_normalized: normaliseLocation(city), neighbourhood,
      neighbourhood_normalized: normaliseLocation(neighbourhood),
      postcode_area: geocoded.outcode, venue_postcode: geocoded.postcode,
      private_address: privateAddress, location: geocoded.point,
      maximum_capacity: maximumCapacity, venue_type: venueType, description,
      accessibility_notes: accessibilityNotes, consented_at: new Date().toISOString(), status: 'pending',
    }).select('id, status').single()
    if (error) throw error

    let emailSent = true
    try {
      await sendEmail({
        to: email,
        subject: 'We received your watch party application',
        html: emailFrame(`<h1 style="font-size:28px;line-height:1.2;margin:0 0 18px">Application received</h1><p>Hi ${escapeHtml(hostName)},</p><p>Thank you for offering to host <strong>${escapeHtml(partyName)}</strong>. Your application is pending organiser review and is not public yet.</p>${button('Visit Watch Parties', siteUrl('/watch-parties'))}`),
      })
    } catch (emailError) {
      console.error(emailError)
      emailSent = false
    }

    return jsonResponse(request, { submitted: true, party, emailSent }, 201)
  } catch (error) {
    return errorResponse(request, error)
  }
})
