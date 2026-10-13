import type { Ref } from 'vue'
import type { BaseMapEmits, MapView } from '../../types/BaseMap.types'

export function applyViewChange(emit: BaseMapEmits, lastView: Ref<MapView>, view: MapView): void {
	const previous = lastView.value
	lastView.value = view
	if (view.center.lat !== previous.center.lat || view.center.lng !== previous.center.lng) emit('update:center', view.center)
	if (view.zoom !== previous.zoom) emit('update:zoom', view.zoom)
}
