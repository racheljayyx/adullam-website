function toHex(bytes) {
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return toHex(bytes)
}

export async function sha256(value) {
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
}

async function hmac(value) {
  const secret = Deno.env.get('PREFERENCES_SIGNING_SECRET')
  if (!secret || secret.length < 32) throw new Error('PREFERENCES_SIGNING_SECRET must contain at least 32 characters.')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)))
}

export async function createPreferenceToken(interestId, version = 1) {
  const payload = `${interestId}.${version}`
  return `${payload}.${await hmac(payload)}`
}

export async function verifyPreferenceToken(token) {
  if (typeof token !== 'string') return null
  const [interestId, version, signature] = token.split('.')
  if (!interestId || !version || !signature) return null
  const expected = await hmac(`${interestId}.${version}`)
  if (signature.length !== expected.length) return null
  let difference = 0
  for (let index = 0; index < signature.length; index += 1) difference |= signature.charCodeAt(index) ^ expected.charCodeAt(index)
  return difference === 0 ? { interestId, version: Number(version) } : null
}

export async function enforceRateLimit(request, admin, action, limit, windowSeconds) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const clientIp = request.headers.get('cf-connecting-ip') || forwarded || 'unknown'
  const salt = Deno.env.get('RATE_LIMIT_SALT') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!salt) throw new Error('Rate-limit hashing is not configured.')
  const keyHash = await sha256(`${salt}:${clientIp}`)
  const { data, error } = await admin.rpc('consume_rate_limit', {
    p_key_hash: keyHash,
    p_action: action,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  })
  if (error) throw error
  if (!data) throw Object.assign(new Error('Too many requests. Please wait and try again.'), { status: 429 })
}
