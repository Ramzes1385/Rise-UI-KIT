import { computed, ref, watch } from 'vue'
import type { BaseImageMap3DEmits, ImageMap3DProps } from '../types/BaseImageMap3D.types'

export function useImageMap3DLayer(props: ImageMap3DProps, emit: BaseImageMap3DEmits) {
	const layerId = ref(props.layer)

	watch(
		() => props.layer,
		value => {
			layerId.value = value
		},
	)

	const activeLayer = computed(() => props.data.layers.find(layer => layer.id === layerId.value) ?? props.data.layers[0])
	const layerOptions = computed(() => props.data.layers.map(layer => ({ value: layer.id, label: layer.shortTitle ?? layer.title })))

	function setLayer(id: string): void {
		if (id === activeLayer.value?.id || !props.data.layers.some(layer => layer.id === id)) return
		layerId.value = id
		emit('update:layer', id)
		emit('layer-change', id)
	}

	return { activeLayer, layerOptions, setLayer }
}
