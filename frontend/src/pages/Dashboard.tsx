import { ArrowRight, BookOpen, Clock3, Flame, Heart, Search } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { sampleDecks } from '../data/decks'

export function Dashboard({ navigate, favoritesOnly = false }: { navigate: (path: string) => void; favoritesOnly?: boolean }) {
  const { session } = useAuth()
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const favoritesKey = `karta.favorites.${session?.email ?? 'guest'}`
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(favoritesKey) || '[]')
      return Array.isArray(saved) ? saved.filter(value => typeof value === 'number') : []
    } catch {
      return []
    }
  })
  const name = session?.user?.name || session?.email.split('@')[0] || 'Estudante'
  const currentDate = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toLocaleUpperCase('pt-BR')
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
  const difficulties = [...new Set(sampleDecks.map(deck => deck.difficultyLevel))]
  const filtered = sampleDecks.filter(deck => {
    const matchesQuery = `${deck.title} ${deck.language}`.toLocaleLowerCase('pt-BR').includes(normalizedQuery)
    const matchesDifficulty = difficulty === 'all' || deck.difficultyLevel === difficulty
    return matchesQuery && matchesDifficulty && (!favoritesOnly || favorites.includes(deck.id))
  })

  function toggleFavorite(deckId: number) {
    setFavorites(current => {
      const next = current.includes(deckId) ? current.filter(id => id !== deckId) : [...current, deckId]
      localStorage.setItem(favoritesKey, JSON.stringify(next))
      return next
    })
  }

  return <div className="page-wrap">
    <section className="welcome-row">
      <div><span className="eyebrow">{currentDate}</span><h1>{favoritesOnly ? 'Seus favoritos' : <>Olá, {name}. <em>Vamos aprender?</em></>}</h1><p>{favoritesOnly ? 'Os decks que você guardou para encontrar mais rápido.' : 'Seu próximo pequeno avanço começa agora.'}</p></div>
      {!favoritesOnly && <button className="primary-button compact" onClick={() => navigate('/study/1')}><BookOpen size={18} /> Continuar estudando</button>}
    </section>
    {!favoritesOnly && <section className="stats-grid">
      <article><span className="stat-icon coral"><Flame /></span><div><b>4</b><span>dias de sequência</span></div><small>Seu recorde: 7</small></article>
      <article><span className="stat-icon blue"><BookOpen /></span><div><b>86</b><span>cards estudados</span></div><small>+12 nesta semana</small></article>
      <article><span className="stat-icon yellow"><Clock3 /></span><div><b>1h 24</b><span>tempo de estudo</span></div><small>Nos últimos 7 dias</small></article>
    </section>}
    <section className="library-section">
      <div className="section-heading"><div><span className="eyebrow">SUA BIBLIOTECA</span><h2>{favoritesOnly ? 'Decks salvos' : 'Escolha seu próximo deck'}</h2></div><div className="search-row"><label className="search-box"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por deck ou idioma" aria-label="Buscar por deck ou idioma" /></label><select className="filter-select" value={difficulty} onChange={event => setDifficulty(event.target.value)} aria-label="Filtrar por dificuldade"><option value="all">Todas as dificuldades</option>{difficulties.map(value => <option key={value} value={value}>{value}</option>)}</select></div></div>
      <div className="deck-grid">
        {filtered.map(deck => <article className="deck-card" key={deck.id}>
          <div className="deck-visual" style={{ background: deck.accent }}><span>{deck.symbol}</span><button className={favorites.includes(deck.id) ? 'favorited' : ''} onClick={() => toggleFavorite(deck.id)} aria-label={favorites.includes(deck.id) ? `Remover ${deck.title} dos favoritos` : `Adicionar ${deck.title} aos favoritos`} aria-pressed={favorites.includes(deck.id)}><Heart /></button></div>
          <div className="deck-body"><div className="deck-meta"><span>{deck.language}</span><i />{deck.difficultyLevel}</div><h3>{deck.title}</h3><p>{deck.description}</p><div className="progress-label"><span>{deck.cardCount} cards</span><b>{deck.progress}%</b></div><div className="progress-track"><i style={{ width: `${deck.progress}%`, background: deck.accent }} /></div><button className="text-button" onClick={() => navigate(`/study/${deck.id}`)}>{deck.progress ? 'Continuar deck' : 'Começar deck'} <ArrowRight /></button></div>
        </article>)}
      </div>
      {!filtered.length && <div className="empty-state"><Heart /><h3>Nenhum deck por aqui ainda</h3><p>Tente outra busca ou favorite um deck na biblioteca.</p></div>}
      {!favoritesOnly && <div className="demo-note">Conteúdo de demonstração enquanto a API de decks é construída.</div>}
    </section>
  </div>
}
