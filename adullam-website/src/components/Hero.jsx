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

        <div className='absolute top-0 left-0 z-20 h-full flex flex-col justify-end text-left px-6 md:px-10 pb-20 md:pb-36 text-white'>
          <h1 className='text-4xl md:text-6xl lg:text-8xl leading-tight mb-4'>
            Welcome to <br /> Adullam Academy
          </h1>
        </div>
      </section>

      <div className='w-full h-auto flex flex-col justify-end text-center px-6 md:px-10 py-16 md:py-20 text-white bg-[#C0AA95]'>
        <h1 className='text-4xl md:text-6xl lg:text-8xl mb-1 leading-tight'>
          Rooted. <br /> Empowered. <br /> Sent.
        </h1>
        <p className='text-base md:text-lg lg:text-xl leading-relaxed'>
          GROUNDING AND EQUIPPING BELIEVERS IN THEIR IDENTITY, <br />
          ABILITIES AND CAPABILITIES IN CHRIST THROUGH TEACHING, <br />
          PRAYER, AND SPIRIT LED DISCIPLESHIP
        </p>

        <div className='flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 justify-center mt-8'>
          <Link smooth to='/#programs'>
            <button className='bg-white text-[#C0AA95] px-6 py-2 md:py-3 rounded-full hover:opacity-90 transition w-full md:w-60'>
              OUR PROGRAMS
            </button>
          </Link>

          {/* TODO [AW-19]: add link to WhatsApp sign up form */}
          <Link>
            <button className='bg-white text-[#C0AA95] px-6 py-2 md:py-3 rounded-full hover:opacity-90 transition w-full md:w-60'>
              JOIN THE FAMILY
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default Hero
