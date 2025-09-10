import React, { useEffect, useRef, useState } from "react";

const coreValues = [
  {
    title: 'CHRIST CENTRED',
    description: 'Keeping Christ at the heart of all we do.'
  },
  {
    title: 'IDENTITY',
    description: 'Grounding believers in who they are in Christ.'
  },
  {
    title: 'ABILITIES',
    description: 'Cultivating the fullness of the Spirit expressed through each believer.'
  },
  {
    title: 'RESPONSIBILITIES',
    description: 'Empowering them to walk in spiritual maturity and active service.'
  }
];

function CoreValues() {
  const [visibleIndexes, setVisibleIndexes] = useState([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            setVisibleIndexes(prev => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.3 } 
    );

    cardRefs.current.forEach(card => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id='core-values' className='px-4 sm:px-8 lg:px-16 py-12'>
      <h1 className='text-2xl sm:text-3xl py-9 text-center'>
        CORE VALUES
      </h1>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {coreValues.map((value, index) => (
          <div
            key={index}
            data-index={index}
            ref={el => (cardRefs.current[index] = el)}
            className='relative h-64 bg-black rounded-xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl border border-gray-700'
          >
            <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 pointer-events-none'></div>

            <div className='absolute inset-0 flex items-center justify-center p-4'>
              <span className='text-white font-bold text-lg sm:text-xl lg:text-2xl tracking-wide drop-shadow'>
                {value.title}
              </span>
            </div>

            <div
              className={`absolute inset-0 bg-black/80 flex items-center justify-center transition-all duration-700 p-6 text-center
                ${visibleIndexes.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
              <p className='text-base sm:text-lg' style={{ color: '#E3D6C8' }}>
                {value.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CoreValues
