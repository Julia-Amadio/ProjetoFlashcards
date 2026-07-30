import { BookOpen, Check, Layers3, LibraryBig, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')
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

  function edit(deck: DeckSummary) {
    setEditingId(deck.id)
    setForm({
      title: deck.title,
      description: deck.description ?? '',
      language: deck.language,
      difficultyLevel: deck.difficultyLevel ?? '',
    })
    setFormError('')
    setSaved(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
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
      const data = {
        title: form.title.trim(),
        description: form.description.trim(),
        language: form.language.trim(),
      }
      const savedDeck = editingId === null
        ? await api.createDeck(session.token, {
          ...data,
          ...(form.difficultyLevel.trim() ? { difficultyLevel: form.difficultyLevel.trim() } : {}),
        })
        : await api.updateDeck(editingId, session.token, {
          ...data,
          difficultyLevel: form.difficultyLevel.trim(),
        })
      setDecks(current => {
        const next = editingId === null
          ? [...current, savedDeck]
          : current.map(deck => deck.id === editingId ? savedDeck : deck)
        return next.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
      })
      setEditingId(null)
      setForm(emptyForm)
      setSaved(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar o deck.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(deck: DeckSummary) {
    if (!session?.token) return
    const confirmed = window.confirm(
      `Excluir "${deck.title}"? Os flashcards, favoritos e progressos relacionados também serão removidos. Esta ação não pode ser desfeita.`,
    )
    if (!confirmed) return

    setDeletingId(deck.id)
    setActionError('')
    try {
      await api.deleteDeck(deck.id, session.token)
      setDecks(current => current.filter(item => item.id !== deck.id))
      if (editingId === deck.id) cancelEdit()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Não foi possível remover o deck.')
    } finally {
      setDeletingId(null)
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
          <span className="setting-icon">{editingId === null ? <Plus /> : <Pencil />}</span>
          <div><h2>{editingId === null ? 'Novo deck' : 'Editar deck'}</h2><p>{editingId === null ? 'Crie a estrutura do deck e depois adicione seus flashcards.' : 'Altere os dados do deck selecionado.'}</p></div>
          {editingId !== null && <button className="icon-button edit-cancel" type="button" onClick={cancelEdit} aria-label="Cancelar edição"><X /></button>}
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
        {saved && <span className="save-confirmation" role="status"><Check /> Deck salvo com sucesso</span>}
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="primary-button" type="submit" disabled={saving}>{editingId === null ? <Plus /> : <Check />} {saving ? 'Salvando...' : editingId === null ? 'Criar deck' : 'Salvar alterações'}</button>
      </form>

      <section className="admin-deck-list">
        <div className="admin-deck-list__head">
          <div><span className="eyebrow">CATÁLOGO</span><h2>Decks cadastrados</h2></div>
          <span>{decks.length} nesta página</span>
        </div>
        {actionError && <p className="form-error" role="alert">{actionError}</p>}
        {loading
          ? <PageState kind="loading" title="Carregando decks" description="Buscando o catálogo no servidor." />
          : loadError
            ? <PageState kind="error" title="Não foi possível carregar os decks" description={loadError} action={<button className="secondary-button" onClick={() => setReloadKey(value => value + 1)}><RefreshCw /> Tentar novamente</button>} />
            : decks.length
              ? <div className="admin-deck-items">
                {decks.map(deck => <article key={deck.id}>
                  <span className="setting-icon"><Layers3 /></span>
                  <div><h3>{deck.title}</h3><p>{deck.language}{deck.difficultyLevel ? ` · ${deck.difficultyLevel}` : ''}</p></div>
                  <div className="admin-deck-actions">
                    <button className="icon-button" onClick={() => navigate(`/study/${deck.id}`)} aria-label={`Abrir ${deck.title}`}><BookOpen /></button>
                    <button className="icon-button" onClick={() => navigate(`/admin/decks/${deck.id}/flashcards`)} aria-label={`Gerenciar flashcards de ${deck.title}`}><LibraryBig /></button>
                    <button className="icon-button" onClick={() => edit(deck)} aria-label={`Editar ${deck.title}`}><Pencil /></button>
                    <button className="icon-button danger-button" onClick={() => remove(deck)} disabled={deletingId === deck.id} aria-label={`Excluir ${deck.title}`}><Trash2 /></button>
                  </div>
                </article>)}
              </div>
              : <PageState kind="empty" title="Nenhum deck cadastrado" description="Use o formulário para criar o primeiro deck." />}
      </section>
    </section>
  </div>
}
