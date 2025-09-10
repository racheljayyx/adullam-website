import Hero from '../components/Hero'
import About from '../components/About'
import Programs from '../components/Programs'
import CoreValues from '../components/CoreValues'
import CorePillars from '../components/CorePillars'

function Home() {
    return (
        <div>
            <Hero />
            <About />
            <CoreValues />
            <CorePillars />
            <Programs />
        </div>
    )
}

export default Home