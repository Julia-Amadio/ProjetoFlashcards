import { BookOpen, Compass, Heart, LogOut, Menu, Settings, Sparkles, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { Logo } from './Logo'

type Props = { children: ReactNode; page: string; navigate: (path: string) => void }

export function AppShell({ children, page, navigate }: Props) {
  const { session, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const name = session?.user?.name || session?.email.split('@')[0] || 'Estudante'
  const initial = name.charAt(0).toUpperCase()
  const links = [
    { id: 'home', label: 'Visão geral', icon: Compass },
    { id: 'study', label: 'Estudar agora', icon: BookOpen },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
  ]

  const go = (path: string) => { navigate(path); setOpen(false) }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar-head"><Logo /><button className="icon-button mobile-only" onClick={() => setOpen(false)} aria-label="Fechar menu"><X /></button></div>
        <nav className="main-nav" aria-label="Navegação principal">
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} className={page === id ? 'active' : ''} onClick={() => go(id === 'home' ? '/' : `/${id}`)}>
              <Icon size={19} />{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-callout"><Sparkles size={18} /><strong>Um pouco todo dia</strong><span>Consistência vence intensidade.</span></div>
        <div className="sidebar-bottom">
          <button><Settings size={18} /> Configurações</button>
          <button onClick={() => { logout(); navigate('/login') }}><LogOut size={18} /> Sair</button>
        </div>
      </aside>
      {open && <button className="backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu /></button>
          <div className="topbar-actions"><button className="streak">🔥 <span>4 dias</span></button><div className="avatar">{initial}</div></div>
        </header>
        {children}
      </main>
    </div>
  )
}
