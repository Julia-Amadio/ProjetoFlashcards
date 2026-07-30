import { BookOpen, CheckCircle2, Sparkles, WandSparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type { DeckSummary } from '../types'

const languages = [
  { value: 'mandarin', label: 'Mandarim' },
  { value: 'english', label: 'Inglês' },
  { value: 'french', label: 'Francês' },
  { value: 'japanese', label: 'Japonês' },
]

export function GenerateDeckPage({ navigate }: { navigate: (path: string) => void }) {
  const { session } = useAuth()
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState('english')
  const [difficultyLevel, setDifficultyLevel] = useState('A1')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [generatedDeck, setGeneratedDeck] = useState<DeckSummary | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!session?.token || !topic.trim()) return

    setGenerating(true)
    setError('')
    setGeneratedDeck(null)
    try {
      const deck = await api.generateDeck(session.token, {
        topic: topic.trim(),
        language,
        ...(difficultyLevel ? { difficultyLevel } : {}),
      })
      setGeneratedDeck(deck)
      setTopic('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar o deck.')
    } finally {
      setGenerating(false)
    }
  }

  return <div className="page-wrap generate-page">
    <section className="settings-heading">
      <span className="eyebrow">ÁREA ADMINISTRATIVA</span>
      <h1>Gerar deck com IA</h1>
      <p>Informe o assunto e o Karta cria o deck completo, incluindo textos, imagens e áudios.</p>
    </section>

    <section className="generate-layout">
      <form className="generate-form" onSubmit={submit}>
        <div className="generate-form__intro">
          <span className="setting-icon"><WandSparkles /></span>
          <div><h2>Novo conteúdo</h2><p>A geração pode levar alguns segundos enquanto os serviços preparam os flashcards.</p></div>
        </div>

        <label htmlFor="generate-topic">
          Tópico do deck
          <textarea
            id="generate-topic"
            value={topic}
            onChange={event => { setTopic(event.target.value); setError(''); setGeneratedDeck(null) }}
            maxLength={200}
            rows={4}
            placeholder="Ex.: cumprimentos e apresentações em uma viagem"
            required
          />
          <small>{topic.length}/200 caracteres</small>
        </label>

        <div className="generate-fields">
          <label htmlFor="generate-language">Idioma
            <select id="generate-language" value={language} onChange={event => setLanguage(event.target.value)}>
              {languages.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label htmlFor="generate-difficulty">Nível
            <select id="generate-difficulty" value={difficultyLevel} onChange={event => setDifficultyLevel(event.target.value)}>
              <option value="">Não informar</option>
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={generating || !topic.trim()}>
          <Sparkles /> {generating ? 'Gerando deck...' : 'Gerar deck'}
        </button>
      </form>

      <aside className="generate-result" aria-live="polite">
        {generatedDeck
          ? <>
            <span className="complete-icon"><CheckCircle2 /></span>
            <span className="eyebrow">DECK CRIADO</span>
            <h2>{generatedDeck.title}</h2>
            <p>{languages.find(option => option.value === generatedDeck.language)?.label ?? generatedDeck.language}{generatedDeck.difficultyLevel ? ` · ${generatedDeck.difficultyLevel}` : ''}</p>
            <button className="secondary-button" onClick={() => navigate(`/study/${generatedDeck.id}`)}><BookOpen /> Abrir deck</button>
          </>
          : <>
            <span className="generate-placeholder"><Sparkles /></span>
            <h2>Seu deck aparecerá aqui</h2>
            <p>Depois da geração, você pode abri-lo para revisar os novos flashcards imediatamente.</p>
          </>}
      </aside>
    </section>
  </div>
}
