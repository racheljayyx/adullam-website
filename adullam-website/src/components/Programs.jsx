function Programs() {
    return(
        <section id='programs'>

            {/* TODO [AW-20]: Add images to the three div sections*/}

            <h1 className= 'text-xl px-10 py-10' >OUR PROGRAMS</h1>

            <div className='w-full h-115 bg-black/60 text-center text-white pt-10'>
                
                <h2 className='inline-block border border-white p-2'>
                    &nbsp;BIBLE STUDY&nbsp;
                </h2>

                <h3 className='pt-8 text-7xl'>
                    Join us ever <span className='font-bold'>Saturday</span> Morning
                </h3>
                <p className='pt-15 pb-10 text-xl'>
                    We meet online at 7-9AM every Saturday Morning for Bible Study, Teaching and Discussion. <br />
                    This will deepen your Biblical understanding, personal conviction, and application. <br />
                    Make sure to set your alarm and invite a friend!
                </p>
                <button className='bg-white text-black font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition w-30'>
                    Join Here
                </button>
            </div>

            <br />

            <div className='w-full h-115 bg-black/60 text-center text-white pt-10'>
                
                <h2 className='inline-block border border-white p-2'>
                    &nbsp;DAILY PRAYER&nbsp;
                </h2>

                <h3 className='pt-8 text-7xl font-bold'>
                    THE FORGE
                </h3>
                <p className='pt-15 pb-10 text-xl'>
                    <span className='font-bold'>9:00-9:15 PM:</span> Bible Reading <br />
                    <span className='font-bold'>9:15-10:45 PM:</span> Prayer <br />
                    <span className='font-bold'>10:45-11:00 PM:</span> Book Reading <br />

                    Building daily discipline and sensitivity to the Holy Spirit.
                </p>
                <button className='bg-white text-black font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition w-30'>
                    Let's Pray
                </button>
            </div>

            <br />

            <div className='w-full h-115 bg-black/60 text-center text-white pt-10'>
                
                <h2 className='inline-block border border-white p-2'>
                    &nbsp;IN-PERSON GATHERING&nbsp;
                </h2>

                <h3 className='pt-8 text-7xl font-bold'>
                    ROOTED
                </h3>
                <p className='pt-15 pb-4 text-xl'>
                    <span className='font-bold'>FRIDAYS | 5-11PM</span> <br />
                    Dunkirk & Old Lenton Community Centre, <span className='font-bold'>NG7 2JW</span>
                </p>
                <p className='text-xl'>
                    Join us weekly in-person weekly for worship, teaching and prayer integrated around the three <br />
                    focus areas: identity, abilities, responsibilities. This is an immersive and spirit-led space for group <br />
                    ministry, activation and prophetic encouragement. You'll experience spiritual refreshment, <br />
                    grounding and fellowship in the local community.
                </p>
            </div>

            <br />
        </section>
    )
}

export default Programs