// src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock SpeechSynthesis API
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
  },
  writable: true,
})

// Mock SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
  text,
  lang: '',
})) as unknown as typeof SpeechSynthesisUtterance