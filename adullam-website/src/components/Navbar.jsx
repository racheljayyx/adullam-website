import adullamLogo from '../assets/adullam.svg'

function Navbar() {
    return(
        <nav className='bg-black text-white px-6 py-8 flex justify-between items-center'>
            <div href='/' className='flex items-center space-x-2'>
                <img src={adullamLogo} alt="Adullam Logo" className='h-10 w-auto'/>
                <span className='font-bold text-x1'>Adullam Academy</span>
            </div>
            <ul className="flex space-x-6">
                <li><a href="/" className="hover:text-gray-400">About Us</a></li>
                <li><a href="#" className="hover:text-gray-400">Programs</a></li>
                <li><a href="#" className="hover:text-gray-400">Give</a></li>
                <li><a href="#" className="hover:text-gray-400">Contact Us</a></li>
            </ul>

        </nav>
    )
}

export default Navbar

