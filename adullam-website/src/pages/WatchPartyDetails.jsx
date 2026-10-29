import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircleIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import WatchPartyShell from '../components/watch-parties/WatchPartyShell'
import FormField, { fieldClassName } from '../components/watch-parties/FormField'
import InlineNotice from '../components/watch-parties/InlineNotice'
import { pluraliseSpaces, validateGroupSize } from '../lib/watchPartyRules'
import { watchPartiesApi } from '../lib/watchPartiesApi'

function WatchPartyDetails() {
  const { id } = useParams()
  const [party, setParty] = useState(null)
  const [pageStatus, setPageStatus] = useState('loading')
  const [pageError, setPageError] = useState('')
  const [values, setValues] = useState({ name: '', email: '', groupSize: 1, consent: false, website: '' })
  const [bookingStatus, setBookingStatus] = useState('idle')
  const [bookingError, setBookingError] = useState('')
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    let active = true
    watchPartiesApi.details(id)
      .then((response) => {
        if (active) {
          setParty(response.party)
          setPageStatus('ready')
        }
      })
      .catch((error) => {
        if (active) {
          setPageError(error.message)
          setPageStatus('error')
        }
      })
    return () => { active = false }
  }, [id])

  const updateValue = (event) => {
    const { name, value, type, checked } = event.target
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleBooking = async (event) => {
    event.preventDefault()
    const groupError = validateGroupSize(values.groupSize, party.remaining_capacity)
    if (groupError) {
      setBookingError(groupError)
      return
    }

    setBookingStatus('submitting')
    setBookingError('')
    try {
      const response = await watchPartiesApi.book({ partyId: id, ...values })
      setConfirmation({ ...response.registration, emailSent: response.emailSent })
      setParty((current) => ({ ...current, remaining_capacity: response.remainingCapacity }))
      setBookingStatus('success')
    } catch (error) {
      setBookingError(error.message)
      setBookingStatus('idle')
      if (error.message.toLowerCase().includes('space') || error.message.toLowerCase().includes('full')) {
        watchPartiesApi.details(id).then((response) => setParty(response.party)).catch(() => {})
      }
    }
  }

  if (pageStatus === 'loading') {
    return <div className='min-h-[60vh] bg-[#F7F3EF] px-5 py-24 text-center' role='status'>Loading watch party…</div>
  }

  if (pageStatus === 'error' || !party) {
    return (
      <WatchPartyShell eyebrow='Watch party' title='This party is unavailable' description={pageError || 'It may have closed or no longer be publicly listed.'} compact>
        <Link to='/watch-parties' className='mt-8 inline-flex rounded-full bg-black px-6 py-3 font-bold text-white'>Find another party</Link>
      </WatchPartyShell>
    )
  }

  const isFull = party.remaining_capacity < 1 || party.registration_status !== 'open'

  return (
    <WatchPartyShell eyebrow='Local watch party' title={party.name} compact>
      <div className='mt-8 grid overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.75fr)]'>
        <div className='p-6 sm:p-9 lg:p-12'>
          <div className='flex flex-wrap gap-3 text-sm font-semibold'>
            <span className='inline-flex items-center gap-2 rounded-full bg-[#E3D6C8] px-4 py-2'><MapPinIcon className='h-4 w-4' aria-hidden='true' />{party.approximate_location}</span>
            <span className='inline-flex items-center gap-2 rounded-full bg-[#E3D6C8] px-4 py-2'><UserGroupIcon className='h-4 w-4' aria-hidden='true' />{pluraliseSpaces(party.remaining_capacity)} remaining</span>
          </div>
          {party.description ? <p className='mt-8 max-w-2xl text-lg leading-8 text-black/70'>{party.description}</p> : <p className='mt-8 text-lg leading-8 text-black/55'>A welcoming local gathering for the virtual programme.</p>}
          <dl className='mt-10 divide-y divide-black/10 border-y border-black/10'>
            <div className='py-5'><dt className='text-xs font-bold uppercase tracking-[0.16em] text-black/45'>Venue type</dt><dd className='mt-2 capitalize'>{party.venue_type_label}</dd></div>
            {party.accessibility_notes && <div className='py-5'><dt className='text-xs font-bold uppercase tracking-[0.16em] text-black/45'>Accessibility</dt><dd className='mt-2 leading-7 text-black/70'>{party.accessibility_notes}</dd></div>}
          </dl>
          <p className='mt-5 text-sm leading-6 text-black/50'>For privacy, the host's exact address and contact details are never shown publicly. Organisers will provide essential joining information securely.</p>
        </div>

        <div className='bg-black p-6 text-white sm:p-9 lg:p-12'>
          {isFull ? (
            <div className='flex h-full flex-col justify-center'>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#C0AA95]'>Registration closed</p>
              <h2 className='mt-4 text-3xl font-light'>This party is full.</h2>
              <p className='mt-4 leading-7 text-white/65'>Spaces can go quickly. Search for another watch party nearby or leave your details to hear about new gatherings.</p>
              <Link to='/watch-parties' className='mt-7 inline-flex w-fit rounded-full bg-white px-5 py-3 font-bold text-black'>Find another party</Link>
            </div>
          ) : bookingStatus === 'success' ? (
            <div className='flex h-full flex-col justify-center' role='status'>
              <CheckCircleIcon className='h-12 w-12 text-[#C0AA95]' aria-hidden='true' />
              <h2 className='mt-5 text-3xl font-light'>Your spaces are confirmed.</h2>
              <p className='mt-4 leading-7 text-white/65'>We reserved {pluraliseSpaces(confirmation.group_size)}. {confirmation.emailSent ? `Booking details have been sent to ${confirmation.email}.` : 'Your booking is safe, but the confirmation email could not be delivered. Please contact the organiser team if you need help.'}</p>
            </div>
          ) : (
            <form onSubmit={handleBooking}>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#C0AA95]'>Reserve your place</p>
              <h2 className='mt-4 text-3xl font-light'>Join this party</h2>
              <div className='mt-7 space-y-5 [&_label]:text-white [&_input]:border-white/20 [&_input]:bg-white [&_input]:text-black'>
                <FormField label='Name' name='attendee-name' required><input id='attendee-name' name='name' value={values.name} onChange={updateValue} required maxLength='100' autoComplete='name' className={fieldClassName} /></FormField>
                <FormField label='Email' name='attendee-email' required><input id='attendee-email' name='email' value={values.email} onChange={updateValue} required maxLength='254' type='email' autoComplete='email' className={fieldClassName} /></FormField>
                <FormField label='Group size' name='attendee-group' hint={`${pluraliseSpaces(party.remaining_capacity)} available`} required><input id='attendee-group' name='groupSize' value={values.groupSize} onChange={updateValue} required min='1' max={party.remaining_capacity} type='number' inputMode='numeric' className={fieldClassName} /></FormField>
              </div>
              <div className='absolute -left-[10000px] top-auto h-px w-px overflow-hidden' aria-hidden='true'><label htmlFor='booking-website'>Website</label><input id='booking-website' name='website' value={values.website} onChange={updateValue} tabIndex='-1' autoComplete='off' /></div>
              <label className='mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/65'><input name='consent' type='checkbox' checked={values.consent} onChange={updateValue} required className='mt-1 h-4 w-4 accent-[#C0AA95]' /><span>I consent to my details being used to administer this booking and send essential event emails.</span></label>
              {bookingError && <div className='mt-5'><InlineNotice tone='error'>{bookingError}</InlineNotice></div>}
              <button disabled={bookingStatus === 'submitting'} className='mt-6 w-full rounded-full bg-[#C0AA95] px-6 py-3.5 font-bold text-black hover:bg-[#D2BEAB] disabled:cursor-wait disabled:opacity-60'>{bookingStatus === 'submitting' ? 'Reserving…' : 'Confirm Registration'}</button>
            </form>
          )}
        </div>
      </div>
    </WatchPartyShell>
  )
}

export default WatchPartyDetails
