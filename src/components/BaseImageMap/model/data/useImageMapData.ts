import { computed, ref, watch } from 'vue'
import { resolveObject } from './resolveObject'
import type { ImageMapProps } from '../../types/BaseImageMap.types'
import type { ImageMapLayer } from '../../types/imageMapData.types'
import type { ImageMapLayerView, ResolvedImageMapObject } from '../../types/imageMapModel.types'

function useLayerModel(props: ImageMapProps) {
	const localLayer = ref(props.layer)
	watch(
		() => props.layer,
		value => {
			localLayer.value = value
		},
	)
	const currentLayer = computed((): ImageMapLayer | undefined => {
		const layers = props.data.layers
		return layers.find(layer => layer.id === localLayer.value) ?? layers[0]
	})
	return { localLayer, currentLayer }
}

export function useImageMapData(props: ImageMapProps) {
	const { localLayer, currentLayer } = useLayerModel(props)

	const resolved = computed((): ResolvedImageMapObject[] =>
		props.data.objects.map(object => resolveObject(object, props.data, props.defaultAction)),
	)

	const objectLayer = (item: ResolvedImageMapObject): string | undefined => item.object.layer ?? props.data.layers[0]?.id

	const view = computed((): ImageMapLayerView | undefined => {
		const layer = currentLayer.value
		if (!layer) return undefined
		return { layer, objects: resolved.value.filter(item => objectLayer(item) === layer.id) }
	})

	return {
		localLayer,
		currentLayer,
		view,
		findObject: (id: string | null | undefined): ResolvedImageMapObject | undefined =>
			id ? resolved.value.find(item => item.object.id === id) : undefined,
		layerOf: (id: string): string | undefined => {
			const item = resolved.value.find(entry => entry.object.id === id)
			return item ? objectLayer(item) : undefined
		},
	}
}
