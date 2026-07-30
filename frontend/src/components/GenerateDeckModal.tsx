import { Loader2, Sparkles, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../lib/api'
import type { DeckSummary } from '../types'

const LANGUAGES = [
  { value: 'english', label: 'Inglês' },
  { value: 'mandarin', label: 'Mandarim' },
  { value: 'french', label: 'Francês' },
  { value: 'japanese', label: 'Japonês' },
]

type Props = {
  onClose: () => void
  onCreated: (deck: DeckSummary) => void
}

// Formulário de geração de deck via IA (POST /decks/generate). Só ROLE_ADMIN consegue
// concluir a chamada — a tela que abre este modal já esconde o botão de quem não é admin,
// mas a validação de verdade continua sendo do backend.
export function GenerateDeckModal({ onClose, onCreated }: Props) {
  const { session } = useAuth()
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('english')
  const [difficultyLevel, setDifficultyLevel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!session?.token || loading) return
    setLoading(true)
    setError('')
    try {
      const deck = await api.generateDeck(session.token, {
        topic: topic.trim(),
        language,
        difficultyLevel: difficultyLevel.trim() || undefined,
      })
      onCreated(deck)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível gerar o deck.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={() => !loading && onClose()}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-deck-title"
        onClick={event => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="generate-deck-title"><Sparkles size={18} /> Gerar deck com IA</h2>
          <button className="icon-button" onClick={onClose} aria-label="Fechar" disabled={loading}><X /></button>
        </div>
        <p className="modal-description">
          Descreva um tópico e a IA monta o deck completo: palavras, traduções, frase de exemplo,
          imagem e áudio de pronúncia. Pode levar alguns segundos.
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            Tópico
            <input
              value={topic}
              onChange={event => setTopic(event.target.value)}
              placeholder="Ex.: cumprimentos do dia a dia"
              maxLength={200}
              required
              disabled={loading}
              autoFocus
            />
          </label>
          <label>
            Idioma
            <select value={language} onChange={event => setLanguage(event.target.value)} disabled={loading}>
              {LANGUAGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            Nível de dificuldade <span className="optional-tag">(opcional)</span>
            <input
              value={difficultyLevel}
              onChange={event => setDifficultyLevel(event.target.value)}
              placeholder="Ex.: A1, HSK1, N5"
              maxLength={50}
              disabled={loading}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={loading || !topic.trim()}>
            {loading ? <><Loader2 className="spin-icon" size={18} /> Gerando deck...</> : <><Sparkles size={18} /> Gerar deck</>}
          </button>
          {loading && <p className="modal-hint">Gerando texto, buscando imagem e sintetizando áudio — não feche esta janela.</p>}
        </form>
      </div>
    </div>
  )
}
