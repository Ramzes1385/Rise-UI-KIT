import { vi } from 'vitest'
import { render } from '@testing-library/vue'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { tree, zoomNotation, plainZoomNotation } from './flow2Data'
import type { BaseFlowMapProps } from '../../../types/BaseFlowMap.types'
import type { FlowMapController } from '../../../types/api/flowController.types'

export function stubFrame(width: number, height = 500): void {
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height)
}

export function mountMap(props: Partial<BaseFlowMapProps> = {}, slots: Record<string, unknown> = {}) {
	const result = render(BaseFlowMap, {
		props: { data: tree(), notations: [zoomNotation, plainZoomNotation], ...props } as BaseFlowMapProps,
		slots: slots as never,
	})
	const controllerOf = (): FlowMapController => (result.emitted() as Record<string, unknown[][]>).ready[0][0] as FlowMapController
	return { ...result, controllerOf }
}

export function fired(result: { emitted: () => Record<string, unknown> }, name: string): unknown[][] {
	return (result.emitted()[name] ?? []) as unknown[][]
}
