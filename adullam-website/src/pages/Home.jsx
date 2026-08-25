import Hero from '../components/Hero'
import About from '../components/About'
import Programs from '../components/Programs'
import Mentoring from '../components/Mentoring'
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
            <Mentoring />
        </div>
    )
}

export default Home
