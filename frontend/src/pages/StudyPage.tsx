import { ArrowLeft, CheckCircle2, RotateCcw, Volume2, X } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { sampleCards } from '../data/decks'

type Rating = 'again' | 'almost' | 'easy'
type Results = Record<Rating, number>

const emptyResults: Results = { again: 0, almost: 0, easy: 0 }

export function StudyPage({ navigate }: { navigate: (path: string) => void }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState<Results>(emptyResults)
  const card = sampleCards[index]

  function rate(rating: Rating) {
    setResults(current => ({ ...current, [rating]: current[rating] + 1 }))
    if (index === sampleCards.length - 1) setCompleted(true)
    else setIndex(current => current + 1)
    setRevealed(false)
  }

  function restart() {
    setIndex(0)
    setRevealed(false)
    setCompleted(false)
    setResults(emptyResults)
  }

  function speak(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(card.word)
    utterance.lang = 'zh-CN'
    window.speechSynthesis.speak(utterance)
  }

  return <div className="study-page">
    <header className="study-head"><button className="text-button muted" onClick={() => navigate('/')}><ArrowLeft /> Voltar</button><div><b>Mandarim essencial</b><span>{completed ? 'Sessão concluída' : `${index + 1} de ${sampleCards.length}`}</span></div><button className="icon-button" onClick={() => navigate('/')} aria-label="Encerrar sessão"><X /></button></header>
    <div className="study-progress"><i style={{ width: `${completed ? 100 : ((index + 1) / sampleCards.length) * 100}%` }} /></div>
    {completed ? <section className="study-complete" aria-live="polite">
      <span className="complete-icon"><CheckCircle2 /></span>
      <span className="eyebrow">SESSÃO CONCLUÍDA</span>
      <h1>Muito bem!</h1>
      <p>Você revisou todos os {sampleCards.length} cartões deste deck.</p>
      <div className="results-grid">
        <div><b>{results.again}</b><span>Ainda não</span></div>
        <div><b>{results.almost}</b><span>Quase</span></div>
        <div><b>{results.easy}</b><span>Fácil</span></div>
      </div>
      <div className="complete-actions"><button className="primary-button" onClick={() => navigate('/')}>Voltar ao painel</button><button className="secondary-button" onClick={restart}><RotateCcw /> Revisar novamente</button></div>
    </section> : <>
      <section className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(true)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setRevealed(true) } }} role="button" tabIndex={0} aria-label={revealed ? `${card.word}, ${card.translation}` : `${card.word}. Pressione para revelar a resposta`}>
        <span className="eyebrow">TRADUZA ESTA PALAVRA</span><button className="sound-button" onClick={speak} aria-label="Ouvir pronúncia"><Volume2 /></button><strong>{card.word}</strong><em>{card.phonetic}</em>
        {!revealed ? <div className="reveal-hint"><RotateCcw /> Toque para revelar</div> : <div className="answer"><span>RESPOSTA</span><h2>{card.translation}</h2><blockquote>{card.sentence}<small>{card.sentenceTranslation}</small></blockquote></div>}
      </section>
      <div className={`answer-actions ${revealed ? 'visible' : ''}`}><span>Como foi?</span><div><button onClick={() => rate('again')}>Ainda não</button><button onClick={() => rate('almost')}>Quase</button><button onClick={() => rate('easy')}>Fácil!</button></div></div>
    </>}
  </div>
}
