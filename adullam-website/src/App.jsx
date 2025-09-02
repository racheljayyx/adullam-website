import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'

function App() {
  const [count, setCount] = useState(0)

  return (
   <div className='bg-white min-h-screen'>
      <Navbar />
      <main className="p-6">
        <h1 className="text-2xl font-bold">Welcome to Adullam Academy</h1>
      </main>
   </div>
  
  )
}

export default App
