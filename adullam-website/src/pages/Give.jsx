const bankDetails = [
  { label: 'Account name', value: 'Adullam Academy Limited' },
  { label: 'Account number', value: '33139460' },
  { label: 'Sort code', value: '30-54-66' },
  { label: 'Bank', value: 'Lloyds Bank' },
]

function Give() {
  return (
    <main className='px-4 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20'>
      <section className='mx-auto max-w-7xl overflow-hidden rounded-2xl border border-black/10 shadow-sm md:grid md:grid-cols-2'>
        <div className='flex min-h-80 flex-col justify-between bg-black p-7 text-white sm:p-10 lg:min-h-[36rem] lg:p-12'>
          <div className='flex items-center gap-3'>
            <span className='h-px w-8 bg-[#C0AA95]' aria-hidden='true' />
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[#E3D6C8] sm:text-sm'>
              Support the mission
            </p>
          </div>

          <div>
            <h1 className='text-5xl font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl'>
              Give
            </h1>
            <p className='mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg'>
              Your generosity helps us continue raising, equipping and sending
              Christ-centred believers.
            </p>
          </div>
        </div>

        <div className='flex flex-col justify-center bg-[#E3D6C8] p-7 text-black sm:p-10 lg:min-h-[36rem] lg:p-12'>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-black/60 sm:text-sm'>
            Bank transfer details
          </p>
          <h2 className='mt-4 text-3xl font-light tracking-tight sm:text-4xl'>
            Give by bank transfer
          </h2>

          <dl className='mt-10 divide-y divide-black/15 border-y border-black/15'>
            {bankDetails.map((detail) => (
              <div
                key={detail.label}
                className='flex flex-col gap-1 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6'
              >
                <dt className='text-sm font-semibold text-black/60'>
                  {detail.label}
                </dt>
                <dd className='text-lg font-semibold tracking-tight sm:text-right'>
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>

        </div>
      </section>
    </main>
  )
}

export default Give
