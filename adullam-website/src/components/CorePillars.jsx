import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

const corePillars = [
  {
    title: 'Rooted in Scripture',
    content: 'Our teachings and practices flow from God\'s Word.'
  },
  {
    title: 'Spirit-Led',
    content: 'We depend on the guidance and power of the Holy Spirit.'
  },
  {
    title: 'Community',
    content: 'We grow together through authentic relationships and mutual support.'
  },
  {
    title: 'Activation',
    content: 'Equipping believers for active ministry in all areas of life.'
  },
  {
    title: 'Walking in Love',
    content: 'Living out God\'s love through character, humility and compassion.'
  }
];

function CorePillars() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id='core-pillars' className='px-4 sm:px-8 lg:px-16 space-y-4 py-12'>
      <h1 className='text-2xl sm:text-3xl py-9 text-center'>
        CORE PILLARS
      </h1>

      <div className='rounded-2xl shadow-lg divide-y divide-gray-600 bg-black'>
        {corePillars.map((pillar, index) => (
          <div key={index} className='px-6'>
            <button
              onClick={() => toggleItem(index)}
              className='w-full flex justify-between items-center py-5 text-left focus:outline-none'
            >
              <span className='font-semibold text-lg text-white'>
                {pillar.title}
              </span>
              {openIndex === index ? (
                <ChevronUpIcon className='h-6 w-6 text-gray-400' />
              ) : (
                <ChevronDownIcon className='h-6 w-6 text-gray-400' />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index
                  ? 'max-h-40 opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <p className='pb-5 text-gray-300'>{pillar.content}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CorePillars
