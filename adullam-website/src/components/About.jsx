function About() {
    return(
        <>
            <section id='about'>
                <h1 className= 'text-xl px-10 py-10' >ABOUT US</h1>

                <div flex ></div>


                <div className='flex space-x-10 justify-center'>
                    <div className='w-100 h-110 z-0 flex flex-col text-left px-8 pb-35 py-10 text-white bg-black' >
                        <h1 className='text-6xl md:text-4xl mb-4'>Our Mission</h1>
                        <p className='py-30'>
                            To raise a people of consistency in <br />
                            spiritual routines through <br />
                            discipleship, who have a clear <br />
                            understanding of our redemption <br />
                            (what Christ has done).
                        </p>
                    </div>
                    <div className='w-100 h-110 z-0 flex flex-col text-left px-8 pb-35 py-10 text-white bg-black' >
                        <h1 className='text-6xl md:text-4xl mb-4'>Our Vision</h1>
                        <p className='py-30'>
                            To raise a generation of Christ-<br />
                            centred believers who know their<br />
                            identity, and walk in Spirit-empowered<br />
                            abilities, and fulfill their <br /> 
                            responsibilities with clarity and love.
                        </p>
                    </div>
                    <div className='w-100 h-110 z-0 flex flex-col text-left px-8 pb-35 py-10 text-white bg-black' >
                        <h1 className='text-6xl md:text-4xl mb-4'>Core Scripture</h1>
                        <p className='py-30'>
                            "Let your roots grow down into Him,<br />
                            and let your lives be built on Him."
                            <br />
                            <br />
                            Colossians 2:7
                        </p>
                    </div>

                </div>

                <br />
                <br />

                {/* TODO [AW-18]: Change background to image*/}
                <div className='w-full h-140 flex flex-col z-0' style={{ backgroundColor: '#C0AA95' }}>
                    <div className='ml-60 mt-15 w-90 h-100 z-10 bg-white px-9'>
                        <h2 className='text-xl py-15 font-bold'> 
                            What does Adullam <br />
                            mean?
                        </h2>
                        <p>
                            <i>Adullam</i> is a place of <br />
                            transformation for David's <br />
                            followers, representing growth, <br />
                            equipping and the emergence of leaders. <br />
                            Spirit-led empowerment <br />
                            grounded in God's word.

                        </p>
                    </div>
                </div>

                <br />
                <br />

                <div className='w-full h-70 flex flex-col text-center text-white' style={{ backgroundColor: '#C0AA95' }}>
                    <p className='pt-15'>
                        “David left Gath and escaped to the cave of Adullam. When his brothers and his father's <br />
                         household heard about it, they went down to him there. All those who were in distress or <br />
                         in debt or discontented gathered around him, and he became their commander.<br />
                        About four hundred men were with him.”
                    </p>
                    <p className='pt-5 font-bold'>
                        1 Samuel 22:1-2
                    </p>
                </div>
            </section>

        </>

    )
}

export default About