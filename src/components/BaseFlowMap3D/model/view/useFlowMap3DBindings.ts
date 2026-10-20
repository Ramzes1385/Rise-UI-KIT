import { computed } from 'vue'
import type { ShallowRef } from 'vue'
import type { FlowMapData } from '@components/BaseFlowMap/types/data/flowData.types'
import type { FlowMap3DBindings, FlowMap3DBindingParts } from '../../types/internal/flowMap3dView.types'

const OWN_PROPS = new Set([
	...['view', 'camera', 'isLayered', 'models', 'modelResolver', 'quality', 'rendererFactory', 'configureLoader'],
	...['has2dToggle', 'hasLayersToggle', 'hasCameraControls', 'customClass', 'ui', 'variant', 'color', 'sizeScale'],
	...['onSceneReady', 'onBeforeRender', 'onModelReady', 'data', 'selection', 'mode', 'height'],
])

const FORWARDED = [
	...['change', 'reject', 'node-move', 'focus-change', 'history-change', 'scenario-change', 'scenario-step', 'error'],
	...['node-click', 'node-dblclick', 'node-contextmenu', 'node-enter', 'node-leave'],
	...['edge-click', 'edge-dblclick', 'edge-contextmenu', 'edge-enter', 'edge-leave'],
	...['group-click', 'group-contextmenu', 'group-toggle'],
]

function listenerKey(name: string): string {
	return `on${name.replace(/(^|-)([a-z])/g, (_match, _dash, char: string) => char.toUpperCase())}`
}

function forwarders(emit: FlowMap3DBindingParts['emit']): Record<string, (value: unknown) => void> {
	const send = emit as unknown as (name: string, value: unknown) => void
	return Object.fromEntries(FORWARDED.map(name => [listenerKey(name), (value: unknown) => send(name, value)]))
}

export function useFlowMap3DBindings(parts: FlowMap3DBindingParts) {
	const { props, emit, model, view, track } = parts
	const handlers = {
		...forwarders(emit),
		'onUpdate:data': (next: FlowMapData) => {
			;(model.data as ShallowRef<FlowMapData>).value = next
			emit('update:data', next)
		},
		'onUpdate:mode': (next: string) => view.setMode(next === 'edit' ? 'edit' : 'view'),
		'onUpdate:selection': (ids: string[]) => model.controller.select(ids),
		onViewportChange: track.viewport,
		onReady: track.ready,
	}
	return computed<FlowMap3DBindings>(() => ({
		...Object.fromEntries(Object.entries(props).filter(([key]) => !OWN_PROPS.has(key))),
		...handlers,
		data: model.data.value,
		selection: model.selection.value,
		mode: view.mode.value,
		height: '100%',
		variant: props.variant,
		sizeScale: props.sizeScale,
		color: props.color,
	}))
}
