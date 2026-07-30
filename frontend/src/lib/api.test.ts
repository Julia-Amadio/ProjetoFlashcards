import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, SESSION_UNAUTHORIZED_EVENT } from './api'

const fetchMock = vi.fn<typeof fetch>()

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const deck = {
  id: 4,
  title: 'Inglês básico',
  description: 'Vocabulário inicial',
  language: 'english',
  difficultyLevel: 'A1',
}

const card = {
  id: 8,
  targetWord: 'hello',
  phoneticReading: null,
  nativeTranslation: 'olá',
  partOfSpeech: null,
  targetSentence: null,
  sentencePhonetic: null,
  sentenceTranslation: null,
}

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  it('faz login e valida a resposta do servidor', async () => {
    const user = {
      id: 'user-id',
      name: 'Ana',
      email: 'ana@example.com',
      role: 'ROLE_USER',
      createdAt: '2026-01-01T00:00:00Z',
    }
    fetchMock.mockResolvedValue(jsonResponse({ token: 'jwt-token', user }))

    await expect(api.login('ana@example.com', 'password')).resolves.toEqual({
      token: 'jwt-token',
      user,
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'ana@example.com', password: 'password' }),
    }))
  })

  it('rejeita uma resposta de login sem token ou usuário', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ token: '' }))

    await expect(api.login('ana@example.com', 'password')).rejects.toMatchObject({
      message: 'O servidor retornou uma resposta de login inválida.',
      status: 502,
    })
  })

  it('extrai o conteúdo da página de decks', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ content: [deck], totalElements: 1 }))

    await expect(api.listDecks('token')).resolves.toEqual([deck])
    expect(fetchMock).toHaveBeenCalledWith('/api/decks', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token' }),
    }))
  })

  it('usa os métodos e caminhos corretos no CRUD de decks', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(deck, 201))
      .mockResolvedValueOnce(jsonResponse({ ...deck, title: 'Novo título' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))

    await api.createDeck('token', {
      title: deck.title,
      description: deck.description,
      language: deck.language,
      difficultyLevel: deck.difficultyLevel,
    })
    await api.updateDeck(deck.id, 'token', { title: 'Novo título' })
    await api.deleteDeck(deck.id, 'token')

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/decks', expect.objectContaining({ method: 'POST' }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/decks/4', expect.objectContaining({ method: 'PUT' }))
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/decks/4', expect.objectContaining({ method: 'DELETE' }))
  })

  it('usa os métodos e caminhos corretos no CRUD de flashcards', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(card, 201))
      .mockResolvedValueOnce(jsonResponse({ ...card, nativeTranslation: 'oi' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    const fields = {
      targetWord: card.targetWord,
      phoneticReading: card.phoneticReading,
      nativeTranslation: card.nativeTranslation,
      partOfSpeech: card.partOfSpeech,
      targetSentence: card.targetSentence,
      sentencePhonetic: card.sentencePhonetic,
      sentenceTranslation: card.sentenceTranslation,
    }

    await api.createFlashcard(deck.id, 'token', fields)
    await api.updateFlashcard(card.id, 'token', { nativeTranslation: 'oi' })
    await api.deleteFlashcard(card.id, 'token')

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/decks/4/flashcards', expect.objectContaining({ method: 'POST' }))
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/flashcards/8', expect.objectContaining({ method: 'PUT' }))
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/flashcards/8', expect.objectContaining({ method: 'DELETE' }))
  })

  it('retorna o blob de mídia e trata 404 como ausência esperada', async () => {
    const blob = new Blob(['audio'], { type: 'audio/mpeg' })
    fetchMock
      .mockResolvedValueOnce(new Response(blob, {
        status: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
      }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))

    const audio = await api.getFlashcardWordAudio(card.id, 'token')
    const image = await api.getFlashcardImage(card.id, 'token')

    expect(audio?.type).toBe('audio/mpeg')
    expect(image).toBeNull()
  })

  it('expõe mensagens de validação devolvidas pelo backend', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      message: 'Dados inválidos.',
      errors: { title: 'não pode estar em branco' },
    }, 400))

    await expect(api.createDeck('token', {
      title: '',
      language: 'english',
    })).rejects.toEqual(new ApiError('não pode estar em branco', 400))
  })

  it('notifica a aplicação quando uma requisição autenticada recebe 401', async () => {
    const listener = vi.fn()
    window.addEventListener(SESSION_UNAUTHORIZED_EVENT, listener)
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Sessão expirada.' }, 401))

    await expect(api.getDeck(deck.id, 'token')).rejects.toMatchObject({ status: 401 })
    expect(listener).toHaveBeenCalledOnce()

    window.removeEventListener(SESSION_UNAUTHORIZED_EVENT, listener)
  })
})
