import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Home from './pages/Home.jsx'
import Give from './pages/Give.jsx'
import NotFound from './pages/NotFound.jsx'
import AppLayout from './layouts/AppLayout.jsx'

const WatchParties = lazy(() => import('./pages/WatchParties.jsx'))
const HostWatchParty = lazy(() => import('./pages/HostWatchParty.jsx'))
const WatchPartyDetails = lazy(() => import('./pages/WatchPartyDetails.jsx'))
const WatchPartyVerify = lazy(() => import('./pages/WatchPartyVerify.jsx'))
const WatchPartyPreferences = lazy(() => import('./pages/WatchPartyPreferences.jsx'))
const AdminWatchParties = lazy(() => import('./pages/AdminWatchParties.jsx'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {index: true, element: <Home /> }, 
      {path: 'Give', element: <Give /> },
      {path: 'watch-parties', element: <WatchParties /> },
      {path: 'watch-parties/host', element: <HostWatchParty /> },
      {path: 'watch-parties/verify', element: <WatchPartyVerify /> },
      {path: 'watch-parties/preferences', element: <WatchPartyPreferences /> },
      {path: 'watch-parties/:id', element: <WatchPartyDetails /> },
      {path: 'admin/watch-parties', element: <AdminWatchParties /> },
      {path: '*', element: <NotFound /> },
    ],
  },
])

function App() {

  return (
    <Suspense fallback={<div className='min-h-[60vh] bg-[#F7F3EF] px-5 py-24 text-center' role='status'>Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App
