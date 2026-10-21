import { BASEMAPS, type BasemapId } from '../lib/basemaps'
import type { WatchItem } from '../hooks/useWatchlist'

export type LayerSettings = {
  basemap: BasemapId
  radar: boolean
  satelliteIr: boolean
  trails: boolean
}

type Props = {
  open: boolean
  onToggleOpen: () => void
  settings: LayerSettings
  onChange: (next: LayerSettings) => void
  watchlist: WatchItem[]
  onRemoveWatch: (hex: string) => void
  onFocusWatch: (hex: string, flight: string) => void
  radarAge: string | null
}

export function LayersPanel({
  open,
  onToggleOpen,
  settings,
  onChange,
  watchlist,
  onRemoveWatch,
  onFocusWatch,
  radarAge,
}: Props) {
  return (
    <div className="layers-dock">
      <button
        type="button"
        className={`layers-dock__toggle${open ? ' is-open' : ''}`}
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-controls="layers-panel"
      >
        Layers
      </button>

      {open ? (
        <aside id="layers-panel" className="layers-panel">
          <p className="layers-panel__eyebrow">Pro map suite</p>
          <h2 className="layers-panel__title">Layers</h2>
          <p className="layers-panel__hint">
            Recreates FlightAware Aviator map extras with free data sources.
          </p>

          <section className="layers-panel__section">
            <h3>Base map</h3>
            <div className="layers-panel__choices">
              {(Object.keys(BASEMAPS) as BasemapId[]).map((id) => (
                <label key={id} className="layers-panel__choice">
                  <input
                    type="radio"
                    name="basemap"
                    checked={settings.basemap === id}
                    onChange={() => onChange({ ...settings, basemap: id })}
                  />
                  <span>{BASEMAPS[id].label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="layers-panel__section">
            <h3>Weather</h3>
            <label className="layers-panel__choice">
              <input
                type="checkbox"
                checked={settings.radar}
                onChange={(e) =>
                  onChange({ ...settings, radar: e.target.checked })
                }
              />
              <span>Weather radar{radarAge ? ` · ${radarAge}` : ''}</span>
            </label>
            <label className="layers-panel__choice">
              <input
                type="checkbox"
                checked={settings.satelliteIr}
                onChange={(e) =>
                  onChange({ ...settings, satelliteIr: e.target.checked })
                }
              />
              <span>Satellite IR</span>
            </label>
          </section>

          <section className="layers-panel__section">
            <h3>Traffic</h3>
            <label className="layers-panel__choice">
              <input
                type="checkbox"
                checked={settings.trails}
                onChange={(e) =>
                  onChange({ ...settings, trails: e.target.checked })
                }
              />
              <span>Flight trails</span>
            </label>
          </section>

          <section className="layers-panel__section">
            <h3>Watchlist</h3>
            {watchlist.length === 0 ? (
              <p className="layers-panel__empty">
                Save aircraft from the detail panel.
              </p>
            ) : (
              <ul className="layers-panel__watch">
                {watchlist.map((item) => (
                  <li key={item.hex}>
                    <button
                      type="button"
                      className="layers-panel__watch-focus"
                      onClick={() => onFocusWatch(item.hex, item.flight)}
                    >
                      {item.flight}
                      <span>{item.hex.toUpperCase()}</span>
                    </button>
                    <button
                      type="button"
                      className="layers-panel__watch-remove"
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
      ) : null}
    </div>
  )
}
