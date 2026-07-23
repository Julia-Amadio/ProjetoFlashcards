import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { StudyPage } from './pages/StudyPage'

function routeFromLocation() { return window.location.pathname }

export default function App() {
  const { session } = useAuth()
  const [route, setRoute] = useState(routeFromLocation)
  const navigate = (path: string) => { window.history.pushState({}, '', path); setRoute(path); window.scrollTo(0, 0) }
  useEffect(() => { const pop = () => setRoute(routeFromLocation()); window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop) }, [])

  if (!session) return <AuthPage mode={route === '/register' ? 'register' : 'login'} navigate={navigate} />
  const authenticatedRoute = route === '/login' || route === '/register' ? '/' : route
  if (authenticatedRoute === '/study') return <StudyPage navigate={navigate} />
  const page = authenticatedRoute === '/favorites' ? 'favorites' : 'home'
  return <AppShell page={page} navigate={navigate}><Dashboard navigate={navigate} favoritesOnly={page === 'favorites'} /></AppShell>
}
