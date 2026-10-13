import type { MapMarkerHost, MarkerDecoration } from '../../types/providers.types'

export function decorateHosts(hosts: readonly MapMarkerHost[], decoration: MarkerDecoration): void {
	for (const { marker, button } of hosts) {
		const isSelected = marker.id === decoration.selectedId
		const isGroup = Boolean(marker.count)
		button.classList.toggle('base-map__marker--cluster', isGroup)
		button.classList.toggle('base-map__marker--custom', decoration.hasSlot && !isGroup)
		button.classList.toggle('base-map__marker--icon', !decoration.hasSlot && !isGroup && Boolean(marker.icon))
		button.classList.toggle('base-map__marker--selected', isSelected)
		if (!decoration.hasBalloon) continue
		button.setAttribute('aria-haspopup', 'dialog')
		button.setAttribute('aria-expanded', String(isSelected))
		if (isSelected) button.setAttribute('aria-controls', decoration.balloonId)
		else button.removeAttribute('aria-controls')
	}
}
