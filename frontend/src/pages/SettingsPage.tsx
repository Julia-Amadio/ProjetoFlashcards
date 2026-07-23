import { Check, Headphones, LogOut, ShieldCheck, Target } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { loadPreferences, savePreferences, type StudyPreferences } from '../lib/preferences'

export function SettingsPage({ navigate }: { navigate: (path: string) => void }) {
  const { session, logout } = useAuth()
  const email = session?.email ?? 'guest'
  const [preferences, setPreferences] = useState<StudyPreferences>(() => loadPreferences(email))
  const [saved, setSaved] = useState(false)

  function update<K extends keyof StudyPreferences>(key: K, value: StudyPreferences[K]) {
    setPreferences(current => ({ ...current, [key]: value }))
    setSaved(false)
  }

  function submit() {
    savePreferences(email, preferences)
    setSaved(true)
  }

  return <div className="page-wrap settings-page">
    <section className="settings-heading">
      <span className="eyebrow">PREFERÊNCIAS</span>
      <h1>Configurações de estudo</h1>
      <p>Ajuste a experiência ao seu ritmo. As preferências ficam salvas neste dispositivo.</p>
    </section>

    <section className="settings-card">
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
        <button className="primary-button compact" onClick={submit}>Salvar alterações</button>
      </div>
    </section>

    <section className="account-card">
      <div><h2>Sua conta</h2><p>{email}</p></div>
      <button className="secondary-button danger-button" onClick={() => { logout(); navigate('/login') }}><LogOut /> Sair da conta</button>
    </section>
  </div>
}
