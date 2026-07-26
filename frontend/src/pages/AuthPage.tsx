import { ArrowRight, Check, Eye, EyeOff } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'

export function AuthPage({ mode, navigate }: { mode: 'login' | 'register'; navigate: (path: string) => void }) {
  const { login, register } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isLogin = mode === 'login'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setError('')
    const data = new FormData(event.currentTarget)
    try {
      const email = String(data.get('email')).trim()
      const password = String(data.get('password'))
      if (isLogin) await login(email, password)
      else await register(String(data.get('name')).trim(), email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível continuar.')
    } finally { setLoading(false) }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Logo light />
        <div className="story-copy">
          <span className="eyebrow eyebrow--light">APRENDA NO SEU RITMO</span>
          <h1>Palavras novas.<br /><em>Novos mundos.</em></h1>
          <p>Crie o hábito de aprender idiomas com sessões rápidas, leves e feitas para durar.</p>
          <div className="story-benefits"><span><Check /> Conteúdo em contexto</span><span><Check /> Revisões inteligentes</span></div>
        </div>
        <div className="floating-card card-one"><small>PALAVRA DO DIA</small><b>勇气</b><span>yǒngqì · coragem</span></div>
        <div className="floating-card card-two"><span>Seu progresso</span><b>12 <small>cards hoje</small></b><i><u /></i></div>
        <p className="story-note">“Aprender é descobrir que algo é possível.”</p>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">{isLogin ? 'QUE BOM VER VOCÊ' : 'COMECE SUA JORNADA'}</span>
          <h2>{isLogin ? 'Continue aprendendo.' : 'Crie sua conta.'}</h2>
          <p>{isLogin ? 'Entre para continuar de onde parou.' : 'Leva menos de um minuto para começar.'}</p>
          <form onSubmit={submit}>
            {!isLogin && <label>Nome de usuário<input name="name" minLength={3} maxLength={50} pattern="[a-zA-Z0-9._-]+" placeholder="como quer ser chamado?" required /></label>}
            <label>E-mail<input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required /></label>
            <label>Senha<div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={8} pattern={isLogin ? undefined : '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*'} title={isLogin ? undefined : 'Use ao menos uma letra maiúscula, uma minúscula e um número.'} placeholder="mínimo de 8 caracteres" required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
            {!isLogin && <p className="password-hint">Use maiúscula, minúscula e pelo menos um número.</p>}
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary-button" disabled={loading}>{loading ? 'Só um instante…' : isLogin ? 'Entrar' : 'Criar conta'}<ArrowRight size={18} /></button>
          </form>
          <p className="auth-switch">{isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'} <button onClick={() => navigate(isLogin ? '/register' : '/login')}>{isLogin ? 'Criar agora' : 'Entrar'}</button></p>
        </div>
      </section>
    </main>
  )
}
