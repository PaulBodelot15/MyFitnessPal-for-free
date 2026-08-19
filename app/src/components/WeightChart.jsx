import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function WeightChart({ entries, targetKg }) {
  if (entries.length === 0) {
    return <p className="dashboard-placeholder">Aucune pesée enregistrée pour l'instant.</p>
  }

  const data = entries.map((e) => ({
    date: formatShortDate(e.date),
    poids: e.poids_kg,
  }))

  const values = data.map((d) => d.poids)
  const min = Math.min(...values, targetKg ?? Infinity)
  const max = Math.max(...values, targetKg ?? -Infinity)
  const padding = Math.max(1, (max - min) * 0.15)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} stroke="var(--chart-grid)" />
        <YAxis domain={[min - padding, max + padding]} tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} stroke="var(--chart-grid)" />
        <Tooltip
          formatter={(v) => [`${v} kg`, 'Poids']}
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--ink)' }}
          labelStyle={{ color: 'var(--ink)' }}
        />
        {targetKg && (
          <ReferenceLine y={targetKg} stroke="#17b978" strokeDasharray="4 4" label={{ value: 'Objectif', fontSize: 11, fill: '#17b978', position: 'insideTopLeft' }} />
        )}
        <Line type="monotone" dataKey="poids" stroke="#4f8ef7" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
