import { SearchBar } from './SearchBar'

type Props = {
  aircraftCount: number
  loading: boolean
  error: string | null
  updatedAt: number | null
  searchBusy: boolean
  searchError: string | null
  onSearch: (query: string) => void
}

export function Hud({
  aircraftCount,
  loading,
  error,
  updatedAt,
  searchBusy,
  searchError,
  onSearch,
}: Props) {
  const status = error ?? `${aircraftCount} aircraft in view`

  return (
    <>
      <div className="hud">
        <SearchBar onSearch={onSearch} busy={searchBusy} />

        <div className="status-chip" role="status">
          <span className={`status-chip__dot${loading ? ' is-loading' : ''}`} />
          <span>
            {status}
            {updatedAt ? (
              <span className="status-chip__time">
                {' '}
                · updated {new Date(updatedAt).toLocaleTimeString()}
              </span>
            ) : null}
          </span>
        </div>

        {searchError ? (
          <p className="toast toast--error">{searchError}</p>
        ) : null}
      </div>

      <div className="brand-dock">
        <span className="brand__mark" aria-hidden="true" />
        <div>
          <p className="brand__name">Flight Aware</p>
          <p className="brand__tag">Live ADS-B map</p>
        </div>
      </div>
    </>
  )
}
