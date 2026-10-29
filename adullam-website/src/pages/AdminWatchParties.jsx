import { useCallback, useEffect, useState } from 'react'
import { ArrowDownTrayIcon, ArrowPathIcon, CheckIcon, LockClosedIcon, NoSymbolIcon, XMarkIcon } from '@heroicons/react/24/outline'
import WatchPartyShell from '../components/watch-parties/WatchPartyShell'
import InlineNotice from '../components/watch-parties/InlineNotice'
import { fieldClassName } from '../components/watch-parties/FormField'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { watchPartiesApi } from '../lib/watchPartiesApi'

const emptyOverview = {
  stats: { pendingParties: 0, approvedParties: 0, confirmedPeople: 0, remainingSpaces: 0, waitingPeople: 0 },
  pendingParties: [], approvedParties: [], registrations: [],
}

function AdminWatchParties() {
  const [session, setSession] = useState(null)
  const [authStatus, setAuthStatus] = useState('loading')
  const [overview, setOverview] = useState(emptyOverview)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [login, setLogin] = useState({ email: '', password: '' })

  const loadOverview = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const response = await watchPartiesApi.admin('overview')
      setOverview(response)
      setStatus('ready')
    } catch (loadError) {
      setError(loadError.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthStatus('ready')
      return undefined
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthStatus('ready')
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthStatus('ready')
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) loadOverview()
  }, [session, loadOverview])

  const handleLogin = async (event) => {
    event.preventDefault()
    setAuthStatus('submitting')
    setError('')
    if (!supabase) {
      setError('Supabase is not configured for this deployment.')
      setAuthStatus('ready')
      return
    }
    const { error: loginError } = await supabase.auth.signInWithPassword(login)
    if (loginError) {
      setError(loginError.message)
      setAuthStatus('ready')
    }
  }

  const runAction = async (action, partyId) => {
    setStatus('saving')
    setError('')
    setNotice('')
    try {
      const response = await watchPartiesApi.admin(action, { partyId })
      if (action === 'approve') {
        const sent = response.notifications?.sent || 0
        setNotice(`Watch party approved. ${sent} matching alert${sent === 1 ? '' : 's'} sent.`)
      } else if (action === 'notify') {
        const sent = response.notifications?.sent || 0
        const failed = response.notifications?.failed || 0
        setNotice(`Alert check complete: ${sent} sent${failed ? `, ${failed} failed` : ''}. Previously notified people were not emailed again.`)
      } else if (action === 'reject') {
        setNotice('Watch party rejected.')
      } else if (action === 'close') {
        setNotice('Registrations closed for this watch party.')
      }
      await loadOverview()
    } catch (actionError) {
      setError(actionError.message)
      setStatus('ready')
    }
  }

  const exportAttendance = async () => {
    setStatus('saving')
    setError('')
    try {
      const response = await watchPartiesApi.admin('export')
      const blob = new Blob([response.csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `watch-party-attendance-${new Date().toISOString().slice(0, 10)}.csv`
      anchor.click()
      URL.revokeObjectURL(url)
      setStatus('ready')
    } catch (exportError) {
      setError(exportError.message)
      setStatus('ready')
    }
  }

  if (authStatus === 'loading') {
    return <div className='min-h-[60vh] bg-[#F7F3EF] px-5 py-24 text-center'>Checking organiser access…</div>
  }

  if (!session) {
    return (
      <WatchPartyShell eyebrow='Organiser access' title='Watch Parties administration' description='Sign in with an authorised organiser account. Access is checked again on every server request.' compact>
        <form onSubmit={handleLogin} className='mt-8 max-w-md rounded-2xl border border-black/10 bg-white p-6 sm:p-8'>
          <LockClosedIcon className='h-8 w-8 text-[#8C7059]' aria-hidden='true' />
          <label className='mt-6 block text-sm font-semibold' htmlFor='admin-email'>Email</label>
          <input id='admin-email' type='email' autoComplete='email' required value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} className={`${fieldClassName} mt-2`} />
          <label className='mt-5 block text-sm font-semibold' htmlFor='admin-password'>Password</label>
          <input id='admin-password' type='password' autoComplete='current-password' required value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} className={`${fieldClassName} mt-2`} />
          {error && <div className='mt-5'><InlineNotice tone='error'>{error}</InlineNotice></div>}
          <button disabled={authStatus === 'submitting'} className='mt-6 w-full rounded-full bg-black px-6 py-3 font-bold text-white disabled:opacity-60'>{authStatus === 'submitting' ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </WatchPartyShell>
    )
  }

  return (
    <div className='min-h-screen bg-[#F7F3EF] px-5 py-12 sm:px-8 lg:px-12'>
      <div className='mx-auto max-w-7xl'>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
          <div><p className='text-xs font-bold uppercase tracking-[0.2em] text-black/50'>Organiser dashboard</p><h1 className='mt-3 text-4xl font-light tracking-tight sm:text-5xl'>Watch Parties</h1></div>
          <div className='flex flex-wrap gap-2'>
            <button onClick={loadOverview} disabled={status === 'loading'} className='inline-flex items-center gap-2 rounded-full border border-black px-4 py-2.5 text-sm font-bold'><ArrowPathIcon className='h-4 w-4' />Refresh</button>
            <button onClick={exportAttendance} disabled={status === 'saving'} className='inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-bold text-white'><ArrowDownTrayIcon className='h-4 w-4' />Export attendance</button>
            <button onClick={() => supabase.auth.signOut()} className='rounded-full px-4 py-2.5 text-sm font-semibold text-black/55'>Sign out</button>
          </div>
        </div>

        {error && <div className='mt-6'><InlineNotice tone='error'>{error}</InlineNotice></div>}
        {notice && <div className='mt-6'><InlineNotice tone='success'>{notice}</InlineNotice></div>}

        <div className='mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
          {[
            ['Pending hosts', overview.stats.pendingParties], ['Approved parties', overview.stats.approvedParties],
            ['Confirmed people', overview.stats.confirmedPeople], ['Remaining spaces', overview.stats.remainingSpaces],
            ['People waiting', overview.stats.waitingPeople],
          ].map(([label, value]) => <div key={label} className='rounded-2xl border border-black/10 bg-white p-5'><p className='text-sm text-black/50'>{label}</p><p className='mt-2 text-3xl font-semibold'>{value}</p></div>)}
        </div>

        <section className='mt-10'>
          <div className='flex items-center justify-between'><h2 className='text-2xl font-semibold'>Pending host approvals</h2><span className='rounded-full bg-[#E3D6C8] px-3 py-1 text-sm font-bold'>{overview.pendingParties.length}</span></div>
          {overview.pendingParties.length === 0 ? <div className='mt-5 rounded-2xl border border-dashed border-black/20 bg-white/50 p-8 text-center text-black/50'>No host applications are waiting for review.</div> : <div className='mt-5 grid gap-4 lg:grid-cols-2'>{overview.pendingParties.map((party) => (
            <article key={party.id} className='rounded-2xl border border-black/10 bg-white p-6'>
              <div className='flex items-start justify-between gap-4'><div><p className='text-xs font-bold uppercase tracking-[0.16em] text-[#7D6857]'>{party.city} · {party.neighbourhood}</p><h3 className='mt-2 text-xl font-semibold'>{party.name}</h3></div><span className='rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900'>Pending</span></div>
              <dl className='mt-5 grid gap-3 text-sm sm:grid-cols-2'><div><dt className='text-black/45'>Host</dt><dd className='font-semibold'>{party.host_name}</dd></div><div><dt className='text-black/45'>Email</dt><dd className='break-all font-semibold'>{party.host_email}</dd></div><div><dt className='text-black/45'>Capacity</dt><dd className='font-semibold'>{party.maximum_capacity}</dd></div><div><dt className='text-black/45'>Venue</dt><dd className='font-semibold capitalize'>{party.venue_type.replace('_', ' ')}</dd></div></dl>
              {party.description && <p className='mt-5 text-sm leading-6 text-black/60'>{party.description}</p>}
              <div className='mt-6 flex gap-2'><button onClick={() => runAction('approve', party.id)} className='inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-bold text-white'><CheckIcon className='h-4 w-4' />Approve</button><button onClick={() => runAction('reject', party.id)} className='inline-flex items-center gap-2 rounded-full border border-black/20 px-4 py-2.5 text-sm font-bold'><XMarkIcon className='h-4 w-4' />Reject</button></div>
            </article>
          ))}</div>}
        </section>

        <section className='mt-10'>
          <h2 className='text-2xl font-semibold'>Approved watch parties</h2>
          <div className='mt-5 overflow-x-auto rounded-2xl border border-black/10 bg-white'>
            <table className='min-w-full text-left text-sm'><thead className='border-b border-black/10 bg-black/[0.03] text-xs uppercase tracking-[0.12em] text-black/50'><tr><th className='px-5 py-4'>Party</th><th className='px-5 py-4'>Location</th><th className='px-5 py-4'>Confirmed</th><th className='px-5 py-4'>Remaining</th><th className='px-5 py-4'>Status</th><th className='px-5 py-4'><span className='sr-only'>Actions</span></th></tr></thead>
              <tbody className='divide-y divide-black/10'>{overview.approvedParties.map((party) => <tr key={party.id}><td className='px-5 py-4 font-semibold'>{party.name}</td><td className='px-5 py-4'>{party.neighbourhood}, {party.city}</td><td className='px-5 py-4'>{party.confirmed_attendees}</td><td className='px-5 py-4'>{party.remaining_capacity}</td><td className='px-5 py-4 capitalize'>{party.registration_status}</td><td className='px-5 py-4'><div className='flex justify-end gap-3'>{party.registration_status === 'open' && <><button onClick={() => runAction('notify', party.id)} disabled={status === 'saving'} className='inline-flex items-center gap-1 text-xs font-bold text-[#6F513B] disabled:opacity-50'><ArrowPathIcon className='h-4 w-4' />Send alerts</button><button onClick={() => runAction('close', party.id)} disabled={status === 'saving'} className='inline-flex items-center gap-1 text-xs font-bold text-red-800 disabled:opacity-50'><NoSymbolIcon className='h-4 w-4' />Close</button></>}</div></td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className='mt-10'>
          <h2 className='text-2xl font-semibold'>Recent registrations</h2>
          <div className='mt-5 overflow-x-auto rounded-2xl border border-black/10 bg-white'>
            <table className='min-w-full text-left text-sm'><thead className='border-b border-black/10 bg-black/[0.03] text-xs uppercase tracking-[0.12em] text-black/50'><tr><th className='px-5 py-4'>Attendee</th><th className='px-5 py-4'>Party</th><th className='px-5 py-4'>Group</th><th className='px-5 py-4'>Registered</th></tr></thead><tbody className='divide-y divide-black/10'>{overview.registrations.map((registration) => <tr key={registration.id}><td className='px-5 py-4'><span className='font-semibold'>{registration.attendee_name}</span><br /><span className='text-xs text-black/50'>{registration.attendee_email}</span></td><td className='px-5 py-4'>{registration.party_name}</td><td className='px-5 py-4'>{registration.group_size}</td><td className='px-5 py-4'>{new Date(registration.created_at).toLocaleDateString('en-GB')}</td></tr>)}</tbody></table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminWatchParties
