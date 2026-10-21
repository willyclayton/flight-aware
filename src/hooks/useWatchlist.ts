import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'flight-aware.watchlist'

export type WatchItem = {
  hex: string
  flight: string
  addedAt: number
}

function readStorage(): WatchItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WatchItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchItem[]>(() => readStorage())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const isWatched = useCallback(
    (hex: string) => items.some((item) => item.hex === hex),
    [items],
  )

  const toggle = useCallback((hex: string, flight: string) => {
    setItems((prev) => {
      if (prev.some((item) => item.hex === hex)) {
        return prev.filter((item) => item.hex !== hex)
      }
      return [...prev, { hex, flight, addedAt: Date.now() }].slice(-25)
    })
  }, [])

  const remove = useCallback((hex: string) => {
    setItems((prev) => prev.filter((item) => item.hex !== hex))
  }, [])

  return { items, isWatched, toggle, remove }
}
