function configuredOrigins() {
  const configured = (Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('SITE_URL') || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
  return new Set(configured)
}

export function corsHeaders(request) {
  const origin = request.headers.get('origin') || ''
  const allowed = configuredOrigins()
  const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  const permittedOrigin = allowed.has(origin.replace(/\/$/, '')) || isLocal ? origin : ''

  return {
    ...(permittedOrigin ? { 'Access-Control-Allow-Origin': permittedOrigin } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, x-request-id, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
  }
}

export function jsonResponse(request, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request) })
}

export function handleOptions(request) {
  if (request.method !== 'OPTIONS') return null
  return new Response('ok', { headers: corsHeaders(request) })
}

export async function readJson(request) {
  const origin = request.headers.get('origin')
  if (origin && !corsHeaders(request)['Access-Control-Allow-Origin']) {
    throw Object.assign(new Error('Origin is not allowed.'), { status: 403 })
  }
  if (request.method !== 'POST') throw Object.assign(new Error('Method not allowed.'), { status: 405 })
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) throw Object.assign(new Error('Expected a JSON request.'), { status: 415 })
  try {
    return await request.json()
  } catch {
    throw Object.assign(new Error('The request body is invalid.'), { status: 400 })
  }
}

function errorCode(status, error) {
  if (error?.name === 'ValidationError') return 'validation_error'
  if (error?.code && !/^P?\d{4,5}$/.test(String(error.code))) return String(error.code)
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 422) return 'validation_error'
  if (status === 429) return 'rate_limited'
  if (status >= 500) return 'service_unavailable'
  return 'request_failed'
}

function publicMessage(status, error) {
  if (error?.publicMessage) return error.publicMessage
  if (error?.name === 'ValidationError' || [400, 401, 403, 404, 409, 422, 429].includes(status)) return error.message
  if (status >= 500) return 'The Watch Parties service is temporarily unavailable. Please try again in a moment.'
  return 'We could not complete that request. Please try again.'
}

export function errorResponse(request, error) {
  const status = Number(error?.status) || (error?.name === 'ValidationError' ? 400 : 500)
  const incomingRequestId = request.headers.get('x-request-id') || ''
  const requestId = /^[a-zA-Z0-9-]{8,100}$/.test(incomingRequestId) ? incomingRequestId : crypto.randomUUID()
  const code = errorCode(status, error)

  console.error(JSON.stringify({
    type: 'watch_party_request_error',
    requestId,
    operation: new URL(request.url).pathname.split('/').filter(Boolean).pop() || 'unknown',
    category: code,
    status,
    errorName: error?.name || 'Error',
    internalMessage: String(error?.message || 'Unknown error').slice(0, 500),
  }))

  return jsonResponse(request, { error: { code, message: publicMessage(status, error) }, requestId }, status)
}
