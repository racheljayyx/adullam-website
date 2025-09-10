import { useState } from 'react'
import { HashLink as Link } from 'react-router-hash-link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import adullamLogo from '../assets/adullam.svg'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className='bg-black text-white px-6 py-6 flex justify-between items-center relative'>

      <Link to='/' className='flex items-center space-x-2'>
        <img src={adullamLogo} alt='Adullam Logo' className='h-10 w-auto' />
        <span className='font-bold text-xl'>Adullam Academy</span>
      </Link>

      <nav className='hidden md:flex space-x-6'>
        <Link smooth to='/#about' className='hover:text-gray-400'>About Us</Link>
        <Link smooth to='/#programs' className='hover:text-gray-400'>Programs</Link>
        <Link smooth to='/#contact' className='hover:text-gray-400'>Contact Us</Link>
        <Link to='/give' className='hover:text-gray-400'>Give</Link>
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
        <Link to='/give' className='hover:text-gray-400' onClick={() => setIsOpen(false)}>Give</Link>
      </nav>
    </header>
  )
}

export default Navbar
