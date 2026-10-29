import { ArrowRightIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { pluraliseSpaces } from '../../lib/watchPartyRules'

function PartyCard({ party }) {
  return (
    <article className='flex h-full flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(37,31,27,0.05)] sm:p-7'>
      <div>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-[#7D6857]'>
          Watch party
        </p>
        <h3 className='mt-4 text-2xl font-semibold tracking-tight'>{party.name}</h3>
        <div className='mt-5 space-y-3 text-sm text-black/65'>
          <p className='flex items-start gap-3'>
            <MapPinIcon className='mt-0.5 h-5 w-5 shrink-0 text-[#8C7059]' aria-hidden='true' />
            <span>{party.approximate_location}{party.distance_miles !== undefined && party.distance_miles !== null ? ` · approximately ${Number(party.distance_miles).toFixed(1)} miles away` : ''}</span>
          </p>
          <p className='flex items-start gap-3'>
            <UserGroupIcon className='mt-0.5 h-5 w-5 shrink-0 text-[#8C7059]' aria-hidden='true' />
            <span>{pluraliseSpaces(party.remaining_capacity)} available</span>
          </p>
        </div>
        {party.description && (
          <p className='mt-5 line-clamp-3 text-sm leading-6 text-black/60'>
            {party.description}
          </p>
        )}
      </div>
      <Link
        to={`/watch-parties/${party.id}`}
        className='mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black'
      >
        View and join
        <ArrowRightIcon className='h-4 w-4' aria-hidden='true' />
      </Link>
    </article>
  )
}

export default PartyCard
