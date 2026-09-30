import { UI_MAP } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { MapMarker } from '../../types/BaseMap.types'

export function createMarkerElement(marker: MapMarker, onClick: (marker: MapMarker) => void): HTMLButtonElement {
	const element = document.createElement('button')
	const label = marker.title ?? formatMessage(UI_MAP.MARKER, { id: String(marker.id) })
	element.type = 'button'
	element.className = 'base-map__marker'
	element.setAttribute('aria-label', label)
	element.dataset.label = label
	if (marker.color) element.style.setProperty('--base-map-marker-color', marker.color)
	element.addEventListener('click', event => {
		event.stopPropagation()
		onClick(marker)
	})
	return element
}
