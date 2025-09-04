import { HashLink as Link } from 'react-router-hash-link'
import heroBgVideo from '../assets/hero-backgroud.mp4'

function Hero() {

  return (
    <>
      <section className='relative h-screen' id='hero'>

        <video
          className='absolute top-0 left-0 w-full h-full object-cover z-0'
          src={heroBgVideo}
          autoPlay
          muted
          loop
          playsInline
        />

        <div className='absolute top-0 left-0 w-full h-full bg-black/50 z-10'></div>

        <div className='absolute top-0 left-0 z-20 h-full flex flex-col justify-end text-left px-8 pb-35 text-white'>
          <h1 className='text-6xl md:text-8xl mb-4'>
            Welcome to <br /> Adullam Academy
          </h1>
        </div>
      </section>

      <div className='w-full h-200 z-0 flex flex-col justify-end text-center px-8 pb-35 text-white' style={{ backgroundColor: '#C0AA95' }}>
        <h1 className='text-6xl md:text-8xl mb-4'>
            Rooted. <br /> Empowered. <br /> Sent.
        </h1>
        <p>
            GROUNDING AND EQUIPPING BELIVERS IN THEIR IDENTITY, <br />
            ABILITIES AND CAPABILITIES IN CHRIST THROUGH TEACHING,<br />
            PRAYER, AND SPIRIT LED DISCIPLESHIP
        </p>

        <br />
        <br />

        <div className='flex space-x-6 justify-center'>

            <Link smooth to='/#programs'>
                <button className='bg-white text-[#C0AA95] px-4 py-1.5 rounded-full hover:opacity-90 transition w-60'>
                    OUR PROGRAMS
                </button>
            </Link>
            {/* TODO [AW-19]: add link to WhatsApp sign up form  */}
            <Link>
                <button className='bg-white text-[#C0AA95] px-4 py-1.5 rounded-full hover:opacity-90 transition w-60'>
                    JOIN THE FAMILY
                </button>
            </Link>

        </div>
      </div>

    
    </>
  )
}

export default Hero

