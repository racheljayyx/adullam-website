import { useState } from 'react'
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import WatchPartyShell from '../components/watch-parties/WatchPartyShell'
import FormField, { fieldClassName } from '../components/watch-parties/FormField'
import InlineNotice from '../components/watch-parties/InlineNotice'
import { watchPartiesApi } from '../lib/watchPartiesApi'

const initialValues = {
  hostName: '', email: '', phone: '', partyName: '', city: '', neighbourhood: '',
  privateAddress: '', maximumCapacity: 8, venueType: 'home', description: '',
  accessibilityNotes: '', consent: false, website: '',
}

function HostWatchParty() {
  const [values, setValues] = useState(initialValues)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(true)

  const updateValue = (event) => {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      const response = await watchPartiesApi.submitHost(values)
      setEmailSent(response.emailSent)
      setStatus('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (submissionError) {
      setError(submissionError.message)
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <WatchPartyShell eyebrow='Application received' title='Thank you for opening your doors.' compact>
        <div className='mt-8 max-w-2xl rounded-2xl border border-emerald-200 bg-white p-7 sm:p-10' role='status'>
          <CheckCircleIcon className='h-12 w-12 text-emerald-700' aria-hidden='true' />
          <h2 className='mt-5 text-2xl font-semibold'>Your watch party is awaiting review</h2>
          <p className='mt-3 leading-7 text-black/65'>The organiser team will review your application before anything appears publicly. {emailSent ? 'We have also sent a receipt to your email address.' : 'Your application is safe, but the email receipt could not be delivered.'}</p>
        </div>
      </WatchPartyShell>
    )
  }

  return (
    <WatchPartyShell
      eyebrow='Bring people together'
      title='Host a Watch Party'
      description='Create a welcoming local space for people to experience the virtual programme together. Every application is reviewed before it is published.'
      compact
    >
      <div className='mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]'>
        <form onSubmit={handleSubmit} className='rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8'>
          <div className='grid gap-6 sm:grid-cols-2'>
            <FormField label='Host name' name='host-name' required><input id='host-name' name='hostName' value={values.hostName} onChange={updateValue} required maxLength='100' autoComplete='name' className={fieldClassName} /></FormField>
            <FormField label='Email' name='host-email' required><input id='host-email' name='email' value={values.email} onChange={updateValue} required maxLength='254' type='email' autoComplete='email' className={fieldClassName} /></FormField>
            <FormField label='Contact number' name='host-phone' hint='Optional and never published'><input id='host-phone' name='phone' value={values.phone} onChange={updateValue} maxLength='40' type='tel' autoComplete='tel' className={fieldClassName} /></FormField>
            <FormField label='Watch party name' name='party-name' required><input id='party-name' name='partyName' value={values.partyName} onChange={updateValue} required maxLength='120' placeholder='e.g. The Nottingham Gathering' className={fieldClassName} /></FormField>
            <FormField label='City or town' name='host-city' required><input id='host-city' name='city' value={values.city} onChange={updateValue} required maxLength='100' autoComplete='address-level2' className={fieldClassName} /></FormField>
            <FormField label='Neighbourhood' name='host-neighbourhood' required><input id='host-neighbourhood' name='neighbourhood' value={values.neighbourhood} onChange={updateValue} required maxLength='100' autoComplete='address-level3' className={fieldClassName} /></FormField>
            <FormField label='Private address' name='host-address' hint='Optional. Stored privately and never shown in public listings.'><textarea id='host-address' name='privateAddress' value={values.privateAddress} onChange={updateValue} maxLength='300' rows='3' autoComplete='street-address' className={fieldClassName} /></FormField>
            <div className='grid gap-6'>
              <FormField label='Maximum capacity' name='host-capacity' required><input id='host-capacity' name='maximumCapacity' value={values.maximumCapacity} onChange={updateValue} required min='2' max='500' type='number' inputMode='numeric' className={fieldClassName} /></FormField>
              <FormField label='Venue type' name='host-venue' required><select id='host-venue' name='venueType' value={values.venueType} onChange={updateValue} className={fieldClassName}><option value='home'>Private home</option><option value='church'>Church</option><option value='community_space'>Community space</option><option value='workplace'>Workplace</option><option value='other'>Other</option></select></FormField>
            </div>
            <div className='sm:col-span-2'><FormField label='Description' name='host-description' hint='Optional. Tell guests what the atmosphere or setup will be like.'><textarea id='host-description' name='description' value={values.description} onChange={updateValue} maxLength='1000' rows='4' className={fieldClassName} /></FormField></div>
            <div className='sm:col-span-2'><FormField label='Accessibility notes' name='host-accessibility' hint='Optional. Include step-free access, parking, hearing support or other useful details.'><textarea id='host-accessibility' name='accessibilityNotes' value={values.accessibilityNotes} onChange={updateValue} maxLength='1000' rows='4' className={fieldClassName} /></FormField></div>
          </div>
          <div className='absolute -left-[10000px] top-auto h-px w-px overflow-hidden' aria-hidden='true'><label htmlFor='host-website'>Website</label><input id='host-website' name='website' value={values.website} onChange={updateValue} tabIndex='-1' autoComplete='off' /></div>
          <label className='mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-[#F7F3EF] p-4 text-sm leading-6 text-black/70'><input name='consent' type='checkbox' checked={values.consent} onChange={updateValue} required className='mt-1 h-4 w-4 accent-black' /><span>I consent to the organiser team using these details to review and administer my watch party application.</span></label>
          {error && <div className='mt-5'><InlineNotice tone='error'>{error}</InlineNotice></div>}
          <button disabled={status === 'submitting'} className='mt-6 w-full rounded-full bg-black px-6 py-3.5 font-bold text-white hover:bg-black/80 disabled:cursor-wait disabled:opacity-60 sm:w-auto'>{status === 'submitting' ? 'Submitting…' : 'Submit for Approval'}</button>
        </form>

        <aside className='h-fit rounded-2xl bg-black p-6 text-white lg:sticky lg:top-6'>
          <LockClosedIcon className='h-7 w-7 text-[#C0AA95]' aria-hidden='true' />
          <h2 className='mt-5 text-xl font-semibold'>Your privacy matters</h2>
          <p className='mt-3 text-sm leading-6 text-white/65'>Public listings show only the party name, neighbourhood and city. Your email, phone number and private address stay restricted to authorised organisers.</p>
        </aside>
      </div>
    </WatchPartyShell>
  )
}

export default HostWatchParty
