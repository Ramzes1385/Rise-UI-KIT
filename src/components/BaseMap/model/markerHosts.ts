import type { MapMarkerHost, MarkerDecoration } from '../types/providers.types'

export function decorateHosts(hosts: readonly MapMarkerHost[], decoration: MarkerDecoration): void {
	for (const { marker, button } of hosts) {
		const isSelected = marker.id === decoration.selectedId
		button.classList.toggle('base-map__marker--custom', decoration.hasSlot)
		button.classList.toggle('base-map__marker--icon', !decoration.hasSlot && Boolean(marker.icon))
		button.classList.toggle('base-map__marker--selected', isSelected)
		if (!decoration.hasBalloon) continue
		button.setAttribute('aria-haspopup', 'dialog')
		button.setAttribute('aria-expanded', String(isSelected))
		if (isSelected) button.setAttribute('aria-controls', decoration.balloonId)
		else button.removeAttribute('aria-controls')
	}
}
