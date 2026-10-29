import { createClient } from 'npm:@supabase/supabase-js@2'

function requiredEnvironment(name) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`${name} is not configured.`)
  return value
}

function injectedKey(dictionaryName, legacyName) {
  const dictionary = Deno.env.get(dictionaryName)
  if (dictionary) {
    try {
      const keys = JSON.parse(dictionary)
      if (keys.default) return keys.default
    } catch {
      throw new Error(`${dictionaryName} is not valid JSON.`)
    }
  }

  return requiredEnvironment(legacyName)
}

export function adminClient() {
  return createClient(
    requiredEnvironment('SUPABASE_URL'),
    injectedKey('SUPABASE_SECRET_KEYS', 'SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

export function authClient(accessToken) {
  return createClient(
    requiredEnvironment('SUPABASE_URL'),
    injectedKey('SUPABASE_PUBLISHABLE_KEYS', 'SUPABASE_ANON_KEY'),
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    },
  )
}

export async function requireAdmin(request) {
  const authorization = request.headers.get('authorization') || ''
  const token = authorization.replace(/^Bearer\s+/i, '')
  if (!token) throw Object.assign(new Error('Sign in to continue.'), { status: 401 })

  const auth = authClient(token)
  const { data: { user }, error: userError } = await auth.auth.getUser(token)
  if (userError || !user) throw Object.assign(new Error('Your session has expired. Sign in again.'), { status: 401 })

  const admin = adminClient()
  const { data: role, error: roleError } = await admin
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (roleError) throw roleError
  if (!role) throw Object.assign(new Error('You do not have organiser access.'), { status: 403 })
  return { user, role: role.role, admin }
}

export async function activeEvent(admin) {
  const { data, error } = await admin
    .from('events')
    .select('id, name, slug, status')
    .in('status', ['planned', 'live'])
    .order('starts_at', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) throw Object.assign(new Error('No active programme has been configured.'), { status: 503 })
  return data
}
