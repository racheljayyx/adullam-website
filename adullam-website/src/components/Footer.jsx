import { FaFacebook, FaInstagram } from 'react-icons/fa'
import { EnvelopeIcon } from '@heroicons/react/24/solid'

function Footer() {
  return (
    <footer className='bg-black text-white py-6 px-8 mt-10'>
      <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0'>
        
        <div className='text-sm text-center md:text-left'>
          <p>© {new Date().getFullYear()} ADULLAM ACADEMY LIMITED</p>
          <p>Company number 16153693</p>
        </div>

        <div className='flex space-x-6'>D
          <a
            href='https://www.instagram.com/theadullamacademy?igsh=dHJidXdnbGx2ODU1'
            target='_blank'
            rel='noopener noreferrer'
            className='hover:text-[#C0AA95] transition'
          >
            <FaInstagram size={24} />
          </a>
        </div>

        <div className='flex items-center space-x-2'>
          <EnvelopeIcon className='h-5 w-5 text-[#C0AA95]' />
          <a
            href='mailto:admin@adullamacademy.co.uk'
            className='hover:underline'
          >
            admin@adullamacademy.co.uk
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
