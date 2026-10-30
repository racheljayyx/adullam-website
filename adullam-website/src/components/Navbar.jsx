import { useState } from 'react'
import { HashLink as Link } from 'react-router-hash-link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import adullamLogo from '../assets/adullam.svg'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className='bg-black text-white px-6 py-6 flex justify-between items-center relative'>

      <Link to='/' className='flex items-center space-x-2'>
        <img src={adullamLogo} alt='Adullam Logo' className='h-10 w-auto' />
        <span className='font-bold text-xl'>Adullam Academy</span>
      </Link>

      <nav className='hidden items-center space-x-6 md:flex'>
        <Link smooth to='/#about' className='hover:text-gray-400'>About Us</Link>
        <Link smooth to='/#programs' className='hover:text-gray-400'>Programs</Link>
        <Link smooth to='/#contact' className='hover:text-gray-400'>Contact Us</Link>
        <Link to='/watch-parties' className='hover:text-gray-400'>Watch Parties</Link>
        <Link to='/give' className='hover:text-gray-400'>Give</Link>
        <Link
          to='/admin/watch-parties'
          className='inline-flex items-center gap-2 rounded-full border border-white/35 px-4 py-2 text-sm font-semibold transition hover:border-[#C0AA95] hover:bg-[#C0AA95] hover:text-black'
        >
          <LockClosedIcon className='h-4 w-4' aria-hidden='true' />
          Organiser login
        </Link>
      </nav>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className='md:hidden focus:outline-none z-50'
        aria-label='Toggle menu'
      >
        {isOpen ? (
          <XMarkIcon className='h-8 w-8 text-white' />
        ) : (
          <Bars3Icon className='h-8 w-8 text-white' />
        )}
      </button>

      {isOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 md:hidden'
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <nav
        className={`absolute top-20 left-0 w-full bg-black flex flex-col items-center space-y-4 py-6 md:hidden shadow-lg transform transition-all duration-300 z-40 ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-96 opacity-0'
        }`}
      >
        <Link smooth to='/#about' className='hover:text-gray-400' onClick={() => setIsOpen(false)}>About Us</Link>
        <Link smooth to='/#programs' className='hover:text-gray-400' onClick={() => setIsOpen(false)}>Programs</Link>
        <Link smooth to='/#contact' className='hover:text-gray-400' onClick={() => setIsOpen(false)}>Contact Us</Link>
        <Link to='/watch-parties' className='hover:text-gray-400' onClick={() => setIsOpen(false)}>Watch Parties</Link>
        <Link to='/give' className='hover:text-gray-400' onClick={() => setIsOpen(false)}>Give</Link>
        <Link
          to='/admin/watch-parties'
          className='mt-2 inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-2.5 font-semibold hover:border-[#C0AA95] hover:bg-[#C0AA95] hover:text-black'
          onClick={() => setIsOpen(false)}
        >
          <LockClosedIcon className='h-4 w-4' aria-hidden='true' />
          Organiser login
        </Link>
      </nav>
    </header>
  )
}

export default Navbar
