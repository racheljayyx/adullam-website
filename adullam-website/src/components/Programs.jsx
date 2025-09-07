import bibleImg from '../assets/bible-study.jpg'
import prayerImg from '../assets/daily-prayer.jpg'
import rootedImg from '../assets/in-person-gathering.jpg'

function Programs() {
  return (
    <section id='programs' className='px-4 sm:px-8 lg:px-16 space-y-4'>
      <h1 className='text-2xl sm:text-3xl py-9 text-center'>
        OUR PROGRAMS
      </h1>

      <div
        className='w-full rounded-2xl bg-cover bg-center text-center text-white overflow-hidden transform transition duration-500 md:hover:scale-105 md:hover:shadow-xl'
        style={{ backgroundImage: `url(${bibleImg})` }}
      >
        <div className='bg-black/60 md:hover:bg-black/50 transition duration-500 w-full p-6 sm:p-10'>
          <h2 className='inline-block border border-white px-3 py-1 text-sm sm:text-base'>
            BIBLE STUDY
          </h2>

          <h3 className='pt-6 sm:pt-8 text-3xl sm:text-5xl lg:text-7xl font-light'>
            Join us every <span className='font-bold'>Saturday</span> Morning
          </h3>

          <p className='pt-6 sm:pt-10 pb-8 text-base sm:text-lg lg:text-xl leading-relaxed'>
            We meet online at 7-9AM every Saturday Morning for Bible Study, Teaching and Discussion.
            <br className='hidden sm:block' />
            This will deepen your Biblical understanding, personal conviction, and application.
            <br className='hidden sm:block' />
            Make sure to set your alarm and invite a friend!
          </p>

          <a
            href='https://bit.ly/adullammeeting'
            target='_blank'
            rel='noopener noreferrer'
            className='bg-white text-black font-bold px-6 py-2 rounded-full transition transform duration-300 hover:scale-105 hover:opacity-90 active:scale-95 w-full sm:w-auto'>
            Join Here
          </a>
        </div>
      </div>

      <div
        className='w-full rounded-2xl bg-cover bg-center text-center text-white overflow-hidden transform transition duration-500 md:hover:scale-105 md:hover:shadow-xl'
        style={{ backgroundImage: `url(${prayerImg})` }}
      >
        <div className='bg-black/60 md:hover:bg-black/50 transition duration-500 w-full p-6 sm:p-10'>
          <h2 className='inline-block border border-white px-3 py-1 text-sm sm:text-base'>
            DAILY PRAYER
          </h2>

          <h3 className='pt-6 sm:pt-8 text-3xl sm:text-5xl lg:text-7xl font-bold'>
            THE FORGE
          </h3>

          <p className='pt-6 sm:pt-10 pb-8 text-base sm:text-lg lg:text-xl leading-relaxed'>
            <span className='font-bold'>9:00-9:15 PM:</span> Bible Reading 
            <br />
            <span className='font-bold'>9:15-10:45 PM:</span> Prayer 
            <br />
            <span className='font-bold'>10:45-11:00 PM:</span> Book Reading 
            <br />
            Building daily discipline and sensitivity to the Holy Spirit.
          </p>

          <a
            href='https://bit.ly/adullammeeting'
            target='_blank'
            rel='noopener noreferrer'
            className='bg-white text-black font-bold px-6 py-2 rounded-full transition transform duration-300 hover:scale-105 hover:opacity-90 active:scale-95 w-full sm:w-auto'>
            Let's Pray
          </a>
        </div>
      </div>

      <div
        className='w-full rounded-2xl bg-cover bg-center text-center text-white overflow-hidden transform transition duration-500 md:hover:scale-105 md:hover:shadow-xl'
        style={{ backgroundImage: `url(${rootedImg})` }}
      >
        <div className='bg-black/60 md:hover:bg-black/50 transition duration-500 w-full p-6 sm:p-10'>
          <h2 className='inline-block border border-white px-3 py-1 text-sm sm:text-base'>
            IN-PERSON GATHERING
          </h2>

          <h3 className='pt-6 sm:pt-8 text-3xl sm:text-5xl lg:text-7xl font-bold'>
            ROOTED
          </h3>

          <p className='pt-6 pb-4 text-base sm:text-lg lg:text-xl leading-relaxed'>
            <span className='font-bold'>FRIDAYS | 5-11PM</span> 
            <br />
            Dunkirk &amp; Old Lenton Community Centre,
             <span className='font-bold'>NG7 2JW</span>
          </p>

          <p className='text-base sm:text-lg lg:text-xl leading-relaxed'>
            Join us weekly in-person for worship, teaching and prayer integrated around the three 
            <br className='hidden sm:block' />
            focus areas: identity, abilities, responsibilities. This is an immersive and spirit-led space for group 
            <br className='hidden sm:block' />
            ministry, activation and prophetic encouragement. You'll experience spiritual refreshment,
             <br className='hidden sm:block' />
            grounding and fellowship in the local community.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Programs
