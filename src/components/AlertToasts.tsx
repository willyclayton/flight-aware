import type { SquawkAlert } from '../hooks/useEmergencyAlerts'

type Props = {
  alerts: SquawkAlert[]
  onDismiss: (id: string) => void
  onFocus: (hex: string) => void
}

export function AlertToasts({ alerts, onDismiss, onFocus }: Props) {
  if (!alerts.length) return null

  return (
    <div className="alert-stack" role="alert">
      {alerts.map((alert) => (
        <div key={alert.id} className="alert-card">
          <div>
            <p className="alert-card__label">{alert.label}</p>
            <button
              type="button"
              className="alert-card__flight"
              onClick={() => onFocus(alert.hex)}
            >
              {alert.flight} · squawk {alert.squawk}
            </button>
          </div>
          <button
            type="button"
            className="alert-card__close"
            onClick={() => onDismiss(alert.id)}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
