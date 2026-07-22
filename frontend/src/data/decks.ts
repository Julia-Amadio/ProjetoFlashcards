import type { Deck } from '../types'

// Dados de apresentação até o backend disponibilizar GET /decks e GET /decks/:id/flashcards.
export const sampleDecks: Deck[] = [
  { id: 1, title: 'Mandarim essencial', language: 'Mandarim', difficultyLevel: 'Iniciante', description: 'Palavras e frases para suas primeiras conversas.', cardCount: 48, progress: 68, accent: '#ee725d', symbol: '你' },
  { id: 2, title: 'Inglês para viagens', language: 'Inglês', difficultyLevel: 'Intermediário', description: 'Do aeroporto ao café, viaje com mais confiança.', cardCount: 36, progress: 24, accent: '#6c8ed7', symbol: 'Hi' },
  { id: 3, title: 'Espanhol cotidiano', language: 'Espanhol', difficultyLevel: 'Iniciante', description: 'Vocabulário útil para situações do dia a dia.', cardCount: 32, progress: 0, accent: '#e8ae45', symbol: '¡' },
]

export const sampleCards = [
  { word: '你好', phonetic: 'nǐ hǎo', translation: 'Olá', sentence: '你好！很高兴认识你。', sentenceTranslation: 'Olá! Prazer em conhecer você.' },
  { word: '谢谢', phonetic: 'xiè xie', translation: 'Obrigado(a)', sentence: '谢谢你的帮助。', sentenceTranslation: 'Obrigado pela sua ajuda.' },
  { word: '朋友', phonetic: 'péng you', translation: 'Amigo(a)', sentence: '他是我的朋友。', sentenceTranslation: 'Ele é meu amigo.' },
]
