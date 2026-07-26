/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../lib/api'
import { isTokenExpired, tokenExpiration } from '../lib/jwt'
import type { Session } from '../types'

const STORAGE_KEY = 'karta.session'

type AuthContextValue = {
  session: Session | null
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadAuthState(): { session: Session | null; expired: boolean } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as Session | null
    if (!saved?.token || !saved.email) {
      localStorage.removeItem(STORAGE_KEY)
      return { session: null, expired: false }
    }
    if (isTokenExpired(saved.token)) {
      localStorage.removeItem(STORAGE_KEY)
      return { session: null, expired: true }
    }
    return { session: saved, expired: false }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return { session: null, expired: false }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialAuthState] = useState(loadAuthState)
  const [session, setSession] = useState<Session | null>(initialAuthState.session)
  const [sessionExpired, setSessionExpired] = useState(initialAuthState.expired)

  const persist = (next: Session | null) => {
    setSession(next)
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    else localStorage.removeItem(STORAGE_KEY)
  }

  const value: AuthContextValue = {
    session,
    sessionExpired,
    login: async (email, password) => {
      const token = await api.login(email, password)
      if (isTokenExpired(token)) throw new Error('O servidor retornou uma sessão inválida.')
      setSessionExpired(false)
      persist({ token, email })
    },
    register: async (name, email, password) => {
      const user = await api.register({ name, email, password })
      const token = await api.login(email, password)
      if (isTokenExpired(token)) throw new Error('O servidor retornou uma sessão inválida.')
      setSessionExpired(false)
      persist({ token, email, user })
    },
    logout: () => { setSessionExpired(false); persist(null) },
  }

  useEffect(() => {
    if (!session) return
    const expiration = tokenExpiration(session.token)
    if (!expiration) {
      setSessionExpired(true)
      persist(null)
      return
    }
    const timeout = window.setTimeout(() => {
      setSessionExpired(true)
      persist(null)
    }, Math.max(expiration - Date.now(), 0))
    return () => window.clearTimeout(timeout)
  }, [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return context
}
