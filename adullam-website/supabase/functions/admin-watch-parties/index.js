import { requireAdmin } from '../_shared/supabase.js'
import { errorResponse, handleOptions, jsonResponse, readJson } from '../_shared/http.js'
import { cleanUuid } from '../_shared/validation.js'
import { notifyMatches } from '../_shared/matching.js'
import { emailFrame, escapeHtml, sendEmail } from '../_shared/email.js'

function csvCell(value) {
  let string = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@]/.test(string.trimStart())) string = `'${string}`
  return `"${string.replaceAll('"', '""')}"`
}

async function overview(admin) {
  const [{ data: parties, error: partyError }, { data: registrations, error: registrationError }, { data: interests, error: interestError }] = await Promise.all([
    admin.from('watch_parties').select('id, name, status, registration_status, host_name, host_email, host_phone, city, neighbourhood, private_address, venue_postcode, maximum_capacity, venue_type, description, accessibility_notes, created_at').order('created_at', { ascending: false }),
    admin.from('registrations').select('id, watch_party_id, attendee_name, attendee_email, group_size, status, created_at, watch_parties(name)').order('created_at', { ascending: false }),
    admin.from('interest_list').select('group_size, active, verified_at'),
  ])
  if (partyError) throw partyError
  if (registrationError) throw registrationError
  if (interestError) throw interestError

  const confirmedByParty = new Map()
  for (const registration of registrations || []) {
    if (registration.status === 'confirmed') confirmedByParty.set(registration.watch_party_id, (confirmedByParty.get(registration.watch_party_id) || 0) + registration.group_size)
  }
  const approvedParties = (parties || []).filter((party) => party.status === 'approved').map((party) => {
    const confirmed = confirmedByParty.get(party.id) || 0
    return { ...party, confirmed_attendees: confirmed, remaining_capacity: Math.max(0, party.maximum_capacity - confirmed) }
  })
  const confirmedPeople = [...confirmedByParty.values()].reduce((total, count) => total + count, 0)

  return {
    stats: {
      pendingParties: (parties || []).filter((party) => party.status === 'pending').length,
      approvedParties: approvedParties.length,
      confirmedPeople,
      remainingSpaces: approvedParties.filter((party) => party.registration_status === 'open').reduce((total, party) => total + party.remaining_capacity, 0),
      waitingPeople: (interests || []).filter((interest) => interest.active && interest.verified_at).reduce((total, interest) => total + interest.group_size, 0),
    },
    pendingParties: (parties || []).filter((party) => party.status === 'pending'),
    approvedParties,
    registrations: (registrations || []).filter((registration) => registration.status === 'confirmed').slice(0, 100).map((registration) => ({ ...registration, party_name: registration.watch_parties?.name || 'Unknown party', watch_parties: undefined })),
  }
}

Deno.serve(async (request) => {
  const options = handleOptions(request)
  if (options) return options

  try {
    const body = await readJson(request)
    const { user, admin } = await requireAdmin(request)

    if (body.action === 'overview') return jsonResponse(request, await overview(admin))

    if (body.action === 'export') {
      const { data, error } = await admin.from('registrations').select('attendee_name, attendee_email, group_size, status, created_at, watch_parties(name, city, neighbourhood)').order('created_at')
      if (error) throw error
      const rows = [['Attendee name', 'Attendee email', 'Group size', 'Status', 'Watch party', 'Location', 'Registered at']]
      for (const registration of data || []) rows.push([registration.attendee_name, registration.attendee_email, registration.group_size, registration.status, registration.watch_parties?.name, `${registration.watch_parties?.neighbourhood || ''}, ${registration.watch_parties?.city || ''}`, registration.created_at])
      return jsonResponse(request, { csv: rows.map((row) => row.map(csvCell).join(',')).join('\r\n') })
    }

    const partyId = cleanUuid(body.partyId, 'Watch party')
    if (body.action === 'notify') {
      return jsonResponse(request, { notifications: await notifyMatches(admin, partyId) })
    }

    if (body.action === 'approve') {
      const { data: party, error } = await admin.from('watch_parties').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: user.id, rejected_at: null })
        .eq('id', partyId).eq('status', 'pending').select('id, name, host_name, host_email, city').maybeSingle()
      if (error) throw error
      if (!party) throw Object.assign(new Error('This party is no longer pending approval.'), { status: 409 })
      const notifications = await notifyMatches(admin, party.id)
      try {
        await sendEmail({ to: party.host_email, subject: `${party.name} has been approved`, html: emailFrame(`<h1 style="font-size:28px;line-height:1.2;margin:0 0 18px">Your watch party is approved</h1><p>Hi ${escapeHtml(party.host_name)},</p><p><strong>${escapeHtml(party.name)}</strong> is now visible to people searching in ${escapeHtml(party.city)}.</p>`) })
      } catch (emailError) { console.error(emailError) }
      return jsonResponse(request, { approved: true, notifications })
    }

    if (body.action === 'reject') {
      const { data, error } = await admin.from('watch_parties').update({ status: 'rejected', rejected_at: new Date().toISOString(), registration_status: 'closed' }).eq('id', partyId).eq('status', 'pending').select('id').maybeSingle()
      if (error) throw error
      if (!data) throw Object.assign(new Error('This party is no longer pending approval.'), { status: 409 })
      return jsonResponse(request, { rejected: true })
    }

    if (body.action === 'close') {
      const { data, error } = await admin.from('watch_parties').update({ registration_status: 'closed' }).eq('id', partyId).eq('status', 'approved').select('id').maybeSingle()
      if (error) throw error
      if (!data) throw Object.assign(new Error('This party could not be closed.'), { status: 409 })
      return jsonResponse(request, { closed: true })
    }

    throw Object.assign(new Error('Unknown action.'), { status: 400 })
  } catch (error) {
    return errorResponse(request, error)
  }
})
