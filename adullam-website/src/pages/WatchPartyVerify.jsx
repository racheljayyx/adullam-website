import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import WatchPartyShell from '../components/watch-parties/WatchPartyShell'
import { watchPartiesApi } from '../lib/watchPartiesApi'

function WatchPartyVerify() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email…')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('This verification link is incomplete.')
      return
    }
    watchPartiesApi.verifyInterest(token)
      .then(() => {
        setStatus('success')
        setMessage('Your watch-party alerts are now active.')
      })
      .catch((error) => {
        setStatus('error')
        setMessage(error.message)
      })
  }, [searchParams])

  return (
    <WatchPartyShell eyebrow='Email preferences' title={status === 'loading' ? 'One moment…' : status === 'success' ? 'You’re all set.' : 'We could not verify this link.'} compact>
      <div className='mt-8 max-w-2xl rounded-2xl border border-black/10 bg-white p-7 sm:p-10' role='status'>
        {status === 'success' ? <CheckCircleIcon className='h-11 w-11 text-emerald-700' aria-hidden='true' /> : status === 'error' ? <ExclamationTriangleIcon className='h-11 w-11 text-amber-700' aria-hidden='true' /> : <div className='h-10 w-10 animate-pulse rounded-full bg-[#C0AA95]' aria-hidden='true' />}
        <p className='mt-5 text-lg leading-8 text-black/70'>{message}</p>
        <Link to='/watch-parties' className='mt-6 inline-flex rounded-full bg-black px-5 py-3 font-bold text-white'>Explore watch parties</Link>
      </div>
    </WatchPartyShell>
  )
}

export default WatchPartyVerify

