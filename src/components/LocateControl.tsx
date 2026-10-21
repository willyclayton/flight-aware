import { useCallback, useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export function LocateControl() {
  const map = useMap()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError(true)
      return
    }
    setBusy(true)
    setError(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false)
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 10, {
          duration: 1,
        })
      },
      () => {
        setBusy(false)
        setError(true)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }, [map])

  useEffect(() => {
    const container = L.DomUtil.create('div', 'map-zoom leaflet-bar')
    const zoomIn = makeBtn(container, '+', 'Zoom in')
    const zoomOut = makeBtn(container, '−', 'Zoom out')
    const locateBtn = makeBtn(container, '', 'Zoom to my location', true)

    locateBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-6a1 1 0 0 1 1 1v1.06A8.01 8.01 0 0 1 19.94 11H21a1 1 0 1 1 0 2h-1.06A8.01 8.01 0 0 1 13 19.94V21a1 1 0 1 1-2 0v-1.06A8.01 8.01 0 0 1 4.06 13H3a1 1 0 1 1 0-2h1.06A8.01 8.01 0 0 1 11 4.06V3a1 1 0 0 1 1-1Zm0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/></svg>`

    const onIn = (e: Event) => {
      L.DomEvent.stopPropagation(e)
      map.zoomIn()
    }
    const onOut = (e: Event) => {
      L.DomEvent.stopPropagation(e)
      map.zoomOut()
    }
    const onLocate = (e: Event) => {
      L.DomEvent.stopPropagation(e)
      locate()
    }

    L.DomEvent.disableClickPropagation(container)
    zoomIn.addEventListener('click', onIn)
    zoomOut.addEventListener('click', onOut)
    locateBtn.addEventListener('click', onLocate)

    const Control = L.Control.extend({
      onAdd() {
        return container
      },
      onRemove() {},
    })
    const control = new Control({ position: 'topleft' })
    map.addControl(control)

    return () => {
      zoomIn.removeEventListener('click', onIn)
      zoomOut.removeEventListener('click', onOut)
      locateBtn.removeEventListener('click', onLocate)
      map.removeControl(control)
    }
  }, [map, locate])

  useEffect(() => {
    const btn = map
      .getContainer()
      .querySelector('.map-zoom__locate') as HTMLElement | null
    if (!btn) return
    btn.classList.toggle('is-busy', busy)
    btn.classList.toggle('is-error', error)
  }, [map, busy, error])

  return null
}

function makeBtn(
  parent: HTMLElement,
  label: string,
  aria: string,
  locate = false,
): HTMLButtonElement {
  const btn = L.DomUtil.create(
    'button',
    `map-zoom__btn${locate ? ' map-zoom__locate' : ''}`,
    parent,
  ) as HTMLButtonElement
  btn.type = 'button'
  btn.title = aria
  btn.setAttribute('aria-label', aria)
  if (label) btn.textContent = label
  return btn
}
