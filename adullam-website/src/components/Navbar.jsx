import { Link } from 'react-router-dom'
import adullamLogo from '../assets/adullam.svg'

function Navbar() {
    return(
        <header className='bg-black text-white px-6 py-8 flex justify-between items-center'>
            <Link to='/' className='flex items-center space-x-2'>
                <img src={adullamLogo} alt='Adullam Logo' className='h-10 w-auto'/>
                <span className='font-bold text-x1'>Adullam Academy</span>
            </Link>

            <nav className="flex space-x-6">
                <Link href='/#about' className='hover:text-gray-40'>About Us</Link>
                <Link href='/#programs' className='hover:text-gray-400'>Programs</Link>
                <Link to='/#contact' className='hover:text-gray-400'>Contact Us</Link>
                <Link to='/give' className='hover:text-gray-400'>Give</Link>

            </nav>

        </header>
    )
}

export default Navbar

