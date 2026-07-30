import { BookOpen, Check, Layers3, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { PageState } from '../components/PageState'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type { DeckSummary } from '../types'

type FormState = {
  title: string
  description: string
  language: string
  difficultyLevel: string
}

const emptyForm: FormState = { title: '', description: '', language: '', difficultyLevel: '' }

export function AdminDecksPage({ navigate }: { navigate: (path: string) => void }) {
  const { session } = useAuth()
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!session?.token) return
    const controller = new AbortController()
    setLoading(true)
    setLoadError('')
    api.listDecks(session.token, controller.signal)
      .then(setDecks)
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setLoadError(err instanceof Error ? err.message : 'Não foi possível carregar os decks.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey, session?.token])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(current => ({ ...current, [key]: value }))
    setFormError('')
    setSaved(false)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!session?.token) return
    setSaving(true)
    setFormError('')
    setSaved(false)
    try {
      const created = await api.createDeck(session.token, {
        title: form.title.trim(),
        description: form.description.trim(),
        language: form.language.trim(),
        ...(form.difficultyLevel.trim() ? { difficultyLevel: form.difficultyLevel.trim() } : {}),
      })
      setDecks(current => [...current, created].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')))
      setForm(emptyForm)
      setSaved(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível criar o deck.')
    } finally {
      setSaving(false)
    }
  }

  return <div className="page-wrap admin-decks-page">
    <section className="settings-heading">
      <span className="eyebrow">ÁREA ADMINISTRATIVA</span>
      <h1>Gerenciar decks</h1>
      <p>Cadastre decks manualmente e consulte o conteúdo disponível para os estudantes.</p>
    </section>

    <section className="admin-decks-layout">
      <form className="generate-form" onSubmit={submit}>
        <div className="generate-form__intro">
          <span className="setting-icon"><Plus /></span>
          <div><h2>Novo deck</h2><p>Crie a estrutura do deck e depois adicione seus flashcards.</p></div>
        </div>
        <label htmlFor="deck-title">Título
          <input id="deck-title" value={form.title} onChange={event => update('title', event.target.value)} maxLength={100} required />
        </label>
        <label htmlFor="deck-description">Descrição
          <textarea id="deck-description" value={form.description} onChange={event => update('description', event.target.value)} rows={3} />
        </label>
        <div className="generate-fields">
          <label htmlFor="deck-language">Idioma
            <input id="deck-language" value={form.language} onChange={event => update('language', event.target.value)} maxLength={50} placeholder="Ex.: Inglês" required />
          </label>
          <label htmlFor="deck-difficulty">Nível
            <input id="deck-difficulty" value={form.difficultyLevel} onChange={event => update('difficultyLevel', event.target.value)} maxLength={50} placeholder="Ex.: A1" />
          </label>
        </div>
        {saved && <span className="save-confirmation" role="status"><Check /> Deck criado com sucesso</span>}
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="primary-button" type="submit" disabled={saving}><Plus /> {saving ? 'Criando...' : 'Criar deck'}</button>
      </form>

      <section className="admin-deck-list">
        <div className="admin-deck-list__head">
          <div><span className="eyebrow">CATÁLOGO</span><h2>Decks cadastrados</h2></div>
          <span>{decks.length} nesta página</span>
        </div>
        {loading
          ? <PageState kind="loading" title="Carregando decks" description="Buscando o catálogo no servidor." />
          : loadError
            ? <PageState kind="error" title="Não foi possível carregar os decks" description={loadError} action={<button className="secondary-button" onClick={() => setReloadKey(value => value + 1)}><RefreshCw /> Tentar novamente</button>} />
            : decks.length
              ? <div className="admin-deck-items">
                {decks.map(deck => <article key={deck.id}>
                  <span className="setting-icon"><Layers3 /></span>
                  <div><h3>{deck.title}</h3><p>{deck.language}{deck.difficultyLevel ? ` · ${deck.difficultyLevel}` : ''}</p></div>
                  <button className="text-button" onClick={() => navigate(`/study/${deck.id}`)}><BookOpen /> Abrir</button>
                </article>)}
              </div>
              : <PageState kind="empty" title="Nenhum deck cadastrado" description="Use o formulário para criar o primeiro deck." />}
      </section>
    </section>
  </div>
}
