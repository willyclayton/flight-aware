import { useState, type FormEvent } from 'react'

type Props = {
  onSearch: (query: string) => void
  busy?: boolean
}

export function SearchBar({ onSearch, busy }: Props) {
  const [value, setValue] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSearch(value)
  }

  return (
    <form className="track-search" onSubmit={submit} role="search">
      <input
        id="flight-search"
        className="track-search__input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Track a flight — callsign or hex"
        aria-label="Track a flight"
        autoComplete="off"
        spellCheck={false}
      />
      <button className="track-search__button" type="submit" disabled={busy}>
        {busy ? '…' : 'Go'}
      </button>
    </form>
  )
}
