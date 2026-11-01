import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline'
import WatchPartyShell from '../components/watch-parties/WatchPartyShell'
import PartyCard from '../components/watch-parties/PartyCard'
import InterestForm from '../components/watch-parties/InterestForm'
import InlineNotice from '../components/watch-parties/InlineNotice'
import { fieldClassName } from '../components/watch-parties/FormField'
import { watchPartiesApi } from '../lib/watchPartiesApi'

function WatchParties() {
  const [postcode, setPostcode] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [searchedPostcode, setSearchedPostcode] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleSearch = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setError('')
    setSearched(false)

    try {
      const response = await watchPartiesApi.search({ postcode })
      setResults(response.parties || [])
      setSearchedPostcode(response.searchedPostcode || postcode)
      setSearched(true)
    } catch (searchError) {
      setError(searchError.message)
    } finally {
      setStatus('idle')
    }
  }

  return (
    <>
      <WatchPartyShell
        eyebrow='Virtual programme · Local community'
        title='Watch Together. Connect Locally.'
        description="The programme is virtual, but the experience doesn't have to be solitary. Find a watch party near you or bring people together by hosting one."
      >
        <div className='mt-10 flex flex-col gap-3 sm:flex-row'>
          <a href='#find' className='inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 font-bold text-white hover:bg-black/80'>
            Find a Watch Party
            <MagnifyingGlassIcon className='h-5 w-5' aria-hidden='true' />
          </a>
          <Link to='/watch-parties/host' className='inline-flex items-center justify-center gap-2 rounded-full border border-black px-6 py-3.5 font-bold hover:bg-black hover:text-white'>
            Host a Watch Party
            <ArrowRightIcon className='h-5 w-5' aria-hidden='true' />
          </Link>
        </div>
      </WatchPartyShell>

      <section id='find' className='bg-black px-5 py-14 text-white sm:px-8 sm:py-20 lg:px-12'>
        <div className='mx-auto max-w-7xl'>
          <div className='max-w-2xl'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#C0AA95]'>Find your community</p>
            <h2 className='mt-4 text-3xl font-light tracking-tight sm:text-5xl'>Find your closest watch party</h2>
            <p className='mt-4 leading-7 text-white/65'>Enter your UK postcode to see every available watch party, ordered from closest to furthest. Your postcode is used only for this search.</p>
          </div>

          <form onSubmit={handleSearch} className='mt-8 grid gap-3 rounded-2xl bg-white/10 p-4 sm:grid-cols-[1fr_auto] sm:p-5'>
            <label className='sr-only' htmlFor='party-postcode'>Your postcode</label>
            <div className='relative'>
              <MapPinIcon className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/45' aria-hidden='true' />
              <input id='party-postcode' value={postcode} onChange={(event) => setPostcode(event.target.value)} required maxLength='10' autoComplete='postal-code' placeholder='e.g. NG7 2BF' className={`${fieldClassName} pl-12`} />
            </div>
            <button disabled={status === 'loading'} className='rounded-xl bg-[#C0AA95] px-6 py-3 font-bold text-black hover:bg-[#D2BEAB] disabled:cursor-wait disabled:opacity-60'>
              {status === 'loading' ? 'Finding parties…' : 'Show Watch Parties'}
            </button>
          </form>
          <p className='mt-3 text-xs leading-5 text-white/45'>Distances are calculated securely from postcode coordinates. Exact host addresses and coordinates are never returned publicly.</p>
          {error && <div className='mt-5 max-w-3xl'><InlineNotice tone='error'>{error}</InlineNotice></div>}
        </div>
      </section>

      {searched && results.length > 0 && (
        <section className='bg-[#F7F3EF] px-5 py-14 sm:px-8 sm:py-20 lg:px-12' aria-live='polite'>
          <div className='mx-auto max-w-7xl'>
            <p className='text-sm font-semibold text-black/55'>{results.length} available {results.length === 1 ? 'party' : 'parties'}, ordered closest to furthest from {searchedPostcode}</p>
            <div className='mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              {results.map((party) => <PartyCard key={party.id} party={party} />)}
            </div>
          </div>
        </section>
      )}

      {searched && results.length === 0 && (
        <section className='bg-[#E3D6C8] px-5 py-14 sm:px-8 sm:py-20 lg:px-12' aria-live='polite'>
          <div className='mx-auto max-w-4xl'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-black/55'>Stay in the loop</p>
            <h2 className='mt-4 text-3xl font-light tracking-tight sm:text-5xl'>No watch parties are available. Yet.</h2>
            <p className='mt-5 max-w-3xl leading-7 text-black/65'>There are no available watch parties right now, but that could change. Leave your details and we'll let you know when someone hosts a watch party in your area.</p>
            <div className='mt-8'>
              <InterestForm key={searchedPostcode} initialPostcode={searchedPostcode} />
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default WatchParties
