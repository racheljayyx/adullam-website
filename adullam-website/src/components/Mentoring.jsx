function Mentoring() {
  return (
    <section id='mentoring' className='px-4 py-12 sm:px-8 lg:px-16'>
      <div className='mx-auto max-w-7xl overflow-hidden rounded-2xl border border-black/10 shadow-sm md:grid md:grid-cols-2'>
        <div className='flex flex-col justify-center bg-black p-7 text-white sm:p-10 lg:min-h-[32rem] lg:p-12'>
          <div className='flex items-center gap-3'>
            <span className='h-px w-8 bg-[#C0AA95]' aria-hidden='true' />
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#E3D6C8] sm:text-sm'>
              Applications now open
            </p>
          </div>

          <h1 className='mt-12 max-w-2xl text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl'>
            Adullam Academy Mentoring Programme
          </h1>
        </div>

        <div className='flex flex-col justify-center bg-[#E3D6C8] p-7 text-black sm:p-10 lg:min-h-[32rem] lg:p-12'>
          <p className='text-lg font-semibold leading-relaxed sm:text-xl'>
            Ready to take the next step in your spiritual growth? Applications are officially open for our upcoming cohort!
          </p>

          <dl className='mt-8 space-y-5 text-base leading-relaxed sm:text-lg'>
            <div>
              <dt className='font-bold'>Duration:</dt>
              <dd>October 2026 – September 2027</dd>
            </div>

            <div>
              <dt className='font-bold'>Format:</dt>
              <dd>Predominantly online — open to applicants from any location worldwide!</dd>
            </div>

            <div>
              <dt className='font-bold'>Capacity:</dt>
              <dd>Only 20 spots available</dd>
            </div>
          </dl>

          <div className='mt-8 border-t border-black/20 pt-8'>
            <h2 className='text-lg font-bold sm:text-xl'>How to Apply:</h2>
            <p className='mt-2 text-base leading-relaxed sm:text-lg'>
              If you&apos;re interested, kindly complete the application form and send to mentor@adullamacademy.co.uk.
            </p>
            <a
              href='/adullam-academy-mentoring-application-2026-27.pdf'
              download
              className='mt-6 inline-flex w-fit items-center rounded-full bg-black px-6 py-3 font-bold text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none'
            >
              Download Application Form
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Mentoring
