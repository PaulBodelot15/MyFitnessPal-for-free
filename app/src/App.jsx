import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { fetchActiveGoal, saveGoal } from './lib/goals'
import { fetchLogForDate, addFoodLogEntry, deleteFoodLogEntry, todayISO } from './lib/foodLog'
import { DEFAULT_GOALS } from './constants/defaultGoals'
import Auth from './pages/Auth'
import GoalsCard from './components/GoalsCard'
import GoalsForm from './components/GoalsForm'
import DailyTotals from './components/DailyTotals'
import FoodSearch from './components/FoodSearch'
import FoodLogList from './components/FoodLogList'
import './App.css'

function Dashboard() {
  const { user, signOut } = useAuth()
  const [goal, setGoal] = useState(null)
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [entries, setEntries] = useState([])
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const date = todayISO()

  useEffect(() => {
    let cancelled = false
    fetchActiveGoal(user.id)
      .then((data) => {
        if (!cancelled) setGoal(data)
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setGoalsLoading(false))
    return () => {
      cancelled = true
    }
  }, [user.id])

  useEffect(() => {
    let cancelled = false
    fetchLogForDate(user.id, date)
      .then((data) => !cancelled && setEntries(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setEntriesLoading(false))
    return () => {
      cancelled = true
    }
  }, [user.id, date])

  async function handleAddFood(food, poidsG) {
    const entry = await addFoodLogEntry(user.id, date, food, poidsG)
    setEntries((prev) => [...prev, entry])
    setSearching(false)
  }

  async function handleDeleteFood(id) {
    await deleteFoodLogEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  async function handleSave(values) {
    setSaving(true)
    setError(null)
    try {
      const newGoal = await saveGoal(user.id, values)
      setGoal(newGoal)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <span className="dashboard-brand">MyFitnessPal for free</span>
        <div className="dashboard-header-right">
          <span className="dashboard-user">{user.email}</span>
          <button type="button" className="btn-secondary" onClick={signOut}>
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {error && <p className="auth-error">{error}</p>}

        {goalsLoading && <p className="dashboard-placeholder">Chargement de tes objectifs…</p>}

        {!goalsLoading && editing && (
          <GoalsForm
            initialValues={goal ?? DEFAULT_GOALS}
            saving={saving}
            onCancel={() => setEditing(false)}
            onSave={handleSave}
          />
        )}

        {!goalsLoading && !editing && goal && (
          <GoalsCard goal={goal} onEdit={() => setEditing(true)} />
        )}

        {!goalsLoading && !editing && !goal && (
          <div className="goals-empty">
            <p>Tu n'as pas encore d'objectif enregistré.</p>
            <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
              Définir mes objectifs
            </button>
          </div>
        )}

        {goal && !editing && (
          <section className="food-log-section">
            {entriesLoading ? (
              <p className="dashboard-placeholder">Chargement du journal…</p>
            ) : (
              <DailyTotals entries={entries} goal={goal} />
            )}

            {searching ? (
              <FoodSearch onAdd={handleAddFood} onClose={() => setSearching(false)} />
            ) : (
              <div className="food-log-card">
                <div className="food-log-card-header">
                  <h2>Journal du jour</h2>
                  <button type="button" className="btn-primary" onClick={() => setSearching(true)}>
                    + Ajouter un aliment
                  </button>
                </div>
                <FoodLogList entries={entries} onDelete={handleDeleteFood} />
              </div>
            )}
          </section>
        )}

        <p className="dashboard-placeholder">Prochaine étape : suivi du poids corporel.</p>
      </main>
    </div>
  )
}

function AppContent() {
  const { session, loading } = useAuth()

  if (loading) return <div className="loading-screen">Chargement…</div>

  return session ? <Dashboard /> : <Auth />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
