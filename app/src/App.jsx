import { useEffect, useState } from 'react'
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { AuthProvider, useAuth } from './context/AuthContext'
import { fetchActiveGoal, saveGoal } from './lib/goals'
import { fetchLogForDate, addFoodLogEntry, deleteFoodLogEntry, todayISO } from './lib/foodLog'
import { fetchWeightLog, addWeightEntry, deleteWeightEntry } from './lib/weightLog'
import { fetchDailyKcalTotals } from './lib/dailyKcal'
import { computeStreak } from './lib/streak'
import { DEFAULT_GOALS } from './constants/defaultGoals'
import { getHeatmapRange, OVER_TOLERANCE_KCAL } from './constants/heatmap'
import Auth from './pages/Auth'
import GoalsForm from './components/GoalsForm'
import DailyTotals from './components/DailyTotals'
import MealsJournal from './components/MealsJournal'
import WeightChart from './components/WeightChart'
import WeightForm from './components/WeightForm'
import WeightLogList from './components/WeightLogList'
import CalorieHeatmap from './components/CalorieHeatmap'
import SortableCard from './components/SortableCard'
import { useTheme } from './hooks/useTheme'
import { useCardOrder } from './hooks/useCardOrder'
import './App.css'

function Dashboard() {
  const { user, signOut } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const [goal, setGoal] = useState(null)
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [entries, setEntries] = useState([])
  const [entriesLoading, setEntriesLoading] = useState(true)
  const date = todayISO()

  const [weightEntries, setWeightEntries] = useState([])
  const [weightLoading, setWeightLoading] = useState(true)
  const [addingWeight, setAddingWeight] = useState(false)
  const [savingWeight, setSavingWeight] = useState(false)

  const [dailyTotals, setDailyTotals] = useState({})
  const [dailyTotalsLoading, setDailyTotalsLoading] = useState(true)

  const [cardOrder, setCardOrder] = useCardOrder()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd({ active, over }) {
    if (over && active.id !== over.id) {
      setCardOrder((prev) => arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id)))
    }
  }

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

  useEffect(() => {
    let cancelled = false
    const { fromISO, toISO } = getHeatmapRange()
    fetchDailyKcalTotals(user.id, fromISO, toISO)
      .then((data) => !cancelled && setDailyTotals(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setDailyTotalsLoading(false))
    return () => {
      cancelled = true
    }
  }, [user.id])

  async function handleAddFood(food, poidsG, repas) {
    const entry = await addFoodLogEntry(user.id, date, food, poidsG, repas)
    setEntries((prev) => [...prev, entry])
  }

  async function handleDeleteFood(id) {
    await deleteFoodLogEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  useEffect(() => {
    let cancelled = false
    fetchWeightLog(user.id)
      .then((data) => !cancelled && setWeightEntries(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setWeightLoading(false))
    return () => {
      cancelled = true
    }
  }, [user.id])

  async function handleAddWeight(entry) {
    setSavingWeight(true)
    try {
      const newEntry = await addWeightEntry(user.id, entry)
      setWeightEntries((prev) => [...prev, newEntry].sort((a, b) => a.date.localeCompare(b.date)))
      setAddingWeight(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingWeight(false)
    }
  }

  async function handleDeleteWeight(id) {
    await deleteWeightEntry(id)
    setWeightEntries((prev) => prev.filter((e) => e.id !== id))
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

  function renderCard(id) {
    if (id === 'today') {
      if (goalsLoading) return <p className="dashboard-placeholder">Chargement de tes objectifs…</p>
      if (editing) {
        return (
          <GoalsForm
            initialValues={goal ?? DEFAULT_GOALS}
            saving={saving}
            onCancel={() => setEditing(false)}
            onSave={handleSave}
          />
        )
      }
      if (!goal) {
        return (
          <div className="goals-empty">
            <p>Tu n'as pas encore d'objectif enregistré.</p>
            <button type="button" className="btn-primary" onClick={() => setEditing(true)}>
              Définir mes objectifs
            </button>
          </div>
        )
      }
      if (entriesLoading) return <p className="dashboard-placeholder">Chargement du journal…</p>
      return <DailyTotals entries={entries} goal={goal} onEditGoal={() => setEditing(true)} />
    }

    if (id === 'streak') {
      if (!goal || editing) return null
      if (dailyTotalsLoading) return <p className="dashboard-placeholder">Chargement du suivi…</p>
      const merged = entriesLoading
        ? dailyTotals
        : { ...dailyTotals, [date]: entries.reduce((sum, e) => sum + e.kcal, 0) }
      const streak = computeStreak(merged, goal.kcal_cible, OVER_TOLERANCE_KCAL, date)
      return (
        <div className="goals-card">
          <div className="food-log-card-header">
            <h2>Suivi calorique</h2>
            <span className={`streak-badge ${streak === 0 ? 'streak-badge-zero' : ''}`}>
              <span className="streak-badge-flame">🔥</span>
              {streak}
            </span>
          </div>
          <CalorieHeatmap dailyTotals={merged} kcalCible={goal.kcal_cible} />
        </div>
      )
    }

    if (id === 'journal') {
      if (!goal || editing) return null
      if (entriesLoading) return <p className="dashboard-placeholder">Chargement du journal…</p>
      return <MealsJournal entries={entries} goal={goal} onAdd={handleAddFood} onDelete={handleDeleteFood} />
    }

    if (id === 'weight') {
      if (weightLoading) return <p className="dashboard-placeholder">Chargement du suivi de poids…</p>
      return (
        <div className="weight-card">
          <div className="food-log-card-header">
            <h2>Suivi du poids</h2>
            {!addingWeight && (
              <button type="button" className="btn-primary" onClick={() => setAddingWeight(true)}>
                + Ajouter une pesée
              </button>
            )}
          </div>

          {addingWeight ? (
            <WeightForm saving={savingWeight} onAdd={handleAddWeight} onCancel={() => setAddingWeight(false)} />
          ) : (
            <>
              <WeightChart entries={weightEntries} targetKg={goal?.poids_cible} />
              <WeightLogList entries={weightEntries} onDelete={handleDeleteWeight} />
            </>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <span className="dashboard-brand">MyFitnessPal for free</span>
        <div className="dashboard-header-right">
          <span className="dashboard-user">{user.email}</span>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDarkTheme(theme) ? 'Passer en thème clair' : 'Passer en thème sombre'}
            title={isDarkTheme(theme) ? 'Thème clair' : 'Thème sombre'}
          >
            {isDarkTheme(theme) ? '☀️' : '🌙'}
          </button>
          <button type="button" className="btn-secondary" onClick={signOut}>
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {error && <p className="auth-error">{error}</p>}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cardOrder} strategy={verticalListSortingStrategy}>
            <div className="sortable-list">
              {cardOrder.map((id) => {
                const content = renderCard(id)
                if (!content) return null
                return (
                  <SortableCard key={id} id={id}>
                    {content}
                  </SortableCard>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </main>
    </div>
  )
}

function isDarkTheme(theme) {
  if (theme === 'dark') return true
  if (theme === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
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
