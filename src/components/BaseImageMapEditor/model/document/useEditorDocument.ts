import { ref, watch } from 'vue'
import { useImageMapHistory } from './useImageMapHistory'
import type { EditorMutation } from '../../types/imageMapEditorInternal.types'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'
import { IMAGE_MAP_DATA_VERSION } from '@components/BaseImageMap/types/imageMapData.types'
import type { BaseImageMapEditorEmits, ImageMapEditorProps } from '../../types/BaseImageMapEditor.types'

function emptyMap(): ImageMapData {
	return { version: IMAGE_MAP_DATA_VERSION, layers: [], objects: [] }
}

function cloneMap(data: ImageMapData): ImageMapData {
	return JSON.parse(JSON.stringify(data)) as ImageMapData
}

export function useEditorDocument(props: ImageMapEditorProps, emit: BaseImageMapEditorEmits) {
	const data = ref<ImageMapData>(cloneMap(props.modelValue ?? emptyMap()))
	const history = useImageMapHistory(() => props.historyLimit)
	let lastEmitted: ImageMapData | undefined

	watch(
		() => props.modelValue,
		value => {
			if (value === lastEmitted || JSON.stringify(value ?? emptyMap()) === JSON.stringify(data.value)) return
			data.value = cloneMap(value ?? emptyMap())
			history.clear()
		},
	)

	function serialize(): string {
		return JSON.stringify(data.value)
	}

	function emitChange(): void {
		lastEmitted = cloneMap(data.value)
		emit('update:modelValue', lastEmitted)
	}

	function commit(mergeKey?: string): void {
		if (history.commit(serialize(), mergeKey)) emitChange()
	}

	function restore(snapshot: string | undefined): boolean {
		if (snapshot === undefined) return false
		data.value = JSON.parse(snapshot) as ImageMapData
		emitChange()
		return true
	}

	return {
		data,
		canUndo: history.canUndo,
		canRedo: history.canRedo,
		getData: () => data.value,
		begin: () => history.begin(serialize()),
		commit: () => commit(),
		apply(mutate: EditorMutation, mergeKey?: string): void {
			history.begin(serialize())
			mutate(data.value)
			commit(mergeKey)
		},
		replace(next: ImageMapData): void {
			history.begin(serialize())
			data.value = cloneMap(next)
			commit()
		},
		undo: () => restore(history.undo(serialize())),
		redo: () => restore(history.redo(serialize())),
	}
}
