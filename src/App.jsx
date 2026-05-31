import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth'
import { auth } from './firebase'
import Auth from './components/Auth'
import Navbar from './components/Navbar'
import Today from './components/Today'
import TaskList from './components/TaskList'
import Calendar from './components/Calendar'
import AIExport from './components/AIExport'

const VIEWS = { today: Today, tasks: TaskList, calendar: Calendar, export: AIExport }

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('today')

  useEffect(() => {
    getRedirectResult(auth).catch(() => {})
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  )

  if (!user) return <Auth />

  const ViewComponent = VIEWS[view]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={user} view={view} setView={setView} onSignOut={() => signOut(auth)} />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <ViewComponent user={user} />
      </main>
    </div>
  )
}
