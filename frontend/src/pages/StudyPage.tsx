import { ArrowLeft, CheckCircle2, RotateCcw, Volume2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { PageState } from '../components/PageState'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { defaultPreferences, loadPreferences, type StudyPreferences } from '../lib/preferences'
import { emptyStudyProgress, loadStudyProgress, saveStudyProgress, type StudyProgress, type StudyResults } from '../lib/studyProgress'
import type { ApiFlashcard, Flashcard } from '../types'

type Rating = 'again' | 'almost' | 'easy'
type LoadState = 'loading' | 'ready' | 'empty' | 'error'
type StudyDeck = { id: number; title: string; accent: string; speechLanguage: string }
const emptyResults: StudyResults = { again: 0, almost: 0, easy: 0 }

// Cores e locais de fala não existem no backend — são só apresentação, então derivamos
// localmente a partir do id/idioma do deck (mesma paleta usada no grid do Dashboard).
const deckColors = ['#ee725d', '#6c8ed7', '#e8ae45', '#598876', '#9a78bd']
function deckAccent(id: number) {
  return deckColors[Math.abs(id) % deckColors.length]
}

const speechLocaleByLanguage: Record<string, string> = {
  mandarim: 'zh-CN', chinês: 'zh-CN', inglês: 'en-US', espanhol: 'es-ES',
  alemão: 'de-DE', francês: 'fr-FR', italiano: 'it-IT', japonês: 'ja-JP', coreano: 'ko-KR',
}
function speechLocaleFor(language: string) {
  return speechLocaleByLanguage[language.trim().toLocaleLowerCase('pt-BR')] || 'en-US'
}

function toFlashcard(card: ApiFlashcard): Flashcard {
  return {
    word: card.targetWord,
    phonetic: card.phoneticReading ?? '',
    translation: card.nativeTranslation,
    sentence: card.targetSentence ?? '',
    sentenceTranslation: card.sentenceTranslation ?? '',
  }
}

export function StudyPage({ deckId, navigate }: { deckId: number; navigate: (path: string) => void }) {
  const { session } = useAuth()
  const [state, setState] = useState<LoadState>('loading')
  const [deck, setDeck] = useState<StudyDeck | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [initialProgress, setInitialProgress] = useState<StudyProgress>(emptyStudyProgress)
  const [preferences, setPreferences] = useState<StudyPreferences>(defaultPreferences)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!session?.token || !session.user?.id) return
    const controller = new AbortController()
    const { token } = session
    const userId = session.user.id
    setState('loading')

    Promise.all([
      api.getDeck(deckId, token, controller.signal),
      api.listFlashcards(deckId, token, controller.signal),
      loadStudyProgress(userId, deckId, token, controller.signal),
      loadPreferences(userId, token, controller.signal),
    ])
      .then(([deckSummary, flashcards, progress, prefs]) => {
        setDeck({
          id: deckSummary.id,
          title: deckSummary.title,
          accent: deckAccent(deckSummary.id),
          speechLanguage: speechLocaleFor(deckSummary.language),
        })
        setCards(flashcards.map(toFlashcard))
        setInitialProgress({
          ...progress,
          index: Math.min(Math.max(progress.index, 0), Math.max(flashcards.length - 1, 0)),
        })
        setPreferences(prefs)
        setState(flashcards.length ? 'ready' : 'empty')
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setErrorMessage(err instanceof Error ? err.message : 'Não foi possível carregar este deck.')
        setState('error')
      })

    return () => controller.abort()
  }, [deckId, session?.token, session?.user?.id])

  if (state === 'loading') {
    return <main className="study-page study-not-found">
      <PageState kind="loading" title="Carregando deck" description="Buscando os cartões deste deck no servidor." />
    </main>
  }

  if (state === 'empty' && deck) {
    return <main className="study-page study-not-found">
      <PageState kind="empty" title={`"${deck.title}" ainda não tem flashcards`} description="Este deck existe, mas ainda não tem cartões cadastrados." action={<button className="primary-button" onClick={() => navigate('/')}><ArrowLeft /> Voltar à biblioteca</button>} />
    </main>
  }

  if (state !== 'ready' || !deck || !session?.token || !session.user?.id) {
    return <main className="study-page study-not-found">
      <PageState kind="error" title="Este estudo não está disponível" description={errorMessage || 'Volte à biblioteca para escolher um dos decks disponíveis.'} action={<button className="primary-button" onClick={() => navigate('/')}><ArrowLeft /> Voltar à biblioteca</button>} />
    </main>
  }

  return <StudySession
    deck={deck}
    cards={cards}
    userId={session.user.id}
    token={session.token}
    initialProgress={initialProgress}
    preferences={preferences}
    navigate={navigate}
  />
}

function StudySession({ deck, cards, userId, token, initialProgress, preferences, navigate }: {
  deck: StudyDeck
  cards: Flashcard[]
  userId: string
  token: string
  initialProgress: StudyProgress
  preferences: StudyPreferences
  navigate: (path: string) => void
}) {
  const [index, setIndex] = useState(initialProgress.index)
  const [revealed, setRevealed] = useState(initialProgress.revealed)
  const [completed, setCompleted] = useState(initialProgress.completed)
  const [results, setResults] = useState<StudyResults>(initialProgress.results)
  const readyToPersist = useRef(false)
  const card = cards[index]
  const speechLanguage = deck.speechLanguage
  const hasProgress = index > 0 || revealed || Object.values(results).some(value => value > 0)

  const rate = useCallback((rating: Rating) => {
    setResults(current => ({ ...current, [rating]: current[rating] + 1 }))
    if (index === cards.length - 1) setCompleted(true)
    else setIndex(current => current + 1)
    setRevealed(false)
  }, [cards.length, index])

  function restart() {
    setIndex(0)
    setRevealed(false)
    setCompleted(false)
    setResults(emptyResults)
  }

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(card.word)
    utterance.lang = speechLanguage
    window.speechSynthesis.speak(utterance)
  }, [card.word, speechLanguage])

  const exitStudy = useCallback(() => {
    if (preferences.confirmExit && !completed && hasProgress && !window.confirm('Deseja sair desta sessão? Seu progresso ficará salvo.')) return
    navigate('/')
  }, [completed, hasProgress, navigate, preferences.confirmExit])

  function speakFromButton(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    speak()
  }

  useEffect(() => {
    if (!readyToPersist.current) {
      readyToPersist.current = true
      return
    }
    saveStudyProgress(userId, deck.id, token, { index, revealed, completed, results })
  }, [completed, deck.id, index, results, revealed, token, userId])

  useEffect(() => {
    if (preferences.autoplayAudio && !completed) speak()
  }, [completed, index, preferences.autoplayAudio, speak])

  useEffect(() => {
    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (!preferences.confirmExit || completed || !hasProgress) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [completed, hasProgress, preferences.confirmExit])

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.matches('input, textarea, select')) return

      if (event.key === 'Escape') {
        exitStudy()
        return
      }
      if (completed) return
      if (event.key.toLocaleLowerCase('pt-BR') === 'r') {
        speak()
        return
      }
      if (!revealed && event.code === 'Space') {
        event.preventDefault()
        setRevealed(true)
        return
      }
      if (revealed) {
        const ratings: Record<string, Rating> = { '1': 'again', '2': 'almost', '3': 'easy' }
        const rating = ratings[event.key]
        if (rating) rate(rating)
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [completed, exitStudy, rate, revealed, speak])

  return <div className="study-page">
    <header className="study-head"><button className="text-button muted" onClick={exitStudy}><ArrowLeft /> Voltar</button><div><b>{deck.title}</b><span>{completed ? 'Sessão concluída' : `${index + 1} de ${cards.length}`}</span></div><button className="icon-button" onClick={exitStudy} aria-label="Encerrar sessão"><X /></button></header>
    <div className="study-progress"><i style={{ width: `${completed ? 100 : ((index + 1) / cards.length) * 100}%`, background: deck.accent }} /></div>
    {completed ? <section className="study-complete" aria-live="polite">
      <span className="complete-icon"><CheckCircle2 /></span>
      <span className="eyebrow">SESSÃO CONCLUÍDA</span>
      <h1>Muito bem!</h1>
      <p>Você revisou todos os {cards.length} cartões deste deck.</p>
      <div className="results-grid">
        <div><b>{results.again}</b><span>Ainda não</span></div>
        <div><b>{results.almost}</b><span>Quase</span></div>
        <div><b>{results.easy}</b><span>Fácil</span></div>
      </div>
      <div className="complete-actions"><button className="primary-button" onClick={() => navigate('/')}>Voltar ao painel</button><button className="secondary-button" onClick={restart}><RotateCcw /> Revisar novamente</button></div>
    </section> : <>
      <section className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(true)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setRevealed(true) } }} role="button" tabIndex={0} aria-label={revealed ? `${card.word}, ${card.translation}` : `${card.word}. Pressione para revelar a resposta`}>
        <span className="eyebrow">TRADUZA ESTA PALAVRA</span><button className="sound-button" onClick={speakFromButton} aria-label="Ouvir pronúncia" aria-keyshortcuts="R"><Volume2 /></button><strong>{card.word}</strong><em>{card.phonetic}</em>
        {!revealed ? <div className="reveal-hint"><RotateCcw /> Toque para revelar</div> : <div className="answer"><span>RESPOSTA</span><h2>{card.translation}</h2><blockquote>{card.sentence}<small>{card.sentenceTranslation}</small></blockquote></div>}
      </section>
      <div className={`answer-actions ${revealed ? 'visible' : ''}`}><span>Como foi?</span><div><button onClick={() => rate('again')} aria-keyshortcuts="1"><kbd>1</kbd> Ainda não</button><button onClick={() => rate('almost')} aria-keyshortcuts="2"><kbd>2</kbd> Quase</button><button onClick={() => rate('easy')} aria-keyshortcuts="3"><kbd>3</kbd> Fácil!</button></div></div>
      <p className="study-shortcuts" aria-label="Atalhos de teclado"><span><kbd>Espaço</kbd> revelar</span><span><kbd>R</kbd> ouvir</span><span><kbd>Esc</kbd> sair</span></p>
    </>}
  </div>
}
