import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [infoMsg, setInfoMsg] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorMsg(null)
    setInfoMsg(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setErrorMsg(traduireErreur(error.message))
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setErrorMsg(traduireErreur(error.message))
      } else if (data.session) {
        // Confirmation email désactivée côté Supabase : le compte est actif
        // immédiatement, AuthContext va basculer sur le Dashboard tout seul.
      } else {
        setInfoMsg('Compte créé. Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>MyFitnessPal for free</h1>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Connecte-toi à ton compte' : 'Crée un compte'}
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />

        {errorMsg && <p className="auth-error">{errorMsg}</p>}
        {infoMsg && <p className="auth-info">{infoMsg}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </button>

        <button
          type="button"
          className="auth-toggle"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setErrorMsg(null)
            setInfoMsg(null)
          }}
        >
          {mode === 'login' ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>
      </form>
    </div>
  )
}

function traduireErreur(message) {
  const traductions = {
    'Invalid login credentials': 'Email ou mot de passe incorrect.',
    'User already registered': 'Un compte existe déjà avec cet email.',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
  }
  return traductions[message] || message
}
