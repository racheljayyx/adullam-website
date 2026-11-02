import { isSupabaseConfigured, supabase, supabasePublishableKey, supabaseUrl } from './supabase.js'

const DEFAULT_TIMEOUT_MS = 15_000
const RETRY_DELAY_MS = 500

export class WatchPartyApiError extends Error {
  constructor(message, { code = 'unknown', status = 0, retryable = false, requestId = null } = {}) {
    super(message)
    this.name = 'WatchPartyApiError'
    this.code = code
    this.status = status
    this.retryable = retryable
    this.requestId = requestId
  }
}

export function createRequestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  const bytes = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes)
  else for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

function serverErrorDetails(payload) {
  if (payload?.error && typeof payload.error === 'object') return payload.error
  if (typeof payload?.error === 'string') return { message: payload.error }
  if (typeof payload?.message === 'string') return { message: payload.message }
  return {}
}

export function httpError(status, payload = {}, { requiresAuth = false } = {}) {
  const details = serverErrorDetails(payload)
  const responseRequestId = payload?.requestId || null

  if (status === 401 && requiresAuth) {
    return new WatchPartyApiError('Your session has expired. Please sign in again to continue.', {
      code: 'session_expired', status, requestId: responseRequestId,
    })
  }
  if (status === 403) {
    return new WatchPartyApiError(details.message || 'You do not have permission to complete this action.', {
      code: details.code || 'forbidden', status, requestId: responseRequestId,
    })
  }
  if (status === 429) {
    return new WatchPartyApiError('There have been too many attempts. Please wait a moment and try again.', {
      code: 'rate_limited', status, requestId: responseRequestId,
    })
  }
  if (status >= 500) {
    const safeServiceMessage = ['email_delivery_failed', 'postcode_service_unavailable', 'service_unavailable'].includes(details.code)
      ? details.message
      : null
    return new WatchPartyApiError(
      safeServiceMessage || 'The Watch Parties service is temporarily unavailable. Please try again in a moment.',
      { code: details.code || 'service_unavailable', status, retryable: true, requestId: responseRequestId },
    )
  }

  return new WatchPartyApiError(details.message || 'We could not complete that request. Please check your details and try again.', {
    code: details.code || (status === 404 ? 'not_found' : status === 409 ? 'conflict' : 'request_failed'),
    status,
    requestId: responseRequestId,
  })
}

function networkError(error, timedOut) {
  if (timedOut || error?.name === 'AbortError') {
    return new WatchPartyApiError('The request took too long. Please try again.', {
      code: 'timeout', retryable: true,
    })
  }
  if (isOffline()) {
    return new WatchPartyApiError("You're offline. Check your internet connection and try again.", {
      code: 'offline', retryable: true,
    })
  }
  return new WatchPartyApiError("We couldn't connect to Watch Parties. Please try again. If the problem continues, check your connection.", {
    code: 'connection_failed', retryable: true,
  })
}

async function authToken(requiresAuth) {
  if (!requiresAuth) return supabasePublishableKey

  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) {
    throw new WatchPartyApiError('Your session has expired. Please sign in again to continue.', {
      code: 'session_expired', status: 401,
    })
  }

  if (data.session.expires_at && data.session.expires_at * 1000 <= Date.now() + 60_000) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
    if (refreshError || !refreshed.session) {
      throw new WatchPartyApiError('Your session has expired. Please sign in again to continue.', {
        code: 'session_expired', status: 401,
      })
    }
    return refreshed.session.access_token
  }

  return data.session.access_token
}

async function requestOnce(functionName, body, { timeoutMs, requiresAuth, token, clientRequestId }) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/${functionName}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabasePublishableKey,
        'Content-Type': 'application/json',
        'x-client-info': 'adullam-watch-parties-web/1.0',
        'x-request-id': clientRequestId,
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()
    let payload = {}
    if (text) {
      try {
        payload = JSON.parse(text)
      } catch {
        if (!response.ok) throw httpError(response.status, {}, { requiresAuth })
        throw new WatchPartyApiError('The service returned an unexpected response. Please try again.', {
          code: 'invalid_response', status: response.status, retryable: true,
        })
      }
    }

    if (!response.ok) throw httpError(response.status, payload, { requiresAuth })
    return payload
  } catch (error) {
    if (error instanceof WatchPartyApiError) throw error
    throw networkError(error, controller.signal.aborted)
  } finally {
    clearTimeout(timeout)
  }
}

async function invoke(functionName, body, { retries = 0, timeoutMs = DEFAULT_TIMEOUT_MS, requiresAuth = false } = {}) {
  if (!isSupabaseConfigured) {
    throw new WatchPartyApiError('The Watch Parties service is temporarily unavailable. Please try again later.', {
      code: 'configuration_error', status: 503,
    })
  }

  const operation = `${functionName}:${body?.action || 'request'}`
  const clientRequestId = createRequestId()
  let token = await authToken(requiresAuth)
  let refreshedAfterUnauthorized = false

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestOnce(functionName, body, { timeoutMs, requiresAuth, token, clientRequestId })
    } catch (error) {
      if (requiresAuth && error.code === 'session_expired' && !refreshedAfterUnauthorized) {
        refreshedAfterUnauthorized = true
        const { data, error: refreshError } = await supabase.auth.refreshSession()
        if (!refreshError && data.session) {
          token = data.session.access_token
          continue
        }
      }

      if (error.retryable && attempt < retries) {
        console.warn('[watch-parties] Retrying temporary failure', {
          operation, code: error.code, status: error.status, requestId: error.requestId || clientRequestId,
        })
        await wait(RETRY_DELAY_MS * (attempt + 1))
        continue
      }

      console.error('[watch-parties] Request failed', {
        operation, code: error.code, status: error.status, requestId: error.requestId || clientRequestId,
      })
      throw error
    }
  }

  throw new WatchPartyApiError('Something went wrong. Please try again.', { code: 'unknown' })
}

export const watchPartiesApi = {
  search: (filters) => invoke('watch-parties-public', {
    action: 'search',
    ...filters,
  }, { retries: 1 }),
  details: (id) => invoke('watch-parties-public', {
    action: 'details',
    id,
  }, { retries: 1 }),
  submitHost: (values) => invoke('submit-watch-party', values, { timeoutMs: 20_000 }),
  book: (values) => invoke('create-booking', values, { timeoutMs: 20_000 }),
  registerInterest: (values) => invoke('register-interest', {
    action: 'register',
    ...values,
  }),
  verifyInterest: (token) => invoke('manage-interest', {
    action: 'verify',
    token,
  }),
  getPreferences: (token) => invoke('manage-interest', {
    action: 'get',
    token,
  }, { retries: 1 }),
  updatePreferences: (token, values) => invoke('manage-interest', {
    action: 'update',
    token,
    ...values,
  }),
  admin: (action, values = {}) => invoke('admin-watch-parties', {
    action,
    ...values,
  }, { requiresAuth: true, retries: action === 'overview' ? 1 : 0, timeoutMs: 20_000 }),
}
