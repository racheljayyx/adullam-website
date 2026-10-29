import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import WatchPartyShell from '../components/watch-parties/WatchPartyShell'
import FormField, { fieldClassName } from '../components/watch-parties/FormField'
import InlineNotice from '../components/watch-parties/InlineNotice'
import { radiusOptions } from '../lib/watchPartyRules'
import { watchPartiesApi } from '../lib/watchPartiesApi'

function WatchPartyPreferences() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [values, setValues] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('This preference link is incomplete.')
      setStatus('error')
      return
    }
    watchPartiesApi.getPreferences(token)
      .then((response) => {
        setValues(response.preferences)
        setStatus('ready')
      })
      .catch((loadError) => {
        setError(loadError.message)
        setStatus('error')
      })
  }, [token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('saving')
    setError('')
    try {
      const response = await watchPartiesApi.updatePreferences(token, values)
      setValues(response.preferences)
      setStatus('saved')
    } catch (saveError) {
      setError(saveError.message)
      setStatus('ready')
    }
  }

  return (
    <WatchPartyShell eyebrow='Email preferences' title='Manage your watch-party alerts' description='Update the area you are interested in or unsubscribe from future availability emails.' compact>
      <div className='mt-8 max-w-2xl'>
        {status === 'loading' && <p role='status'>Loading your preferences…</p>}
        {status === 'error' && <InlineNotice tone='error'>{error}</InlineNotice>}
        {values && (
          <form onSubmit={handleSubmit} className='space-y-6 rounded-2xl border border-black/10 bg-white p-6 sm:p-8'>
            <FormField label='Postcode' name='preference-postcode' hint='Kept private and used only for distance matching.' required><input id='preference-postcode' value={values.postcode} onChange={(event) => setValues({ ...values, postcode: event.target.value })} required maxLength='10' autoComplete='postal-code' className={fieldClassName} /></FormField>
            <FormField label='Search radius' name='preference-radius' required><select id='preference-radius' value={values.radiusMiles} onChange={(event) => setValues({ ...values, radiusMiles: Number(event.target.value) })} className={fieldClassName}>{radiusOptions.map((radius) => <option key={radius} value={radius}>Within {radius} miles</option>)}</select></FormField>
            <FormField label='Estimated group size' name='preference-group' required><input id='preference-group' value={values.groupSize} onChange={(event) => setValues({ ...values, groupSize: Number(event.target.value) })} min='1' max='50' type='number' className={fieldClassName} /></FormField>
            <label className='flex items-start gap-3 rounded-xl bg-[#F7F3EF] p-4 text-sm leading-6'><input type='checkbox' checked={values.active} onChange={(event) => setValues({ ...values, active: event.target.checked })} className='mt-1 h-4 w-4 accent-black' /><span>Keep my watch-party availability emails active. Untick this box to unsubscribe.</span></label>
            {error && <InlineNotice tone='error'>{error}</InlineNotice>}
            {status === 'saved' && <InlineNotice tone='success'>Your preferences have been saved.</InlineNotice>}
            <button disabled={status === 'saving'} className='rounded-full bg-black px-6 py-3 font-bold text-white disabled:opacity-60'>{status === 'saving' ? 'Saving…' : 'Save preferences'}</button>
          </form>
        )}
      </div>
    </WatchPartyShell>
  )
}

export default WatchPartyPreferences
