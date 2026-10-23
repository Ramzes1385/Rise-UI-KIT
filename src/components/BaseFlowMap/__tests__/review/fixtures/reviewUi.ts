import '../../helpers/lazySettle.test-utils'
import { expect, vi } from 'vitest'
import { ANNA, reviewData } from './reviewHarness'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { configure, render, waitFor } from '@testing-library/vue'
import type { BaseFlowMapProps } from '../../../types/BaseFlowMap.types'
import type { FlowMapController } from '../../../types/api/flowController.types'

configure({ asyncUtilTimeout: 15000 })

export function stubFrame(width: number, height = 600) {
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height)
}

export async function mountReview(props: Partial<BaseFlowMapProps> = {}) {
	const result = render(BaseFlowMap, { props: { data: reviewData(), mode: 'review', currentUser: ANNA, ...props } })
	if (props.mode === 'view') await new Promise(resolve => setTimeout(resolve, 30))
	else await waitFor(() => expect(result.container.querySelector('.base-flow-map__review')).not.toBeNull())
	const controller = (result.emitted() as Record<string, unknown[][]>).ready[0][0] as FlowMapController
	return { ...result, controller }
}

export async function mountCompact(props: Partial<BaseFlowMapProps> = {}) {
	stubFrame(400)
	const view = await mountReview(props)
	await waitFor(() => expect(view.container.querySelector('.base-flow-map')?.classList.contains('base-flow-map--compact')).toBe(true))
	return view
}

export function fired(result: { emitted: () => Record<string, unknown> }, name: string): unknown[][] {
	return (result.emitted()[name] ?? []) as unknown[][]
}
