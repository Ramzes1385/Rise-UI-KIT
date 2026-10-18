import { vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { render } from '@testing-library/vue'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import type { FlowMapData } from '../../../types/data/flowData.types'
import type { BaseFlowMapProps } from '../../../types/BaseFlowMap.types'

export const pinned = (x: number, y: number) => ({ position: { x, y }, isPinned: true })

export function mapData(patch: Partial<FlowMapData> = {}): FlowMapData {
	return {
		version: 1,
		title: 'Заказы',
		nodes: [
			{ id: 'a', kind: 'service', label: 'Alpha', ...pinned(0, 0) },
			{ id: 'b', kind: 'service', label: 'Beta', ...pinned(300, 0) },
			{ id: 'c', kind: 'service', label: 'Gamma', ...pinned(0, 200) },
		],
		edges: [
			{ id: 'e1', source: 'a', target: 'b', label: 'заказ' },
			{ id: 'e2', source: 'a', target: 'c' },
		],
		...patch,
	}
}

export function stubFrame(width: number, height = 400) {
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height)
}

export function mountMap(props: Partial<BaseFlowMapProps> = {}, options: Record<string, unknown> = {}) {
	return render(BaseFlowMap, { props: { data: mapData(), ...props }, ...options })
}

export function sceneOf(container: Element): HTMLElement {
	return container.querySelector('.base-flow-map__canvas') as HTMLElement
}

export function viewportOf(container: Element): HTMLElement {
	return container.querySelector('.base-flow-map__viewport') as HTMLElement
}

export function controllerOf(result: { emitted: () => Record<string, unknown[][]> }) {
	return result.emitted().ready[0][0] as import('../../../types/api/flowController.types').FlowMapController
}

export function sceneView(container: Element): { x: number; y: number; zoom: number } {
	const match = /translate\((-?[\d.e-]+)px, (-?[\d.e-]+)px\) scale\(([\d.e-]+)\)/.exec(sceneOf(container).style.transform)
	return { x: Number(match?.[1]), y: Number(match?.[2]), zoom: Number(match?.[3]) }
}

export function mockMedia(isReduced: boolean) {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches: isReduced, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

export function runInHost<T>(setup: () => T): { value: T; unmount: () => void } {
	let value: T | undefined
	const host = defineComponent({
		setup() {
			value = setup()
			return () => h('div')
		},
	})
	const { unmount } = render(host)
	return { value: value as T, unmount }
}
