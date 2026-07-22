import { ArrowLeft, RotateCcw, Volume2, X } from 'lucide-react'
import { useState } from 'react'
import { sampleCards } from '../data/decks'

export function StudyPage({ navigate }: { navigate: (path: string) => void }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const card = sampleCards[index]
  const advance = () => { setIndex((index + 1) % sampleCards.length); setRevealed(false) }
  return <div className="study-page">
    <header className="study-head"><button className="text-button muted" onClick={() => navigate('/')}><ArrowLeft /> Voltar</button><div><b>Mandarim essencial</b><span>{index + 1} de {sampleCards.length}</span></div><button className="icon-button" onClick={() => navigate('/')}><X /></button></header>
    <div className="study-progress"><i style={{ width: `${((index + 1) / sampleCards.length) * 100}%` }} /></div>
    <section className={`flashcard ${revealed ? 'revealed' : ''}`} onClick={() => setRevealed(true)}>
      <span className="eyebrow">TRADUZA ESTA PALAVRA</span><button className="sound-button" aria-label="Ouvir pronúncia"><Volume2 /></button><strong>{card.word}</strong><em>{card.phonetic}</em>
      {!revealed ? <div className="reveal-hint"><RotateCcw /> Toque para revelar</div> : <div className="answer"><span>RESPOSTA</span><h2>{card.translation}</h2><blockquote>{card.sentence}<small>{card.sentenceTranslation}</small></blockquote></div>}
    </section>
    <div className={`answer-actions ${revealed ? 'visible' : ''}`}><span>Como foi?</span><div><button onClick={advance}>Ainda não</button><button onClick={advance}>Quase</button><button onClick={advance}>Fácil!</button></div></div>
  </div>
}
