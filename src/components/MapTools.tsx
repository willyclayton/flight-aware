type Panel = 'layers' | 'filters' | null

type Props = {
  open: Panel
  onToggle: (panel: 'layers' | 'filters') => void
  filtersActive?: boolean
}

export function MapTools({ open, onToggle, filtersActive }: Props) {
  return (
    <div className="map-tools" role="toolbar" aria-label="Map tools">
      <button
        type="button"
        className={`map-tools__btn${open === 'layers' ? ' is-active' : ''}`}
        onClick={() => onToggle('layers')}
        aria-pressed={open === 'layers'}
        aria-label="Change map layers"
        title="Change map layers"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2.5 2 8.2l10 5.7 10-5.7L12 2.5Zm0 9.3L4.2 7.5 12 3.1l7.8 4.4L12 11.8Zm0 3.2L2 9.3v2.3l10 5.7 10-5.7V9.3L12 15Z"
          />
        </svg>
      </button>
      <button
        type="button"
        className={`map-tools__btn${open === 'filters' ? ' is-active' : ''}${filtersActive ? ' has-badge' : ''}`}
        onClick={() => onToggle('filters')}
        aria-pressed={open === 'filters'}
        aria-label="Filter flights"
        title="Filter flights"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 6h16v2.2l-6 6.3V20l-4-2v-5.5L4 8.2V6Zm2.2 2 5.8 5.8V17l2 1v-4.2L20 8H6.2Z"
          />
        </svg>
      </button>
    </div>
  )
}
