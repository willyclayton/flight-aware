export function BrandMark() {
  return (
    <div className="brand-mark" aria-label="Flight Aware">
      <svg
        className="brand-mark__logo"
        viewBox="0 0 32 32"
        width="28"
        height="28"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M4 16.5c6.5-1.2 11.8-2 18.2-2.2L28 9l1.2.4-3.4 6.8c2.1.1 3.8.3 5.2.6l-1.1 1.6c-1.8-.3-4-.5-6.7-.5l-3.8 7.4-1.4-.5 2.6-6.9c-5.2.1-9.8.7-15.4 1.8L4 16.5Z"
        />
      </svg>
      <span className="brand-mark__name">FlightAware</span>
    </div>
  )
}
