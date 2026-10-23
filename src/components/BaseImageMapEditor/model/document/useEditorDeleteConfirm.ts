import { computed, shallowRef } from 'vue'
import { formatMessage } from '@/locales/state'
import type { useEditorPanel } from '../panel/useEditorPanel'
import { UI_IMAGE_MAP_EDITOR as T } from '@/locales/messages'
import type { EditorContext, EditorDeleteRequest } from '../../types/imageMapEditorInternal.types'

function describe(kind: 'OBJECT' | 'LAYER' | 'GROUP', title: string): EditorDeleteRequest {
	const texts = {
		OBJECT: [T.CONFIRM_OBJECT, T.CONFIRM_OBJECT_TEXT],
		LAYER: [T.CONFIRM_LAYER, T.CONFIRM_LAYER_TEXT],
		GROUP: [T.CONFIRM_GROUP, T.CONFIRM_GROUP_TEXT],
	}[kind]
	return { title: formatMessage(texts[0], { title }), description: formatMessage(texts[1], { undo: T.CONFIRM_UNDO }) }
}

export function useEditorDeleteConfirm(ctx: EditorContext, panel: ReturnType<typeof useEditorPanel>) {
	const request = shallowRef<EditorDeleteRequest | null>(null)
	let settle: ((result: boolean) => void) | null = null

	function ask(next: EditorDeleteRequest): Promise<boolean> {
		settle?.(false)
		request.value = next
		return new Promise(resolve => {
			settle = resolve
		})
	}

	async function confirmed(next: EditorDeleteRequest | null, run: () => void): Promise<boolean> {
		if (!next || ctx.isDisabled() || !(await ask(next)) || ctx.isDisabled()) return false
		run()
		return true
	}

	return {
		request,
		isOpen: computed(() => request.value !== null),
		close(result: boolean): void {
			request.value = null
			settle?.(result)
			settle = null
		},
		deleteSelected(): Promise<boolean> {
			const selected = ctx.selection.getSelected()
			return confirmed(selected ? describe('OBJECT', selected.title) : null, () => {
				if (!selected || !ctx.doc.getData().objects.some(item => item.id === selected.id)) return
				if (ctx.selection.getSelected()?.id !== selected.id) ctx.selection.select(selected.id)
				panel.deleteSelected()
			})
		},
		removeLayer(id: string): Promise<boolean> {
			const layer = ctx.doc.getData().layers.find(item => item.id === id)
			return confirmed(layer ? describe('LAYER', layer.title) : null, () => panel.removeLayer(id))
		},
		removeGroup(id: string): Promise<boolean> {
			const group = ctx.doc.getData().groups?.find(item => item.id === id)
			return confirmed(group ? describe('GROUP', group.title) : null, () => panel.removeGroup(id))
		},
	}
}
