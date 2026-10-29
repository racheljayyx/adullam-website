function WatchPartyShell({ eyebrow, title, description, children, compact = false }) {
  return (
    <div className='bg-[#F7F3EF] text-black'>
      <section className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 ${compact ? 'py-12 sm:py-16' : 'py-16 sm:py-24'}`}>
        <div className='max-w-4xl'>
          {eyebrow && (
            <div className='mb-6 flex items-center gap-3'>
              <span className='h-px w-9 bg-[#9A7F67]' aria-hidden='true' />
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-black/60'>
                {eyebrow}
              </p>
            </div>
          )}
          <h1 className='text-4xl font-light leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl'>
            {title}
          </h1>
          {description && (
            <p className='mt-6 max-w-3xl text-base leading-7 text-black/65 sm:text-lg sm:leading-8'>
              {description}
            </p>
          )}
        </div>
        {children}
      </section>
    </div>
  )
}

export default WatchPartyShell

