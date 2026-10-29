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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

export function errorResponse(request, error) {
  console.error(error)
  const status = Number(error?.status) || (error?.name === 'ValidationError' ? 400 : 500)
  const safeMessage = status >= 500 ? 'Something went wrong. Please try again.' : error.message
  return jsonResponse(request, { error: safeMessage }, status)
}
