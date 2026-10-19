import { ref } from 'vue'
import type { FlowElementEvent, FlowElementRef, FlowMapController } from '@components/BaseFlowMap'

export function setup() {
	const log = ref<string[]>([])
	const push = (line: string) => {
		log.value = [line, ...log.value].slice(0, 6)
	}

	const onNodeClick = (event: FlowElementEvent) => push(`node-click: ${event.target.id}`)
	const onEdgeClick = (event: FlowElementEvent) => push(`edge-click: ${event.target.id}`)
	const onFocusChange = (target: FlowElementRef | null) => push(`focus-change: ${target?.id ?? 'вне карты'}`)
	const onSelection = (ids: string[]) => push(`update:selection: ${ids.join(', ') || 'пусто'}`)
	const onReady = (controller: FlowMapController) => {
		controller.on('node-dblclick', event => push(`controller.on node-dblclick: ${event.target.id}`))
		controller.on('viewport-change', viewport => push(`controller.on viewport-change: ${Math.round(viewport.zoom * 100)} %`))
	}

	return { log, onNodeClick, onEdgeClick, onFocusChange, onSelection, onReady }
}
