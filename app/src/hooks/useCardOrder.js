import { useEffect, useState } from 'react'

const STORAGE_KEY = 'mfp-card-order'
export const DEFAULT_ORDER = ['today', 'streak', 'journal', 'weight']

export function useCardOrder() {
  const [order, setOrder] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
      // On ne garde l'ordre sauvegardé que s'il contient bien toutes les cartes
      // connues (protège contre un ancien ordre après ajout/retrait d'une carte).
      if (Array.isArray(stored) && DEFAULT_ORDER.every((id) => stored.includes(id)) && stored.length === DEFAULT_ORDER.length) {
        return stored
      }
    } catch {
      // ignore
    }
    return DEFAULT_ORDER
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  }, [order])

  return [order, setOrder]
}
