function About() {
  return (
    <>
      <section id='about'>
      <h1 className='text-2xl sm:text-3xl py-9 text-center'>
        ABOUT US
      </h1>

        <div className='flex flex-col md:flex-row md:space-x-10 space-y-6 md:space-y-0 justify-center px-10'>
          <div className='w-full md:w-1/3 h-auto flex flex-col text-left px-8 py-12 text-white bg-black rounded-lg'>
            <h1 className='text-6xl md:text-4xl mb-6'>Our Mission</h1>
            <p className='py-6'>
              To raise a people of consistency in
              spiritual routines through discipleship,
              who have a clear understanding of our
              identity, abilities, and responsibilities
              because of what Christ has done.
            </p>
          </div>

          <div className='w-full md:w-1/3 h-auto flex flex-col text-left px-8 py-12 text-white bg-black rounded-lg'>
            <h1 className='text-6xl md:text-4xl mb-6'>Our Vision</h1>
            <p className='py-6'>
              To raise a generation of Christ-
              centred believers who know their
              identity, and walk in Spirit-empowered
              abilities, and fulfill their
              responsibilities with clarity and love.
            </p>
          </div>

          <div className='w-full md:w-1/3 h-auto flex flex-col text-left px-8 py-12 text-white bg-black rounded-lg'>
            <h1 className='text-6xl md:text-4xl mb-6'>Core Scripture</h1>
            <p className='py-6'>
              'Let your roots grow down into Him,
              <br />
              and let your lives be built on Him.'
              <br />
              <br />
              Colossians 2:7
            </p>
          </div>
        </div>

        <br />
        <br />

        <div className='w-full flex flex-col items-center text-center py-16'>
          <h2 className='text-xl md:text-2xl mb-6'>
            What does{' '}
            <span className='relative inline-block'>
              <span className='font-bold'>Adullam</span>

              <svg
                className='absolute left-0 bottom-[-14px] w-full h-4 text-black'
                viewBox='0 0 100 10'
                preserveAspectRatio='none'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M0,5 Q50,-5 100,5'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='transparent'
                />
              </svg>

              <svg
                className='absolute left-0 bottom-[-22px] w-full h-4 text-black'
                viewBox='0 0 100 10'
                preserveAspectRatio='none'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M0,5 Q50,-5 100,5'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='transparent'
                />
              </svg>
            </span>{' '}
            mean?
          </h2>

          <p className='max-w-2xl text-center text-black'>
            <i>Adullam</i> is a place of transformation for David's followers,
            representing growth, equipping and the emergence of leaders.
            Spirit-led empowerment grounded in God's word.
          </p>
        </div>

        <div
          className='w-auto h-auto flex flex-col text-center text-white px-10 py-10'
          style={{ backgroundColor: '#C0AA95' }}
        >
          <p className='leading-relaxed'>
            “David left Gath and escaped to the cave of Adullam. When his
            brothers and his father's
            household heard about it, they went down to him there. All those who
            were in distress or
            in debt or discontented gathered around him, and he became their
            commander.
            About four hundred men were with him.”
          </p>
          <p className='pt-5 font-bold'>1 Samuel 22:1-2</p>
        </div>
      </section>
    </>
  )
}

export default About
