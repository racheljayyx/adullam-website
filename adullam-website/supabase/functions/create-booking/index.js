import { adminClient } from '../_shared/supabase.js'
import { errorResponse, handleOptions, jsonResponse, readJson } from '../_shared/http.js'
import { enforceRateLimit } from '../_shared/security.js'
import { button, emailFrame, escapeHtml, sendEmail, siteUrl } from '../_shared/email.js'
import { cleanEmail, cleanInteger, cleanString, cleanUuid, rejectHoneypot, requireConsent } from '../_shared/validation.js'

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    const body = await readJson(request)
    if (rejectHoneypot(body.website)) return jsonResponse(request, { submitted: true })
    const admin = adminClient()
    await enforceRateLimit(request, admin, 'create-booking', 10, 3600)

    const partyId = cleanUuid(body.partyId, 'Watch party')
    const name = cleanString(body.name, 'Name', { min: 2, max: 100 })
    const email = cleanEmail(body.email)
    const groupSize = cleanInteger(body.groupSize, 'Group size', { min: 1, max: 50 })
    requireConsent(body.consent, 'Consent is required to create a booking.')

    const { data: reservation, error: reservationError } = await admin.rpc('reserve_watch_party', {
      p_watch_party_id: partyId, p_attendee_name: name, p_attendee_email: email,
      p_group_size: groupSize, p_consented_at: new Date().toISOString(),
    }).single()
    if (reservationError?.code === '23505') {
      const [{ data: existing, error: existingError }, { data: listing, error: listingError }] = await Promise.all([
        admin.from('registrations').select('id, attendee_email, group_size').eq('watch_party_id', partyId).eq('attendee_email', email).eq('status', 'confirmed').maybeSingle(),
        admin.from('public_watch_parties').select('remaining_capacity').eq('id', partyId).maybeSingle(),
      ])
      if (existingError) throw existingError
      if (listingError) throw listingError
      if (existing && listing) {
        return jsonResponse(request, {
          registration: { id: existing.id, email: existing.attendee_email, group_size: existing.group_size },
          remainingCapacity: listing.remaining_capacity,
          emailSent: null,
          duplicate: true,
        }, 200)
      }
    }
    if (reservationError) {
      const controlledMessage = [
        'This email already has a registration for this watch party.',
        'This watch party is not accepting registrations.',
        'Choose a valid group size.',
      ].find((message) => reservationError.message.includes(message))
      const capacityMessage = reservationError.message.match(/Only \d+ spaces remain\./)?.[0]
      throw Object.assign(new Error('Reservation failed.'), {
        status: 400,
        code: 'booking_unavailable',
        publicMessage: controlledMessage || capacityMessage || 'We could not reserve those spaces. Please refresh the party and try again.',
      })
    }

    const { data: party, error: partyError } = await admin.from('watch_parties').select('name, city, neighbourhood').eq('id', partyId).single()
    if (partyError) throw partyError

    let emailSent = true
    try {
      await sendEmail({
        to: email,
        subject: `Your place at ${party.name} is confirmed`,
        html: emailFrame(`<h1 style="font-size:28px;line-height:1.2;margin:0 0 18px">You're confirmed</h1><p>Hi ${escapeHtml(name)},</p><p>We reserved <strong>${groupSize} ${groupSize === 1 ? 'space' : 'spaces'}</strong> at ${escapeHtml(party.name)} in ${escapeHtml(party.neighbourhood)}, ${escapeHtml(party.city)}.</p><p>The organiser team will share any essential private joining information securely.</p>${button('View the watch party', siteUrl(`/watch-parties/${partyId}`))}`),
      })
    } catch (emailError) {
      console.error(emailError)
      emailSent = false
    }

    return jsonResponse(request, {
      registration: { id: reservation.registration_id, email, group_size: groupSize },
      remainingCapacity: reservation.remaining_capacity,
      emailSent,
    }, 201)
  } catch (error) {
    return errorResponse(request, error)
  }
})
