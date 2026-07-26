import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { useAuth } from './context/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { Dashboard } from './pages/Dashboard'
import { NotFoundPage } from './pages/NotFoundPage'
import { SettingsPage } from './pages/SettingsPage'
import { StudyPage } from './pages/StudyPage'

function routeFromLocation() { return window.location.pathname }

export default function App() {
  const { session } = useAuth()
  const [route, setRoute] = useState(routeFromLocation)
  const navigate = (path: string) => { window.history.pushState({}, '', path); setRoute(path); window.scrollTo(0, 0) }
  useEffect(() => { const pop = () => setRoute(routeFromLocation()); window.addEventListener('popstate', pop); return () => window.removeEventListener('popstate', pop) }, [])
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      '/': 'Karta — Visão geral',
      '/favorites': 'Karta — Favoritos',
      '/settings': 'Karta — Configurações',
      '/login': 'Karta — Entrar',
      '/register': 'Karta — Criar conta',
    }
    document.title = route.startsWith('/study/') ? 'Karta — Estudo' : pageTitles[route] ?? 'Karta — Página não encontrada'
  }, [route])

  if (!session) return <AuthPage mode={route === '/register' ? 'register' : 'login'} navigate={navigate} />
  const authenticatedRoute = route === '/login' || route === '/register' ? '/' : route
  const studyMatch = authenticatedRoute.match(/^\/study\/(\d+)\/?$/)
  if (studyMatch) return <StudyPage deckId={Number(studyMatch[1])} navigate={navigate} />
  const knownPages = ['/', '/favorites', '/settings']
  const page = authenticatedRoute === '/favorites' ? 'favorites' : authenticatedRoute === '/settings' ? 'settings' : authenticatedRoute === '/' ? 'home' : 'not-found'
  return <AppShell page={page} navigate={navigate}>
    {!knownPages.includes(authenticatedRoute)
      ? <NotFoundPage navigate={navigate} />
      : page === 'settings'
        ? <SettingsPage navigate={navigate} />
        : <Dashboard navigate={navigate} favoritesOnly={page === 'favorites'} />}
  </AppShell>
}
