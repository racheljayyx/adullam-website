const programs = [
  {
    frequency: 'Every day',
    category: 'Daily prayer',
    title: 'Prayer Call',
    details: (
      <p>
        <span className='font-bold'>9:00 PM - 10:00 PM:</span> Prayer
        <br />
        Building daily discipline and sensitivity to the Holy Spirit.
      </p>
    ),
    action: "Let's Pray",
  },
  {
    frequency: 'Every week',
    category: 'Weekly prayer',
    title: 'Prayer Call',
    details: (
      <p>
        <span className='font-bold'>9:00 PM - 00:00 AM:</span> Prayer
        <br />
        Building daily discipline and sensitivity to the Holy Spirit.
      </p>
    ),
    action: "Let's Pray",
  },
  {
    frequency: 'Saturday mornings',
    category: 'Weekly Bible study',
    title: (
      <>
        Join us every <span className='font-bold'>Saturday</span> Morning
      </>
    ),
    details: (
      <p>
        We meet online at 07:00 AM to 09:00 AM every Saturday Morning for Bible Study, Teaching and Discussion.
        <br className='hidden sm:block' />
        This will deepen your Biblical understanding, personal conviction, and application.
        <br className='hidden sm:block' />
        Make sure to set your alarm and invite a friend!
      </p>
    ),
    action: 'Join Here',
  },
  {
    frequency: 'Every Thursday',
    category: 'Weekly fasting',
    title: (
      <>
        Fast together <span className='font-bold'>every Thursday</span> (Breakfast Fast)
      </>
    ),
    details: <p>Building daily discipline and sensitivity to the Holy Spirit.</p>,
    action: "Let's Pray",
  },
  {
    frequency: 'Friday evenings',
    category: 'In-person gathering',
    title: 'The Call',
    details: (
      <>
        <p className='mb-6'>
          <span className='font-bold'>FRIDAYS | 5-11PM</span>
          <br />
          Dunkirk &amp; Old Lenton Community Centre, <span className='font-bold'>NG7 2JW</span>
        </p>
        <p>
          Join us weekly in-person for worship, teaching and prayer integrated around the three
          focus areas: identity, abilities, responsibilities. This is an immersive and spirit-led space for group
          ministry, activation and prophetic encouragement. You'll experience spiritual refreshment,
          grounding and fellowship in the local community.
        </p>
      </>
    ),
  },
]

function Programs() {
  return (
    <section id='programs' className='px-4 py-12 sm:px-8 lg:px-16'>
      <h1 className='py-9 text-center text-2xl sm:text-3xl'>OUR PROGRAMS</h1>

      <div className='mx-auto max-w-7xl space-y-6 lg:space-y-8'>
        {programs.map((program, index) => {
          const isReversed = index % 2 === 1

          return (
            <article
              key={program.category}
              className='grid overflow-hidden rounded-2xl border border-black/10 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-black/25 hover:shadow-lg motion-reduce:transition-none md:grid-cols-2'
            >
              <div
                className={`flex min-h-64 flex-col justify-between bg-black p-7 text-white sm:p-10 lg:min-h-80 lg:p-12 ${
                  isReversed ? 'md:order-2' : 'md:order-1'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <span className='h-px w-8 bg-[#C0AA95]' aria-hidden='true' />
                  <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#E3D6C8] sm:text-sm'>
                    {program.category}
                  </p>
                </div>
                <h2 className='mt-12 max-w-2xl text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl'>
                  {program.title}
                </h2>
              </div>

              <div
                className={`flex min-h-64 flex-col justify-between bg-[#E3D6C8] p-7 text-black sm:p-10 lg:min-h-80 lg:p-12 ${
                  isReversed ? 'md:order-1' : 'md:order-2'
                }`}
              >
                <div>
                  <p className='mb-7 text-xs font-bold uppercase tracking-[0.2em] text-black/60 sm:text-sm'>
                    {program.frequency}
                  </p>
                  <div className='max-w-2xl text-base leading-relaxed sm:text-lg'>
                    {program.details}
                  </div>
                </div>

                {program.action && (
                  <a
                    href='https://bit.ly/adullammeeting'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-8 inline-flex w-fit items-center rounded-full bg-black px-6 py-3 font-bold text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none'
                  >
                    {program.action}
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Programs
