import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import FormField, { fieldClassName } from './FormField'
import InlineNotice from './InlineNotice'
import { radiusOptions } from '../../lib/watchPartyRules'
import { watchPartiesApi } from '../../lib/watchPartiesApi'

function InterestForm({ initialLocation = '', initialRadius = 10 }) {
  const [values, setValues] = useState({
    name: '',
    email: '',
    location: initialLocation,
    radiusMiles: initialRadius,
    groupSize: 1,
    consent: false,
    website: '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const updateValue = (event) => {
    const { name, value, type, checked } = event.target
    setValues((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('submitting')
    setError('')

    try {
      await watchPartiesApi.registerInterest(values)
      setStatus('success')
    } catch (submissionError) {
      setError(submissionError.message)
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className='rounded-2xl border border-emerald-200 bg-white p-7 text-center sm:p-10' role='status'>
        <CheckCircleIcon className='mx-auto h-12 w-12 text-emerald-700' aria-hidden='true' />
        <h3 className='mt-5 text-2xl font-semibold'>Check your inbox</h3>
        <p className='mx-auto mt-3 max-w-xl text-sm leading-6 text-black/65 sm:text-base'>
          We sent a verification link to <strong>{values.email}</strong>. Your alerts will only become active after you confirm your email address.
        </p>
        <Link to='/watch-parties/host' className='mt-6 inline-flex rounded-full border border-black px-5 py-3 text-sm font-bold hover:bg-black hover:text-white'>
          Host a Watch Party
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8'>
      <div className='grid gap-6 sm:grid-cols-2'>
        <FormField label='Name' name='interest-name' required>
          <input id='interest-name' name='name' value={values.name} onChange={updateValue} required maxLength='100' autoComplete='name' className={fieldClassName} />
        </FormField>
        <FormField label='Email' name='interest-email' required>
          <input id='interest-email' name='email' value={values.email} onChange={updateValue} required maxLength='254' type='email' autoComplete='email' className={fieldClassName} />
        </FormField>
        <FormField label='Town or postcode' name='interest-location' hint='We use this only to find relevant watch parties.' required>
          <input id='interest-location' name='location' value={values.location} onChange={updateValue} required maxLength='120' autoComplete='postal-code' className={fieldClassName} />
        </FormField>
        <FormField label='Preferred search radius' name='interest-radius' required>
          <select id='interest-radius' name='radiusMiles' value={values.radiusMiles} onChange={updateValue} className={fieldClassName}>
            {radiusOptions.map((radius) => <option key={radius} value={radius}>Within {radius} miles</option>)}
          </select>
        </FormField>
        <FormField label='Estimated group size' name='interest-group' required>
          <input id='interest-group' name='groupSize' value={values.groupSize} onChange={updateValue} required min='1' max='50' type='number' inputMode='numeric' className={fieldClassName} />
        </FormField>
      </div>

      <div className='absolute -left-[10000px] top-auto h-px w-px overflow-hidden' aria-hidden='true'>
        <label htmlFor='interest-website'>Website</label>
        <input id='interest-website' name='website' value={values.website} onChange={updateValue} tabIndex='-1' autoComplete='off' />
      </div>

      <label className='mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-[#F7F3EF] p-4 text-sm leading-6 text-black/70'>
        <input name='consent' type='checkbox' checked={values.consent} onChange={updateValue} required className='mt-1 h-4 w-4 accent-black' />
        <span>I consent to receive relevant watch-party availability emails. I understand that I can unsubscribe or change my preferences at any time.</span>
      </label>

      {error && <div className='mt-5'><InlineNotice tone='error'>{error}</InlineNotice></div>}

      <button disabled={status === 'submitting'} className='mt-6 w-full rounded-full bg-black px-6 py-3.5 font-bold text-white transition hover:bg-black/80 disabled:cursor-wait disabled:opacity-60 sm:w-auto'>
        {status === 'submitting' ? 'Saving your request…' : 'Notify Me When One Opens'}
      </button>
    </form>
  )
}

export default InterestForm

