import {
  DEFAULT_FILTERS,
  type TrafficFilters,
} from '../lib/filters'

type Props = {
  open: boolean
  filters: TrafficFilters
  onChange: (next: TrafficFilters) => void
  onClose: () => void
}

export function FiltersPanel({ open, filters, onChange, onClose }: Props) {
  if (!open) return null

  return (
    <aside className="side-panel side-panel--filters" aria-label="Filter flights">
      <header className="side-panel__header">
        <h2>Filter flights</h2>
        <button
          type="button"
          className="side-panel__close"
          onClick={onClose}
          aria-label="Close filters"
        >
          ×
        </button>
      </header>

      <section className="side-panel__section">
        <h3>Altitude (feet)</h3>
        <div className="filter-range">
          <div className="filter-range__inputs">
            <label>
              <span>Min</span>
              <input
                type="number"
                min={0}
                max={65000}
                step={500}
                value={filters.minAltFt}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    minAltFt: Math.min(
                      filters.maxAltFt,
                      Math.max(0, Number(e.target.value) || 0),
                    ),
                  })
                }
                aria-label="minimum altitude"
              />
            </label>
            <label>
              <span>Max</span>
              <input
                type="number"
                min={0}
                max={65000}
                step={500}
                value={filters.maxAltFt}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    maxAltFt: Math.max(
                      filters.minAltFt,
                      Math.min(65000, Number(e.target.value) || 0),
                    ),
                  })
                }
                aria-label="maximum altitude"
              />
            </label>
          </div>
          <input
            type="range"
            min={0}
            max={65000}
            step={500}
            value={filters.minAltFt}
            onChange={(e) =>
              onChange({
                ...filters,
                minAltFt: Math.min(Number(e.target.value), filters.maxAltFt),
              })
            }
          />
          <input
            type="range"
            min={0}
            max={65000}
            step={500}
            value={filters.maxAltFt}
            onChange={(e) =>
              onChange({
                ...filters,
                maxAltFt: Math.max(Number(e.target.value), filters.minAltFt),
              })
            }
          />
          <p className="filter-range__hint">
            {filters.minAltFt.toLocaleString()} –{' '}
            {filters.maxAltFt >= 65000
              ? '65,000+'
              : filters.maxAltFt.toLocaleString()}{' '}
            ft
          </p>
        </div>
      </section>

      <section className="side-panel__section">
        <h3>Speed (MPH)</h3>
        <div className="filter-range">
          <div className="filter-range__inputs">
            <label>
              <span>Min</span>
              <input
                type="number"
                min={0}
                max={800}
                step={10}
                value={filters.minSpeedMph}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    minSpeedMph: Math.min(
                      filters.maxSpeedMph,
                      Math.max(0, Number(e.target.value) || 0),
                    ),
                  })
                }
                aria-label="minimum speed"
              />
            </label>
            <label>
              <span>Max</span>
              <input
                type="number"
                min={0}
                max={800}
                step={10}
                value={filters.maxSpeedMph}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    maxSpeedMph: Math.max(
                      filters.minSpeedMph,
                      Math.min(800, Number(e.target.value) || 0),
                    ),
                  })
                }
                aria-label="maximum speed"
              />
            </label>
          </div>
          <input
            type="range"
            min={0}
            max={800}
            step={10}
            value={filters.minSpeedMph}
            onChange={(e) =>
              onChange({
                ...filters,
                minSpeedMph: Math.min(
                  Number(e.target.value),
                  filters.maxSpeedMph,
                ),
              })
            }
          />
          <input
            type="range"
            min={0}
            max={800}
            step={10}
            value={filters.maxSpeedMph}
            onChange={(e) =>
              onChange({
                ...filters,
                maxSpeedMph: Math.max(
                  Number(e.target.value),
                  filters.minSpeedMph,
                ),
              })
            }
          />
          <p className="filter-range__hint">
            {filters.minSpeedMph} –{' '}
            {filters.maxSpeedMph >= 800 ? '800+' : filters.maxSpeedMph} MPH
          </p>
        </div>
      </section>

      <button
        type="button"
        className="side-panel__clear"
        onClick={() => onChange({ ...DEFAULT_FILTERS })}
      >
        Clear Filters
      </button>
    </aside>
  )
}
