import { BookOpen, Heart, RefreshCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageState } from '../components/PageState'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { readStorage, writeStorage } from '../lib/storage'
import type { DeckSummary } from '../types'

export function Dashboard({ navigate, favoritesOnly = false }: { navigate: (path: string) => void; favoritesOnly?: boolean }) {
  const { session } = useAuth()
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const favoritesKey = `karta.favorites.${session?.email ?? 'guest'}`
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = JSON.parse(readStorage(favoritesKey) || '[]')
      return Array.isArray(saved) ? saved.filter(value => typeof value === 'number') : []
    } catch {
      return []
    }
  })
  const name = session?.user?.name || session?.email.split('@')[0] || 'Estudante'
  const currentDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toLocaleUpperCase('pt-BR')
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
  const difficulties = [...new Set(decks.map(deck => deck.difficultyLevel).filter((value): value is string => Boolean(value)))]
  const filtered = decks.filter(deck => {
    const matchesQuery = `${deck.title} ${deck.language}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery)
    const matchesDifficulty = difficulty === 'all' || deck.difficultyLevel === difficulty
    return matchesQuery && matchesDifficulty && (!favoritesOnly || favorites.includes(deck.id))
  })

  useEffect(() => {
    if (!session?.token) return
    const controller = new AbortController()
    setLoading(true)
    setError('')
    api.listDecks(session.token, controller.signal)
      .then(response => setDecks(Array.isArray(response) ? response : []))
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os decks.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey, session?.token])

  function toggleFavorite(deckId: number) {
    setFavorites(current => {
      const next = current.includes(deckId) ? current.filter(id => id !== deckId) : [...current, deckId]
      writeStorage(favoritesKey, JSON.stringify(next))
      return next
    })
  }

  return <div className="page-wrap">
    <section className="welcome-row">
      <div><span className="eyebrow">{currentDate}</span><h1>{favoritesOnly ? 'Seus favoritos' : <>Olá, {name}. <em>Vamos aprender?</em></>}</h1><p>{favoritesOnly ? 'Os decks que você guardou para encontrar mais rápido.' : 'Seu próximo pequeno avanço começa agora.'}</p></div>
      {!favoritesOnly && <button className="primary-button compact" onClick={() => navigate(`/study/${decks[0].id}`)} disabled={!decks.length}><BookOpen size={18} /> Estudar agora</button>}
    </section>
    <section className="library-section">
      <div className="section-heading"><div><span className="eyebrow">SUA BIBLIOTECA</span><h2>{favoritesOnly ? 'Decks salvos' : 'Escolha seu próximo deck'}</h2></div><div className="search-row"><label className="search-box"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por deck ou idioma" aria-label="Buscar por deck ou idioma" /></label><select className="filter-select" value={difficulty} onChange={event => setDifficulty(event.target.value)} aria-label="Filtrar por dificuldade"><option value="all">Todas as dificuldades</option>{difficulties.map(value => <option key={value} value={value}>{value}</option>)}</select></div></div>
      {loading
        ? <PageState kind="loading" title="Carregando decks" description="Buscando sua biblioteca no servidor." />
        : error
          ? <PageState kind="error" title="Não foi possível carregar os decks" description={error} action={<button className="secondary-button" onClick={() => setReloadKey(value => value + 1)}><RefreshCw /> Tentar novamente</button>} />
          : <>
            <div className="deck-grid">
              {filtered.map(deck => {
                const accent = deckAccent(deck.id)
                return <article className="deck-card" key={deck.id}>
                  <div className="deck-visual" style={{ background: accent }}><span>{deckSymbol(deck.language)}</span><button className={favorites.includes(deck.id) ? 'favorited' : ''} onClick={() => toggleFavorite(deck.id)} aria-label={favorites.includes(deck.id) ? `Remover ${deck.title} dos favoritos neste dispositivo` : `Adicionar ${deck.title} aos favoritos neste dispositivo`} aria-pressed={favorites.includes(deck.id)}><Heart /></button></div>
                  <div className="deck-body"><div className="deck-meta"><span>{deck.language}</span>{deck.difficultyLevel && <><i />{deck.difficultyLevel}</>}</div><h3>{deck.title}</h3><p>Pratique o conteúdo deste deck em uma sessão rápida de revisão.</p><button className="text-button" onClick={() => navigate(`/study/${deck.id}`)}>Começar deck</button></div>
                </article>
              })}
            </div>
            {!filtered.length && <PageState kind="empty" icon={Heart} title="Nenhum deck por aqui ainda" description={favoritesOnly ? 'Favorite um deck na biblioteca para encontrá-lo aqui neste dispositivo.' : 'Tente outra busca ou remova o filtro de dificuldade.'} />}
            <div className="demo-note">Favoritos e preferências ficam salvos apenas neste dispositivo.</div>
          </>}
    </section>
  </div>
}

const deckColors = ['#ee725d', '#6c8ed7', '#e8ae45', '#598876', '#9a78bd']

function deckAccent(id: number) {
  return deckColors[Math.abs(id) % deckColors.length]
}

function deckSymbol(language: string) {
  return language.trim().charAt(0).toLocaleUpperCase('pt-BR') || 'A'
}
