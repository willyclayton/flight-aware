import { BASEMAPS, type BasemapId } from '../lib/basemaps'
import type { WatchItem } from '../hooks/useWatchlist'

export type LayerSettings = {
  basemap: BasemapId
  radar: boolean
  satelliteIr: boolean
  trails: boolean
  airports: boolean
}

type Props = {
  open: boolean
  settings: LayerSettings
  onChange: (next: LayerSettings) => void
  onClose: () => void
  watchlist: WatchItem[]
  onRemoveWatch: (hex: string) => void
  onFocusWatch: (hex: string, flight: string) => void
  radarAge: string | null
}

export function LayersPanel({
  open,
  settings,
  onChange,
  onClose,
  watchlist,
  onRemoveWatch,
  onFocusWatch,
  radarAge,
}: Props) {
  if (!open) return null

  return (
    <aside
      id="layers-panel"
      className="side-panel side-panel--layers"
      aria-label="Change map layers"
    >
      <header className="side-panel__header">
        <h2>Map layers</h2>
        <button
          type="button"
          className="side-panel__close"
          onClick={onClose}
          aria-label="Close layers"
        >
          ×
        </button>
      </header>

      <section className="side-panel__section">
        <h3>Base Layer</h3>
        <ul className="layer-list">
          {(Object.keys(BASEMAPS) as BasemapId[]).map((id) => (
            <li key={id}>
              <label className="layer-list__item">
                <input
                  type="radio"
                  name="basemap"
                  checked={settings.basemap === id}
                  onChange={() => onChange({ ...settings, basemap: id })}
                />
                <span className={`layer-list__swatch layer-list__swatch--${id}`} />
                <span>{BASEMAPS[id].label}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="side-panel__section">
        <h3>Overlays</h3>
        <ul className="layer-list">
          <li>
            <label className="layer-list__item">
              <input
                type="checkbox"
                checked={settings.radar}
                onChange={(e) =>
                  onChange({ ...settings, radar: e.target.checked })
                }
              />
              <span>
                Weather Radar{radarAge ? ` · ${radarAge}` : ''}
              </span>
            </label>
          </li>
          <li>
            <label className="layer-list__item">
              <input
                type="checkbox"
                checked={settings.satelliteIr}
                onChange={(e) =>
                  onChange({ ...settings, satelliteIr: e.target.checked })
                }
              />
              <span>Satellite IR</span>
            </label>
          </li>
          <li>
            <label className="layer-list__item">
              <input
                type="checkbox"
                checked={settings.airports}
                onChange={(e) =>
                  onChange({ ...settings, airports: e.target.checked })
                }
              />
              <span>Nearby Airports</span>
            </label>
          </li>
          <li>
            <label className="layer-list__item">
              <input
                type="checkbox"
                checked={settings.trails}
                onChange={(e) =>
                  onChange({ ...settings, trails: e.target.checked })
                }
              />
              <span>Flight Trails</span>
            </label>
          </li>
        </ul>
      </section>

      <section className="side-panel__section">
        <h3>Watchlist</h3>
        {watchlist.length === 0 ? (
          <p className="side-panel__empty">
            Save a flight from the detail panel.
          </p>
        ) : (
          <ul className="watch-list">
            {watchlist.map((item) => (
              <li key={item.hex}>
                <button
                  type="button"
                  className="watch-list__focus"
                  onClick={() => onFocusWatch(item.hex, item.flight)}
                >
                  {item.flight}
                  <span>{item.hex.toUpperCase()}</span>
                </button>
                <button
                  type="button"
                  className="watch-list__remove"
                  onClick={() => onRemoveWatch(item.hex)}
                  aria-label={`Remove ${item.flight}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}
