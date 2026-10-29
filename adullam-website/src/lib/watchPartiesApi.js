import { isSupabaseConfigured, supabase } from './supabase'

async function invoke(functionName, body) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Watch Parties is not connected yet. Add the Supabase environment variables to continue.',
    )
  }

  const { data, error } = await supabase.functions.invoke(functionName, { body })

  if (error) {
    let message = error.message || 'Something went wrong. Please try again.'

    if (error.context) {
      try {
        const details = await error.context.json()
        message = details.error || details.message || message
      } catch {
        // The response did not contain JSON; use the SDK error message.
      }
    }

    throw new Error(message)
  }

  return data
}

export const watchPartiesApi = {
  search: (filters) => invoke('watch-parties-public', {
    action: 'search',
    ...filters,
  }),
  details: (id) => invoke('watch-parties-public', {
    action: 'details',
    id,
  }),
  submitHost: (values) => invoke('submit-watch-party', values),
  book: (values) => invoke('create-booking', values),
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
  }),
  updatePreferences: (token, values) => invoke('manage-interest', {
    action: 'update',
    token,
    ...values,
  }),
  admin: (action, values = {}) => invoke('admin-watch-parties', {
    action,
    ...values,
  }),
}

