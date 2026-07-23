import { ArrowLeft, CheckCircle2, RotateCcw, Volume2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { sampleCardsByDeck, sampleDecks } from '../data/decks'
import { loadPreferences } from '../lib/preferences'
import { loadStudyProgress, saveStudyProgress, type StudyResults } from '../lib/studyProgress'
import type { Deck, Flashcard } from '../types'

type Rating = 'again' | 'almost' | 'easy'
const emptyResults: StudyResults = { again: 0, almost: 0, easy: 0 }

export function StudyPage({ deckId, navigate }: { deckId: number; navigate: (path: string) => void }) {
  const { session } = useAuth()
  const deck = sampleDecks.find(item => item.id === deckId)
  const cards = sampleCardsByDeck[deckId]

  if (!deck || !cards?.length) {
    return <main className="study-page study-not-found">
      <section className="study-complete">
        <span className="eyebrow">DECK NÃO ENCONTRADO</span>
        <h1>Este estudo não está disponível.</h1>
        <p>Volte à biblioteca para escolher um dos decks disponíveis.</p>
        <button className="primary-button" onClick={() => navigate('/')}><ArrowLeft /> Voltar à biblioteca</button>
      </section>
    </main>
  }

  return <StudySession deck={deck} cards={cards} email={session?.email ?? 'guest'} navigate={navigate} />
}

function StudySession({ deck, cards, email, navigate }: { deck: Deck; cards: Flashcard[]; email: string; navigate: (path: string) => void }) {
  const initialProgress = useState(() => loadStudyProgress(email, deck.id, cards.length))[0]
  const preferences = useState(() => loadPreferences(email))[0]
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
    saveStudyProgress(email, deck.id, { index, revealed, completed, results })
  }, [completed, deck.id, email, index, results, revealed])

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
