import { Check, Headphones, LogOut, Lock, ShieldCheck, Target, User as UserIcon } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { PageState } from '../components/PageState'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { defaultPreferences, loadPreferences, savePreferences, type StudyPreferences } from '../lib/preferences'

export function SettingsPage({ navigate }: { navigate: (path: string) => void }) {
  const { session, logout, updateProfile } = useAuth()
  const email = session?.email ?? 'guest'
  const [preferences, setPreferences] = useState<StudyPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const [accountName, setAccountName] = useState(session?.user?.name ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountSaved, setAccountSaved] = useState(false)
  const [accountError, setAccountError] = useState('')

  useEffect(() => {
    if (!session?.token || !session.user?.id) return
    const controller = new AbortController()
    setLoading(true)
    setLoadError(false)
    loadPreferences(session.user.id, session.token, controller.signal)
      .then(setPreferences)
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setLoadError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [session?.token, session?.user?.id])

  function update<K extends keyof StudyPreferences>(key: K, value: StudyPreferences[K]) {
    setPreferences(current => ({ ...current, [key]: value }))
    setSaved(false)
    setSaveError(false)
  }

  async function submit() {
    if (!session?.token || !session.user?.id) return
    setSaving(true)
    const didSave = await savePreferences(session.user.id, session.token, preferences)
    setSaving(false)
    setSaved(didSave)
    setSaveError(!didSave)
  }

  async function submitAccount(event: FormEvent) {
    event.preventDefault()
    if (!session?.token || !session.user?.id) return

    if (newPassword && newPassword !== confirmPassword) {
      setAccountError('As senhas não coincidem.')
      return
    }

    setAccountSaving(true)
    setAccountSaved(false)
    setAccountError('')
    try {
      const updated = await api.updateUser(session.user.id, session.token, {
        name: accountName,
        ...(newPassword ? { password: newPassword } : {}),
      })
      updateProfile(updated)
      setNewPassword('')
      setConfirmPassword('')
      setAccountSaved(true)
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Não foi possível salvar seus dados.')
    } finally {
      setAccountSaving(false)
    }
  }

  return <div className="page-wrap settings-page">
    <section className="settings-heading">
      <span className="eyebrow">PREFERÊNCIAS</span>
      <h1>Configurações de estudo</h1>
      <p>Ajuste a experiência ao seu ritmo. As preferências ficam salvas na sua conta.</p>
    </section>

    {loading
      ? <PageState kind="loading" title="Carregando preferências" description="Buscando suas configurações no servidor." />
      : <section className="settings-card">
        {loadError && <p className="save-error" role="alert">Não foi possível carregar suas preferências salvas. Os valores abaixo são os padrões.</p>}
        <div className="setting-row">
          <span className="setting-icon"><Target /></span>
          <div><label htmlFor="daily-goal">Meta diária</label><p>Quantos cartões você pretende revisar por dia?</p></div>
          <select id="daily-goal" value={preferences.dailyGoal} onChange={event => update('dailyGoal', Number(event.target.value))}>
            {[5, 10, 15, 20, 30].map(goal => <option key={goal} value={goal}>{goal} cartões</option>)}
          </select>
        </div>
        <div className="setting-row">
          <span className="setting-icon"><Headphones /></span>
          <div><label htmlFor="autoplay-audio">Reprodução automática</label><p>Ouvir a palavra sempre que um novo cartão aparecer.</p></div>
          <label className="switch"><input id="autoplay-audio" type="checkbox" checked={preferences.autoplayAudio} onChange={event => update('autoplayAudio', event.target.checked)} /><span /></label>
        </div>
        <div className="setting-row">
          <span className="setting-icon"><ShieldCheck /></span>
          <div><label htmlFor="confirm-exit">Confirmar antes de sair</label><p>Evita encerrar por engano uma sessão ainda em andamento.</p></div>
          <label className="switch"><input id="confirm-exit" type="checkbox" checked={preferences.confirmExit} onChange={event => update('confirmExit', event.target.checked)} /><span /></label>
        </div>
        <div className="settings-actions">
          {saved && <span className="save-confirmation" role="status"><Check /> Preferências salvas</span>}
          {saveError && <span className="save-error" role="alert">Não foi possível salvar suas preferências.</span>}
          <button className="primary-button compact" onClick={submit} disabled={saving}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
        </div>
      </section>}

    <section className="settings-card" style={{ marginTop: 18 }}>
      <form onSubmit={submitAccount}>
        <div className="setting-row">
          <span className="setting-icon"><UserIcon /></span>
          <div><label htmlFor="account-name">Nome</label><p>Como você aparece dentro do Karta.</p></div>
          <input
            id="account-name"
            type="text"
            value={accountName}
            onChange={event => { setAccountName(event.target.value); setAccountSaved(false); setAccountError('') }}
            minLength={3}
            maxLength={50}
            required
          />
        </div>
        <div className="setting-row">
          <span className="setting-icon"><Lock /></span>
          <div><label htmlFor="new-password">Nova senha</label><p>Deixe em branco para manter a senha atual.</p></div>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={event => { setNewPassword(event.target.value); setAccountSaved(false); setAccountError('') }}
            minLength={8}
            placeholder="mínimo de 8 caracteres"
          />
        </div>
        {newPassword && <div className="setting-row">
          <span className="setting-icon"><Lock /></span>
          <div><label htmlFor="confirm-password">Confirmar nova senha</label><p>Repita a senha nova pra confirmar.</p></div>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={event => { setConfirmPassword(event.target.value); setAccountSaved(false); setAccountError('') }}
            minLength={8}
            required
          />
        </div>}
        <div className="settings-actions">
          {accountSaved && <span className="save-confirmation" role="status"><Check /> Dados atualizados</span>}
          {accountError && <span className="save-error" role="alert">{accountError}</span>}
          <button type="submit" className="primary-button compact" disabled={accountSaving}>{accountSaving ? 'Salvando...' : 'Salvar dados da conta'}</button>
        </div>
      </form>
    </section>

    <section className="account-card">
      <div><h2>Sua conta</h2><p>{email}</p></div>
      <button className="secondary-button danger-button" onClick={() => { logout(); navigate('/login') }}><LogOut /> Sair da conta</button>
    </section>
  </div>
}
