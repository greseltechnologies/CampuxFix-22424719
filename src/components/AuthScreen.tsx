import { useState, type FormEvent } from 'react'
import { repository } from '../lib/repository'
import type { AppUser } from '../types'
import { Brand } from './Brand'

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: AppUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    if (password.length < 8) return setError('Password must contain at least 8 characters.')
    setBusy(true)
    try {
      const user = await repository.signIn(email, password)
      onAuthenticated(user)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Authentication failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="Students collaborating on campus">
        <Brand />
        <div className="story-copy">
          <p className="eyebrow">AI-assisted campus operations</p>
          <h1>See it.<br /><em>Report it.</em><br />Get it fixed.</h1>
          <p>One accountable path from a natural-language report to classification, safe routing, maintenance evidence and user confirmation.</p>
        </div>
        <div className="story-flow" aria-label="CampusFix workflow">
          <span>Report</span><b>AI</b><span>Assign</span><b>Repair</b><span>Verify</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-brand"><Brand /></div>
          <p className="eyebrow">Welcome to CampusFix</p>
          <h2>Sign in to continue</h2>
          <p className="muted">Enter the account details provided by your administrator. CampusFix will open the correct workspace for your assigned role.</p>

          <form onSubmit={submit}>
            <label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@university.edu" /></label>
            <label>Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="At least 8 characters" /></label>
            {error ? <p className="alert error" role="alert">{error}</p> : null}
            <button className="primary wide" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
          </form>

          <aside className="login-guidance">
            <span className="font-icon" aria-hidden="true">✓</span>
            <div><strong>One secure sign-in</strong><small>Your account role and permissions are applied automatically after authentication.</small></div>
          </aside>
        </div>
      </section>
    </main>
  )
}
