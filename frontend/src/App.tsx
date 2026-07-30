import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { useAuth } from './context/AuthContext'
import { AdminDecksPage } from './pages/AdminDecksPage'
import { AdminFlashcardsPage } from './pages/AdminFlashcardsPage'
import { AuthPage } from './pages/AuthPage'
import { GenerateDeckPage } from './pages/GenerateDeckPage'
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
      '/admin/generate': 'Karta — Gerar deck',
      '/admin/decks': 'Karta — Gerenciar decks',
      '/settings': 'Karta — Configurações',
      '/login': 'Karta — Entrar',
      '/register': 'Karta — Criar conta',
    }
    document.title = route.startsWith('/study/')
      ? 'Karta — Estudo'
      : /^\/admin\/decks\/\d+\/flashcards\/?$/.test(route)
        ? 'Karta — Gerenciar flashcards'
        : pageTitles[route] ?? 'Karta — Página não encontrada'
  }, [route])

  if (!session) return <AuthPage mode={route === '/register' ? 'register' : 'login'} navigate={navigate} />
  const authenticatedRoute = route === '/login' || route === '/register' ? '/' : route
  const studyMatch = authenticatedRoute.match(/^\/study\/(\d+)\/?$/)
  if (studyMatch) return <StudyPage deckId={Number(studyMatch[1])} navigate={navigate} />
  const canGenerate = session.user?.role === 'ROLE_ADMIN'
  const adminFlashcardsMatch = canGenerate
    ? authenticatedRoute.match(/^\/admin\/decks\/(\d+)\/flashcards\/?$/)
    : null
  const knownPages = ['/', '/favorites', '/settings', ...(canGenerate ? ['/admin/generate', '/admin/decks'] : []), ...(adminFlashcardsMatch ? [authenticatedRoute] : [])]
  const page = authenticatedRoute === '/favorites'
    ? 'favorites'
    : authenticatedRoute === '/settings'
      ? 'settings'
      : authenticatedRoute === '/admin/generate'
        ? 'generate'
        : authenticatedRoute === '/admin/decks'
          ? 'manage-decks'
        : adminFlashcardsMatch
          ? 'manage-decks'
        : authenticatedRoute === '/'
          ? 'home'
          : 'not-found'
  return <AppShell page={page} navigate={navigate}>
    {!knownPages.includes(authenticatedRoute)
      ? <NotFoundPage navigate={navigate} />
      : page === 'settings'
        ? <SettingsPage navigate={navigate} />
        : page === 'generate'
          ? <GenerateDeckPage navigate={navigate} />
        : page === 'manage-decks'
          ? adminFlashcardsMatch
            ? <AdminFlashcardsPage deckId={Number(adminFlashcardsMatch[1])} navigate={navigate} />
            : <AdminDecksPage navigate={navigate} />
        : <Dashboard navigate={navigate} favoritesOnly={page === 'favorites'} />}
  </AppShell>
}
