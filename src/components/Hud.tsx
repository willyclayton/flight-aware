import { SearchBar } from './SearchBar'

type Props = {
  aircraftCount: number
  loading: boolean
  error: string | null
  searchBusy: boolean
  searchError: string | null
  onSearch: (query: string) => void
}

export function Hud({
  aircraftCount,
  loading,
  error,
  searchBusy,
  searchError,
  onSearch,
}: Props) {
  return (
    <div className="top-chrome">
      <SearchBar onSearch={onSearch} busy={searchBusy} />
      <div className="traffic-status" role="status">
        <span
          className={`traffic-status__dot${loading ? ' is-loading' : ''}`}
        />
        <span>{error ?? `${aircraftCount.toLocaleString()} aircraft`}</span>
      </div>
      {searchError ? (
        <p className="chrome-toast" role="alert">
          {searchError}
        </p>
      ) : null}
    </div>
  )
}
