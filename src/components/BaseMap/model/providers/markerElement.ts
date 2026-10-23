import { UI_MAP } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { MapMarkerHost, MapMarkerItem } from '../../types/providers.types'

export function createMarkerElement(marker: MapMarkerItem, onClick: (marker: MapMarkerItem) => void): MapMarkerHost {
	const anchor = document.createElement('div')
	const button = document.createElement('button')
	const label = marker.title ?? formatMessage(UI_MAP.MARKER, { id: String(marker.id) })
	anchor.className = 'base-map__anchor'
	button.type = 'button'
	button.className = 'base-map__marker'
	button.setAttribute('aria-label', label)
	button.dataset.label = label
	if (marker.color) button.style.setProperty('--base-map-marker-color', marker.color)
	if (marker.size) anchor.style.setProperty('--base-map-marker-size', `${marker.size}px`)
	button.addEventListener('click', () => onClick(marker))
	anchor.addEventListener('click', event => event.stopPropagation())
	anchor.append(button)
	return { marker, anchor, button }
}
