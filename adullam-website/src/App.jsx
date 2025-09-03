import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home.jsx'
import Give from './pages/Give.jsx'
import NotFound from './pages/NotFound.jsx'
import AppLayout from './layouts/AppLayout.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {index: true, element: <Home /> }, 
      {path: 'Give', element: <Give /> },
      {path: '*', element: <NotFound /> },
    ],
  },
])

function App() {

  return  <RouterProvider router={router} />;
}

export default App
