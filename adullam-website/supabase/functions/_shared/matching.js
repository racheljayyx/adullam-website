import { button, emailFrame, escapeHtml, sendEmail, siteUrl } from './email.js'
import { createPreferenceToken } from './security.js'

export async function notifyMatches(admin, partyId) {
  const { data: party, error: partyError } = await admin
    .from('watch_parties')
    .select('id, name, city, neighbourhood, status, registration_status')
    .eq('id', partyId)
    .maybeSingle()
  if (partyError) throw partyError
  if (!party || party.status !== 'approved' || party.registration_status !== 'open') return { sent: 0, skipped: 0, failed: 0 }

  const { data: matches, error: matchError } = await admin.rpc('matching_interest_for_party', { p_watch_party_id: partyId })
  if (matchError) throw matchError

  const results = { sent: 0, skipped: 0, failed: 0 }

  for (const match of matches || []) {
    const { data: hasCapacity, error: capacityError } = await admin.rpc('party_has_capacity', {
      p_watch_party_id: partyId,
      p_group_size: match.group_size,
    })
    if (capacityError) throw capacityError
    if (!hasCapacity) {
      results.skipped += 1
      continue
    }

    const { data: claimed, error: claimError } = await admin.rpc('claim_party_notification', {
      p_interest_id: match.interest_id,
      p_watch_party_id: partyId,
    })
    if (claimError) throw claimError
    if (!claimed) {
      results.skipped += 1
      continue
    }

    try {
      const preferenceToken = await createPreferenceToken(match.interest_id, match.preferences_token_version)
      const joinUrl = siteUrl(`/watch-parties/${party.id}`)
      const preferencesUrl = siteUrl(`/watch-parties/preferences?token=${encodeURIComponent(preferenceToken)}`)
      const response = await sendEmail({
        to: match.recipient_email,
        subject: `A watch party is now available in ${party.city}`,
        idempotencyKey: `party-match/${match.interest_id}/${party.id}`,
        html: emailFrame(`
          <h1 style="font-size:28px;line-height:1.2;margin:0 0 18px">A new watch party is nearby</h1>
          <p>Hi ${escapeHtml(match.recipient_name)},</p>
          <p><strong>${escapeHtml(party.name)}</strong> has opened in ${escapeHtml(party.neighbourhood)}, ${escapeHtml(party.city)} and may be a good match for you.</p>
          <p>Places are not reserved by this invitation, so register if you would like to attend.</p>
          ${button('View this watch party', joinUrl)}
          <p style="font-size:13px;color:#666">You received this because you asked for watch-party alerts. <a href="${escapeHtml(preferencesUrl)}">Manage preferences or unsubscribe</a>.</p>
        `, `A watch party is now available in ${party.city}.`),
      })

      await admin.from('notification_log').update({
        status: 'sent', provider_message_id: response.id, sent_at: new Date().toISOString(), error_message: null,
      }).eq('interest_id', match.interest_id).eq('watch_party_id', partyId).eq('notification_type', 'party_match')
      await admin.from('interest_list').update({ last_notified_at: new Date().toISOString() }).eq('id', match.interest_id)
      results.sent += 1
    } catch (error) {
      await admin.from('notification_log').update({ status: 'failed', error_message: String(error.message).slice(0, 1000) })
        .eq('interest_id', match.interest_id).eq('watch_party_id', partyId).eq('notification_type', 'party_match')
      results.failed += 1
    }
  }

  return results
}
