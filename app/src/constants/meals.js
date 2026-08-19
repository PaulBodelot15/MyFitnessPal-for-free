// Répartition calorique par repas — point de départ raisonnable pour une PDM,
// ajustable si besoin (voir CLAUDE.md sur l'ajustement du TDEE/objectif).
export const MEALS = [
  { key: 'petit_dejeuner', label: 'Petit déjeuner', emoji: '🥐', pct: 0.2 },
  { key: 'dejeuner', label: 'Déjeuner', emoji: '🍽️', pct: 0.3 },
  { key: 'gouter', label: 'Goûter', emoji: '🍎', pct: 0.15 },
  { key: 'diner', label: 'Dîner', emoji: '🍝', pct: 0.25 },
  { key: 'collation', label: 'Collation', emoji: '🍪', pct: 0.1 },
]
