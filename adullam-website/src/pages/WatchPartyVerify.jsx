import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import WatchPartyShell from '../components/watch-parties/WatchPartyShell'
import { watchPartiesApi } from '../lib/watchPartiesApi'

function WatchPartyVerify() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email…')
  const [attempt, setAttempt] = useState(0)

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
  }, [searchParams, attempt])

  return (
    <WatchPartyShell eyebrow='Email preferences' title={status === 'loading' ? 'One moment…' : status === 'success' ? 'You’re all set.' : 'We could not verify this link.'} compact>
      <div className='mt-8 max-w-2xl rounded-2xl border border-black/10 bg-white p-7 sm:p-10' role='status'>
        {status === 'success' ? <CheckCircleIcon className='h-11 w-11 text-emerald-700' aria-hidden='true' /> : status === 'error' ? <ExclamationTriangleIcon className='h-11 w-11 text-amber-700' aria-hidden='true' /> : <div className='h-10 w-10 animate-pulse rounded-full bg-[#C0AA95]' aria-hidden='true' />}
        <p className='mt-5 text-lg leading-8 text-black/70'>{message}</p>
        <div className='mt-6 flex flex-wrap gap-3'>
          {status === 'error' && searchParams.get('token') && <button onClick={() => { setStatus('loading'); setMessage('Verifying your email…'); setAttempt((current) => current + 1) }} className='rounded-full bg-black px-5 py-3 font-bold text-white'>Try Again</button>}
          <Link to='/watch-parties' className='inline-flex rounded-full border border-black px-5 py-3 font-bold'>Explore watch parties</Link>
        </div>
      </div>
    </WatchPartyShell>
  )
}

export default WatchPartyVerify
