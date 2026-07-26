/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import type { Session } from '../types'

const STORAGE_KEY = 'karta.session'

type AuthContextValue = {
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as Session | null }
  catch { return null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession)

  const persist = (next: Session | null) => {
    setSession(next)
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const value: AuthContextValue = {
    session,
    login: async (email, password) => {
      const token = await api.login(email, password)
      persist({ token, email })
    },
    register: async (name, email, password) => {
      const user = await api.register({ name, email, password })
      const token = await api.login(email, password)
      persist({ token, email, user })
    },
    logout: () => persist(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return context
}
