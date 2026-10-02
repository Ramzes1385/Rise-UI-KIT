import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { findObject, objectLayerId } from './editorOps'
import type { EditorSelectionSync } from '../../types/imageMapEditorInternal.types'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'
import type { BaseImageMapEditorEmits, ImageMapEditorProps } from '../../types/BaseImageMapEditor.types'

function objectLayer(data: ImageMapData, id: string | null): string | undefined {
	const object = findObject(data, id)
	return object && objectLayerId(data, object)
}

function useSelectionSync(props: ImageMapEditorProps, sync: EditorSelectionSync): void {
	watch(
		() => props.selected,
		value => {
			sync.selectedId.value = value
			if (value && !findObject(sync.data.value, value)) sync.select(null)
			const layer = objectLayer(sync.data.value, value)
			if (layer) sync.setLayer(layer)
		},
	)
	watch(
		() => sync.currentLayer.value?.id,
		id => {
			if (id) sync.setLayer(id)
		},
	)
}

export function useEditorSelection(props: ImageMapEditorProps, emit: BaseImageMapEditorEmits, data: Ref<ImageMapData>) {
	const layerId = ref(props.layer)
	const selectedId = ref<string | null>(props.selected)
	const currentLayer = computed(() => data.value.layers.find(layer => layer.id === layerId.value) ?? data.value.layers[0])
	const selected = computed(() => findObject(data.value, selectedId.value))

	function setLayer(id: string): void {
		if (layerId.value === id) return
		layerId.value = id
		emit('update:layer', id)
	}

	function select(id: string | null): void {
		if (selectedId.value === id) return
		selectedId.value = id
		emit('update:selected', id)
		const layer = objectLayer(data.value, id)
		if (layer) setLayer(layer)
	}

	watch(
		() => props.layer,
		value => {
			layerId.value = value
		},
	)
	useSelectionSync(props, { data, selectedId, currentLayer, setLayer, select })
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
