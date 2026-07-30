import { ArrowLeft, Check, LibraryBig, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { PageState } from '../components/PageState'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type { ApiFlashcard, DeckSummary } from '../types'

type CardForm = Omit<ApiFlashcard, 'id'>

const emptyForm: CardForm = {
  targetWord: '',
  phoneticReading: '',
  nativeTranslation: '',
  partOfSpeech: '',
  targetSentence: '',
  sentencePhonetic: '',
  sentenceTranslation: '',
}

export function AdminFlashcardsPage({ deckId, navigate }: {
  deckId: number
  navigate: (path: string) => void
}) {
  const { session } = useAuth()
  const [deck, setDeck] = useState<DeckSummary | null>(null)
  const [cards, setCards] = useState<ApiFlashcard[]>([])
  const [form, setForm] = useState<CardForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [formError, setFormError] = useState('')
  const [actionError, setActionError] = useState('')
  const [saved, setSaved] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!session?.token) return
    const controller = new AbortController()
    setLoading(true)
    setLoadError('')
    Promise.all([
      api.getDeck(deckId, session.token, controller.signal),
      api.listFlashcards(deckId, session.token, controller.signal),
    ]).then(([deckResponse, cardsResponse]) => {
      setDeck(deckResponse)
      setCards(cardsResponse)
    }).catch(err => {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setLoadError(err instanceof Error ? err.message : 'Não foi possível carregar os flashcards.')
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [deckId, reloadKey, session?.token])

  function update<K extends keyof CardForm>(key: K, value: CardForm[K]) {
    setForm(current => ({ ...current, [key]: value }))
    setFormError('')
    setSaved(false)
  }

  function edit(card: ApiFlashcard) {
    setEditingId(card.id)
    setForm({
      targetWord: card.targetWord,
      phoneticReading: card.phoneticReading,
      nativeTranslation: card.nativeTranslation,
      partOfSpeech: card.partOfSpeech,
      targetSentence: card.targetSentence,
      sentencePhonetic: card.sentencePhonetic,
      sentenceTranslation: card.sentenceTranslation,
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
    const optionalValue = (value: string | null) => {
      const trimmed = value?.trim() ?? ''
      return editingId === null ? trimmed || null : trimmed
    }
    const payload: CardForm = {
      ...form,
      targetWord: form.targetWord.trim(),
      nativeTranslation: form.nativeTranslation.trim(),
      phoneticReading: optionalValue(form.phoneticReading),
      partOfSpeech: optionalValue(form.partOfSpeech),
      targetSentence: optionalValue(form.targetSentence),
      sentencePhonetic: optionalValue(form.sentencePhonetic),
      sentenceTranslation: optionalValue(form.sentenceTranslation),
    }
    try {
      const savedCard = editingId === null
        ? await api.createFlashcard(deckId, session.token, payload)
        : await api.updateFlashcard(editingId, session.token, payload)
      setCards(current => editingId === null
        ? [...current, savedCard]
        : current.map(card => card.id === editingId ? savedCard : card))
      setEditingId(null)
      setForm(emptyForm)
      setSaved(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar o flashcard.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(card: ApiFlashcard) {
    if (!session?.token || !window.confirm(`Excluir o flashcard "${card.targetWord}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(card.id)
    setActionError('')
    try {
      await api.deleteFlashcard(card.id, session.token)
      setCards(current => current.filter(item => item.id !== card.id))
      if (editingId === card.id) cancelEdit()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Não foi possível excluir o flashcard.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return <div className="page-wrap"><PageState kind="loading" title="Carregando flashcards" description="Buscando os cartões deste deck." /></div>
  }

  if (loadError || !deck) {
    return <div className="page-wrap"><PageState kind="error" title="Não foi possível abrir este deck" description={loadError} action={<button className="secondary-button" onClick={() => setReloadKey(value => value + 1)}><RefreshCw /> Tentar novamente</button>} /></div>
  }

  return <div className="page-wrap admin-flashcards-page">
    <button className="text-button muted admin-back" onClick={() => navigate('/admin/decks')}><ArrowLeft /> Voltar aos decks</button>
    <section className="settings-heading">
      <span className="eyebrow">FLASHCARDS</span>
      <h1>{deck.title}</h1>
      <p>Crie e organize os cartões disponíveis na sessão de estudo deste deck.</p>
    </section>

    <section className="admin-flashcards-layout">
      <form className="generate-form flashcard-form" onSubmit={submit}>
        <div className="generate-form__intro">
          <span className="setting-icon">{editingId === null ? <Plus /> : <Pencil />}</span>
          <div><h2>{editingId === null ? 'Novo flashcard' : 'Editar flashcard'}</h2><p>Os campos marcados são obrigatórios.</p></div>
          {editingId !== null && <button className="icon-button edit-cancel" type="button" onClick={cancelEdit} aria-label="Cancelar edição"><X /></button>}
        </div>
        <div className="generate-fields">
          <label htmlFor="card-word">Palavra ou expressão *
            <input id="card-word" value={form.targetWord} onChange={event => update('targetWord', event.target.value)} maxLength={100} required />
          </label>
          <label htmlFor="card-translation">Tradução *
            <input id="card-translation" value={form.nativeTranslation} onChange={event => update('nativeTranslation', event.target.value)} maxLength={255} required />
          </label>
        </div>
        <div className="generate-fields">
          <label htmlFor="card-phonetic">Leitura fonética
            <input id="card-phonetic" value={form.phoneticReading ?? ''} onChange={event => update('phoneticReading', event.target.value)} maxLength={100} />
          </label>
          <label htmlFor="card-part">Classe gramatical
            <input id="card-part" value={form.partOfSpeech ?? ''} onChange={event => update('partOfSpeech', event.target.value)} maxLength={50} />
          </label>
        </div>
        <label htmlFor="card-sentence">Frase de exemplo
          <textarea id="card-sentence" value={form.targetSentence ?? ''} onChange={event => update('targetSentence', event.target.value)} rows={2} />
        </label>
        <label htmlFor="card-sentence-phonetic">Leitura fonética da frase
          <textarea id="card-sentence-phonetic" value={form.sentencePhonetic ?? ''} onChange={event => update('sentencePhonetic', event.target.value)} rows={2} />
        </label>
        <label htmlFor="card-sentence-translation">Tradução da frase
          <textarea id="card-sentence-translation" value={form.sentenceTranslation ?? ''} onChange={event => update('sentenceTranslation', event.target.value)} rows={2} />
        </label>
        {saved && <span className="save-confirmation" role="status"><Check /> Flashcard salvo com sucesso</span>}
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button className="primary-button" type="submit" disabled={saving}>{editingId === null ? <Plus /> : <Check />} {saving ? 'Salvando...' : editingId === null ? 'Criar flashcard' : 'Salvar alterações'}</button>
      </form>

      <section className="admin-card-list">
        <div className="admin-deck-list__head">
          <div><span className="eyebrow">CONTEÚDO</span><h2>Cartões cadastrados</h2></div>
          <span>{cards.length} cartões</span>
        </div>
        {actionError && <p className="form-error" role="alert">{actionError}</p>}
        {cards.length
          ? <div className="admin-card-items">
            {cards.map(card => <article key={card.id}>
              <span className="setting-icon"><LibraryBig /></span>
              <div><h3>{card.targetWord}</h3><p>{card.nativeTranslation}</p>{card.targetSentence && <small>{card.targetSentence}</small>}</div>
              <div className="admin-deck-actions">
                <button className="icon-button" onClick={() => edit(card)} aria-label={`Editar ${card.targetWord}`}><Pencil /></button>
                <button className="icon-button danger-button" onClick={() => remove(card)} disabled={deletingId === card.id} aria-label={`Excluir ${card.targetWord}`}><Trash2 /></button>
              </div>
            </article>)}
          </div>
          : <PageState kind="empty" title="Nenhum flashcard cadastrado" description="Use o formulário para criar o primeiro cartão deste deck." />}
      </section>
    </section>
  </div>
}
