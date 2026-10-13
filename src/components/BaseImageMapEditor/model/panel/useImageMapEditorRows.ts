import { nextTick, shallowRef } from 'vue'
import type { EditorFocusTarget } from '../../types/ImageMapEditorPanel.types'
import type { ImageMapEditorRowsEmits, ImageMapEditorRowsProps } from '../../types/ImageMapEditorRows.types'

function useTargets() {
	const targets = new Map<string, EditorFocusTarget>()
	return {
		track(key: string) {
			return (target: unknown): void => {
				if (target) targets.set(key, target as EditorFocusTarget)
				else targets.delete(key)
			}
		},
		focus(key: string, fallback?: string): void {
			;(targets.get(key) ?? (fallback ? targets.get(fallback) : undefined))?.focus()
		},
	}
}

export function useImageMapEditorRows(props: ImageMapEditorRowsProps, emit: ImageMapEditorRowsEmits) {
	const targets = useTargets()
	const addRef = shallowRef<EditorFocusTarget | null>(null)

	function nearest(index: number, length: number): number {
		return Math.min(index, length - 1)
	}

	return {
		addRef,
		trackRemove: (index: number) => targets.track(`row:${index}`),
		trackAddChild: (index: number) => targets.track(`add:${index}`),
		trackRemoveChild: (index: number, child: number) => targets.track(`child:${index}:${child}`),
		remove(index: number): void {
			emit('remove', index)
			void nextTick(() => {
				const last = nearest(index, props.rows.length)
				if (last >= 0) targets.focus(`row:${last}`)
				else addRef.value?.focus()
			})
		},
		removeChild(index: number, child: number): void {
			emit('remove-child', index, child)
			void nextTick(() => {
				const last = nearest(child, props.rows[index]?.children?.length ?? 0)
				targets.focus(`child:${index}:${last}`, `add:${index}`)
			})
		},
	}
}
