import { activeEvent, adminClient } from '../_shared/supabase.js'
import { errorResponse, handleOptions, jsonResponse, readJson } from '../_shared/http.js'
import { createPreferenceToken, enforceRateLimit, randomToken, sha256 } from '../_shared/security.js'
import { button, emailFrame, escapeHtml, sendEmail, siteUrl } from '../_shared/email.js'
import { cleanEmail, cleanInteger, cleanString, extractPostcodeArea, normaliseLocation, rejectHoneypot, requireConsent } from '../_shared/validation.js'

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    const body = await readJson(request)
    if (body.action !== 'register') throw Object.assign(new Error('Unknown action.'), { status: 400 })
    if (rejectHoneypot(body.website)) return jsonResponse(request, { submitted: true })

    const admin = adminClient()
    await enforceRateLimit(request, admin, 'register-interest', 5, 3600)
    const event = await activeEvent(admin)
    const name = cleanString(body.name, 'Name', { min: 2, max: 100 })
    const email = cleanEmail(body.email)
    const location = cleanString(body.location, 'Town or postcode', { min: 2, max: 120 })
    const radiusMiles = cleanInteger(body.radiusMiles, 'Search radius', { allowed: [5, 10, 25, 50], min: 5, max: 50 })
    const groupSize = cleanInteger(body.groupSize, 'Group size', { min: 1, max: 50 })
    requireConsent(body.consent, 'Email notification consent is required.')

    const verificationToken = randomToken()
    const verificationTokenHash = await sha256(verificationToken)
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()
    const commonValues = {
      name, email, location_query: location, location_normalized: normaliseLocation(location),
      postcode_area: extractPostcodeArea(location), search_radius_miles: radiusMiles,
      group_size: groupSize, email_consent: true, consented_at: now, active: false,
      verified_at: null, unsubscribed_at: null, verification_token_hash: verificationTokenHash,
      verification_expires_at: verificationExpiresAt,
    }

    const { data: existing, error: existingError } = await admin.from('interest_list')
      .select('id, preferences_token_version').eq('event_id', event.id).eq('email', email).maybeSingle()
    if (existingError) throw existingError

    let interest
    if (existing) {
      const { data, error } = await admin.from('interest_list').update(commonValues).eq('id', existing.id)
        .select('id, preferences_token_version').single()
      if (error) throw error
      interest = data
    } else {
      const { data, error } = await admin.from('interest_list').insert({ event_id: event.id, ...commonValues })
        .select('id, preferences_token_version').single()
      if (error) throw error
      interest = data
    }

    const preferenceToken = await createPreferenceToken(interest.id, interest.preferences_token_version)
    const verifyUrl = siteUrl(`/watch-parties/verify?token=${encodeURIComponent(verificationToken)}`)
    const preferencesUrl = siteUrl(`/watch-parties/preferences?token=${encodeURIComponent(preferenceToken)}`)

    try {
      await sendEmail({
        to: email,
        subject: 'Confirm your watch party alerts',
        html: emailFrame(`<h1 style="font-size:28px;line-height:1.2;margin:0 0 18px">Confirm your email</h1><p>Hi ${escapeHtml(name)},</p><p>Confirm that you would like watch-party alerts for ${escapeHtml(location)}. This link expires in 24 hours.</p>${button('Confirm my alerts', verifyUrl)}<p style="font-size:13px;color:#666">If you did not request this, you can ignore this message. <a href="${escapeHtml(preferencesUrl)}">Manage preferences</a>.</p>`, 'Confirm your watch-party availability alerts.'),
      })
    } catch (emailError) {
      throw Object.assign(new Error('We saved your request but could not send the verification email. Please try again shortly.'), { status: 503, cause: emailError })
    }

    return jsonResponse(request, { submitted: true, verificationRequired: true }, 201)
  } catch (error) {
    return errorResponse(request, error)
  }
})
