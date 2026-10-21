import { useState, type FormEvent } from 'react'

type Props = {
  open: boolean
  busy?: boolean
  error: string | null
  onSearch: (query: string) => void
  onClose: () => void
}

export function SearchPanel({ open, busy, error, onSearch, onClose }: Props) {
  const [value, setValue] = useState('')

  if (!open) return null

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearch(value)
  }

  return (
    <aside className="side-panel side-panel--search" aria-label="Track a flight">
      <header className="side-panel__header">
        <h2>Track a flight</h2>
        <button
          type="button"
          className="side-panel__close"
          onClick={onClose}
          aria-label="Close search"
        >
          ×
        </button>
      </header>

      <form className="track-search track-search--panel" onSubmit={submit}>
        <input
          className="track-search__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Callsign or ICAO hex"
          aria-label="Callsign or ICAO hex"
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
        <button className="track-search__button" type="submit" disabled={busy}>
          {busy ? '…' : 'Go'}
        </button>
      </form>

      {error ? (
        <p className="chrome-toast" role="alert">
          {error}
        </p>
      ) : null}
    </aside>
  )
}
