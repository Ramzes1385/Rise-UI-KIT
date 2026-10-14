import { nextTick, shallowRef } from 'vue'
import type { EditorFocusTarget, EditorPanelList, ImageMapEditorPanelProps } from '../../types/ImageMapEditorPanel.types'

function useFocusTargets() {
	const rows: Record<EditorPanelList, Map<string, EditorFocusTarget>> = {
		layer: new Map(),
		group: new Map(),
		up: new Map(),
		down: new Map(),
	}
	const addLayerRef = shallowRef<EditorFocusTarget | null>(null)
	const addGroupRef = shallowRef<EditorFocusTarget | null>(null)

	function trackRow(list: EditorPanelList, id: string) {
		return (target: unknown): void => {
			if (target) rows[list].set(id, target as EditorFocusTarget)
			else rows[list].delete(id)
		}
	}

	function focusNear(list: EditorPanelList, getIds: () => string[], index: number): void {
		void nextTick(() => {
			const ids = getIds()
			const id = ids[Math.min(index, ids.length - 1)]
			const target = (id ? rows[list].get(id) : undefined) ?? (list === 'layer' ? addLayerRef : addGroupRef).value
			target?.focus()
		})
	}

	function keepFocus(list: EditorPanelList, id: string): void {
		void nextTick(() => {
			if (document.activeElement === document.body) rows[list].get(id)?.focus()
		})
	}

	return { addLayerRef, addGroupRef, trackRow, focusNear, keepFocus }
}

export function useImageMapEditorPanel(props: ImageMapEditorPanelProps) {
	const focus = useFocusTargets()
	const layerIds = (): string[] => props.data.layers.map(layer => layer.id)
	const groupIds = (): string[] => (props.data.groups ?? []).map(group => group.id)

	return {
		addLayerRef: focus.addLayerRef,
		addGroupRef: focus.addGroupRef,
		trackRow: focus.trackRow,
		moveLayer(id: string, delta: number): void {
			props.panel.moveLayer(id, delta)
			focus.keepFocus(delta < 0 ? 'up' : 'down', id)
		},
		async removeLayer(id: string): Promise<void> {
			const index = layerIds().indexOf(id)
			if (await props.panel.removeLayer(id)) focus.focusNear('layer', layerIds, index)
		},
		async removeGroup(id: string): Promise<void> {
			const index = groupIds().indexOf(id)
			if (await props.panel.removeGroup(id)) focus.focusNear('group', groupIds, index)
		},
	}
}
