import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { findObject, objectLayerId } from './editorOps'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'
import type { BaseImageMapEditorEmits, ImageMapEditorProps } from '../../types/BaseImageMapEditor.types'

export function useEditorSelection(props: ImageMapEditorProps, emit: BaseImageMapEditorEmits, data: Ref<ImageMapData>) {
	const layerId = ref(props.layer)
	const selectedId = ref<string | null>(props.selected)
	const currentLayer = computed(() => data.value.layers.find(layer => layer.id === layerId.value) ?? data.value.layers[0])
	const selected = computed(() => findObject(data.value, selectedId.value))

	function setLayer(id: string): void {
		if (currentLayer.value?.id === id) return
		layerId.value = id
		emit('update:layer', id)
	}

	function select(id: string | null): void {
		if (selectedId.value === id) return
		selectedId.value = id
		emit('update:selected', id)
		const object = findObject(data.value, id)
		const objectLayer = object && objectLayerId(data.value, object)
		if (objectLayer) setLayer(objectLayer)
	}

	watch(
		() => props.layer,
		value => {
			layerId.value = value
		},
	)
	watch(
		() => props.selected,
		value => {
			selectedId.value = value
		},
	)
	watch(selected, object => {
		if (!object && selectedId.value) select(null)
	})

	return {
		currentLayer,
		selected,
		setLayer(id: string): void {
			setLayer(id)
			if (selected.value && objectLayerId(data.value, selected.value) !== id) select(null)
		},
		select,
		getLayer: () => currentLayer.value,
		getSelected: () => selected.value,
	}
}
