import { BookOpen, Heart, RefreshCw, Search, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GenerateDeckModal } from '../components/GenerateDeckModal'
import { PageState } from '../components/PageState'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type { DeckSummary } from '../types'

export function Dashboard({ navigate, favoritesOnly = false }: { navigate: (path: string) => void; favoritesOnly?: boolean }) {
  const { session } = useAuth()
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('all')
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [favorites, setFavorites] = useState<number[]>([])
  const [favoritesPending, setFavoritesPending] = useState<number[]>([])
  const [progressByDeck, setProgressByDeck] = useState<Record<number, number>>({})
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const isAdmin = session?.user?.role === 'ROLE_ADMIN'
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

  useEffect(() => {
    if (!session?.token || !session.user?.id) return
    const controller = new AbortController()
    api.getFavorites(session.user.id, session.token, controller.signal)
      .then(response => setFavorites(Array.isArray(response) ? response.map(deck => deck.id) : []))
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        // Lista de favoritos não é crítica pro resto da tela: falha aqui não trava o dashboard.
      })
    return () => controller.abort()
  }, [reloadKey, session?.token, session?.user?.id])

  // Calcula o % de progresso de cada deck (usado só pra mostrar a barrinha nos cards).
  // Não bloqueia o carregamento da biblioteca: os cards aparecem primeiro, e a barra de
  // progresso preenche assim que cada deck resolve — por isso fica num efeito separado.
  useEffect(() => {
    if (!session?.token || !session.user?.id || !decks.length) return
    const controller = new AbortController()
    const token = session.token
    const userId = session.user.id

    Promise.all(decks.map(deck =>
      Promise.all([
        api.listFlashcards(deck.id, token, controller.signal),
        api.getStudyProgress(userId, deck.id, token, controller.signal),
      ])
        .then(([flashcards, progress]): [number, number] => {
          const total = flashcards.length
          if (!total) return [deck.id, 0]
          const answered = progress.completed
            ? total
            : Math.min(progress.results.again + progress.results.almost + progress.results.easy, total)
          return [deck.id, Math.round((answered / total) * 100)]
        })
        .catch((): [number, number] => [deck.id, 0]),
    )).then(entries => {
      if (controller.signal.aborted) return
      setProgressByDeck(Object.fromEntries(entries))
    })

    return () => controller.abort()
  }, [decks, session?.token, session?.user?.id])

  async function toggleFavorite(deckId: number) {
    if (!session?.token || !session.user?.id) return
    const token = session.token
    const userId = session.user.id
    const isFavorite = favorites.includes(deckId)
    setFavoritesPending(current => [...current, deckId])
    try {
      if (isFavorite) {
        await api.removeFavorite(userId, deckId, token)
        setFavorites(current => current.filter(id => id !== deckId))
      } else {
        await api.addFavorite(userId, deckId, token)
        setFavorites(current => [...current, deckId])
      }
    } catch {
      // Não foi possível concluir a solicitação: mantém o estado anterior do favorito.
    } finally {
      setFavoritesPending(current => current.filter(id => id !== deckId))
    }
  }

  return <div className="page-wrap">
    <section className="welcome-row">
      <div><span className="eyebrow">{currentDate}</span><h1>{favoritesOnly ? 'Seus favoritos' : <>Olá, {name}. <em>Vamos aprender?</em></>}</h1><p>{favoritesOnly ? 'Os decks que você guardou para encontrar mais rápido.' : 'Seu próximo pequeno avanço começa agora.'}</p></div>
      {!favoritesOnly && <div className="welcome-actions">
        {isAdmin && <button className="secondary-button" onClick={() => setShowGenerateModal(true)}><Sparkles size={18} /> Gerar deck com IA</button>}
        <button className="primary-button compact" onClick={() => navigate(`/study/${decks[0].id}`)} disabled={!decks.length}><BookOpen size={18} /> Estudar agora</button>
      </div>}
    </section>
    {showGenerateModal && <GenerateDeckModal
      onClose={() => setShowGenerateModal(false)}
      onCreated={() => { setShowGenerateModal(false); setReloadKey(value => value + 1) }}
    />}
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
                const progress = progressByDeck[deck.id]
                return <article className="deck-card" key={deck.id}>
                  <div className="deck-visual" style={{ background: accent }}><span>{deckSymbol(deck.language)}</span><button className={favorites.includes(deck.id) ? 'favorited' : ''} onClick={() => toggleFavorite(deck.id)} disabled={favoritesPending.includes(deck.id)} aria-label={favorites.includes(deck.id) ? `Remover ${deck.title} dos favoritos` : `Adicionar ${deck.title} aos favoritos`} aria-pressed={favorites.includes(deck.id)}><Heart /></button></div>
                  <div className="deck-body">
                    <div className="deck-meta"><span>{deck.language}</span>{deck.difficultyLevel && <><i />{deck.difficultyLevel}</>}</div>
                    <h3>{deck.title}</h3>
                    <p>Pratique o conteúdo deste deck em uma sessão rápida de revisão.</p>
                    {progress !== undefined && <>
                      <div className="progress-label"><span>Progresso</span><b>{progress}%</b></div>
                      <div className="progress-track"><i style={{ width: `${progress}%`, background: accent }} /></div>
                    </>}
                    <button className="text-button" onClick={() => navigate(`/study/${deck.id}`)}>Começar deck</button>
                  </div>
                </article>
              })}
            </div>
            {!filtered.length && <PageState kind="empty" icon={Heart} title="Nenhum deck por aqui ainda" description={favoritesOnly ? 'Favorite um deck na biblioteca para encontrá-lo aqui.' : 'Tente outra busca ou remova o filtro de dificuldade.'} />}
            <div className="demo-note">Favoritos, preferências e progresso de estudo ficam salvos na sua conta.</div>
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
