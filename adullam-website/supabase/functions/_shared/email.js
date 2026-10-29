function requiredEnvironment(name) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`${name} is not configured.`)
  return value
}

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;',
  })[character])
}

export function siteUrl(path = '') {
  return `${requiredEnvironment('SITE_URL').replace(/\/$/, '')}${path}`
}

export async function sendEmail({ to, subject, html, replyTo, idempotencyKey }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requiredEnvironment('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: requiredEnvironment('EMAIL_FROM'),
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.message || 'Resend could not deliver the email.')
  return payload
}

export function emailFrame(content, preheader = '') {
  return `<!doctype html><html><body style="margin:0;background:#f7f3ef;color:#111;font-family:Arial,sans-serif"><span style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</span><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden"><tr><td style="background:#000;padding:24px 32px;color:#fff;font-size:20px;font-weight:700">Adullam Academy</td></tr><tr><td style="padding:32px;line-height:1.65">${content}<p style="margin-top:32px;color:#777;font-size:12px">Adullam Academy Limited · Company number 16153693</p></td></tr></table></td></tr></table></body></html>`
}

export function button(label, url) {
  return `<p style="margin:28px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;border-radius:999px;padding:13px 22px;font-weight:700">${escapeHtml(label)}</a></p>`
}
