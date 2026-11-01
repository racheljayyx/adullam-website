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
    category: 'Weekly prayer Saturday evening',
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
  },
  {
    frequency: 'December 4–6, 2026',
    category: 'Quarterly online meeting',
    title: 'The Call: Ananias of Damascus',
    details: (
      <>
        <p className='mb-6 text-sm font-bold uppercase tracking-[0.16em]'>Online</p>

        <div className='space-y-6'>
          <div>
            <p className='font-bold'>Friday, December 4</p>
            <ul className='mt-2 space-y-1.5'>
              <li>7:00 PM–9:00 PM — Teaching + Spoken Word</li>
              <li>9:00 PM–10:00 PM — Praying</li>
            </ul>
          </div>

          <div>
            <p className='font-bold'>Saturday, December 5</p>
            <ul className='mt-2 space-y-1.5'>
              <li>7:00 AM–9:00 AM — Teaching + Spoken Word</li>
              <li>9:00 AM–5:00 PM — Praying</li>
              <li>7:00 PM–10:00 PM — Prayer &amp; Worship</li>
            </ul>
          </div>

          <div>
            <p className='font-bold'>Sunday, December 6</p>
            <ul className='mt-2 space-y-1.5'>
              <li>9:00 AM–5:00 PM — Prayer</li>
              <li>7:00 PM–9:00 PM — Teaching + Spoken Word</li>
              <li>9:00 PM–10:00 PM — Praying</li>
            </ul>
          </div>
        </div>
      </>
    ),
    action: 'Sign Up',
    actionUrl: 'https://tinyurl.com/thecallretreat2026',
  },
]

const upcomingRetreats = [
  { month: 'April', dates: '2–4 April 2027' },
  { month: 'June', dates: '4–6 June 2027' },
  { month: 'September', dates: '3–5 September 2027' },
  { month: 'December', dates: '3–5 December 2027' },
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
                    href={program.actionUrl || 'https://bit.ly/adullammeeting'}
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

        <div className='pt-10 sm:pt-14'>
          <h2 className='pb-9 text-center text-2xl sm:text-3xl'>
            UPCOMING RETREATS
          </h2>

          <article className='grid overflow-hidden rounded-2xl border border-black/10 shadow-sm md:grid-cols-2'>
            <div className='flex min-h-80 flex-col justify-between bg-black p-7 text-white sm:p-10 lg:min-h-[32rem] lg:p-12'>
              <div className='flex items-center gap-3'>
                <span className='h-px w-8 bg-[#C0AA95]' aria-hidden='true' />
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#E3D6C8] sm:text-sm'>
                  2027 retreat calendar
                </p>
              </div>

              <div>
                <h3 className='max-w-2xl text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl'>
                  Save the dates
                </h3>
                <p className='mt-6 inline-flex rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold uppercase tracking-[0.14em] text-[#E3D6C8]'>
                  In person + online
                </p>
              </div>
            </div>

            <div className='flex min-h-80 flex-col justify-between bg-[#E3D6C8] p-7 text-black sm:p-10 lg:min-h-[32rem] lg:p-12'>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.2em] text-black/60 sm:text-sm'>
                  First weekend gatherings
                </p>
                <div className='mt-7 grid gap-3 sm:grid-cols-2'>
                  {upcomingRetreats.map((retreat) => (
                    <div key={retreat.month} className='rounded-xl border border-black/10 bg-white/45 p-4 sm:p-5'>
                      <p className='text-xs font-bold uppercase tracking-[0.16em] text-black/50'>{retreat.month}</p>
                      <p className='mt-2 text-lg font-semibold'>{retreat.dates}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className='mt-8 border-t border-black/20 pt-7'>
                <p className='text-xs font-bold uppercase tracking-[0.2em] text-black/60'>Location</p>
                <h3 className='mt-3 text-2xl font-semibold'>Great Hall, Trent Building</h3>
                <address className='mt-2 max-w-xl text-base not-italic leading-relaxed sm:text-lg'>
                  University of Nottingham, Nottingham, NG7 2RD
                </address>
                <p className='mt-5 text-base leading-relaxed sm:text-lg'>
                  All retreats are available in person and online.
                </p>
              </div>
            </div>
          </article>
        </div>

        <div className='pt-10 sm:pt-14'>
          <h2 className='pb-9 text-center text-2xl sm:text-3xl'>
            ADULLAM NOTTINGHAM
          </h2>

          <article className='grid overflow-hidden rounded-2xl border border-black/10 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-black/25 hover:shadow-lg motion-reduce:transition-none md:grid-cols-2'>
            <div className='flex min-h-80 flex-col justify-between bg-black p-7 text-white sm:p-10 lg:min-h-[32rem] lg:p-12'>
              <div className='flex items-center gap-3'>
                <span className='h-px w-8 bg-[#C0AA95]' aria-hidden='true' />
                <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#E3D6C8] sm:text-sm'>
                  In-person event
                </p>
              </div>

              <div>
                <p className='text-xs font-bold uppercase tracking-[0.2em] text-white/60 sm:text-sm'>
                  1st Saturday of every month
                </p>
                <h3 className='mt-5 max-w-2xl text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl'>
                  Monthly Prayer &amp; Worship Meeting
                </h3>
                <p className='mt-6 text-xl font-semibold text-[#E3D6C8] sm:text-2xl'>
                  7:00 PM – 12:00 AM
                </p>
              </div>
            </div>

            <div className='flex min-h-80 flex-col justify-between bg-[#E3D6C8] p-7 text-black sm:p-10 lg:min-h-[32rem] lg:p-12'>
              <div>
                <p className='text-xs font-bold uppercase tracking-[0.2em] text-black/60 sm:text-sm'>
                  Location
                </p>
                <h3 className='mt-4 text-2xl font-semibold sm:text-3xl'>
                  Dunkirk Community Centre
                </h3>
                <address className='mt-3 max-w-md text-base not-italic leading-relaxed sm:text-lg'>
                  The Old School, Montpelier Rd, Dunkirk, Nottingham
                  <br />
                  NG7 2JW
                </address>

                <p className='mt-8 max-w-xl text-base leading-relaxed sm:text-lg'>
                  Join us for a powerful evening of intercession, extended
                  worship, and spiritual renewal. In-person at Dunkirk Community
                  Centre.
                </p>
              </div>

              <p className='mt-10 border-t border-black/20 pt-6 text-lg font-bold uppercase tracking-[0.15em] sm:text-xl'>
                Come and be refreshed
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default Programs
