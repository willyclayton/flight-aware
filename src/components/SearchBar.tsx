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
    <form className="search-bar" onSubmit={submit} role="search">
      <label className="search-bar__label" htmlFor="flight-search">
        Track flight
      </label>
      <div className="search-bar__row">
        <input
          id="flight-search"
          className="search-bar__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Callsign or ICAO hex — e.g. UAL123 / a6e746"
          autoComplete="off"
          spellCheck={false}
        />
        <button className="search-bar__button" type="submit" disabled={busy}>
          {busy ? 'Searching…' : 'Track'}
        </button>
      </div>
    </form>
  )
}
