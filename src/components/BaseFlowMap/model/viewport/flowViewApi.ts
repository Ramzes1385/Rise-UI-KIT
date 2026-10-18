import { buildScenePng, buildSceneSvg } from '../render/flowExportSvg'
import type { FlowFitOptions } from '../../types/api/flowController.types'
import type { FlowViewAdapter } from '../../types/internal/flowModel.types'
import { boundsOf, centerViewport, clampZoom, fitViewport, FIT_PADDING } from './viewGeometry'
import type {
	FlowCanvasContext,
	FlowFocusApi,
	FlowFrameState,
	FlowModelInternal,
	FlowViewState,
} from '../../types/internal/core/flowRenderInternal.types'

const STEP = 1.25

export function createFlowViewApi(
	model: FlowModelInternal,
	parts: { view: FlowViewState; frame: FlowFrameState; focus: FlowFocusApi },
	scene: FlowCanvasContext['scene'],
): FlowViewAdapter {
	const { view, frame, focus } = parts
	const rectOf = (id: string) => model.layout.value.nodes[id] ?? model.layout.value.groups[id]

	function fitView(options?: FlowFitOptions): void {
		const rects = options?.ids ? options.ids.flatMap(id => rectOf(id) ?? []) : []
		const bounds = (rects.length > 0 ? boundsOf(rects) : null) ?? model.layout.value.bounds
		const limits = { ...view.limits(), max: options?.maxZoom ?? view.limits().max }
		const next = fitViewport(bounds, frame.frame.value, { padding: options?.padding ?? FIT_PADDING, limits })
		view.setViewport(next, { isAnimated: options?.isAnimated })
	}

	function focusOn(id: string, options?: { isZoomed?: boolean; isAnimated?: boolean }): void {
		const rect = rectOf(id)
		if (!rect) return
		const zoom = options?.isZoomed ? Math.max(view.viewport.value.zoom, 1) : view.viewport.value.zoom
		view.setViewport(centerViewport(rect, frame.frame.value, zoom), { isAnimated: options?.isAnimated })
		focus.move(id)
	}

	function zoom(to: number | 'in' | 'out'): void {
		if (typeof to === 'string') {
			view.zoomBy(to === 'in' ? STEP : 1 / STEP)
			return
		}
		const current = view.viewport.value
		view.zoomBy(clampZoom(to, view.limits()) / current.zoom)
	}

	return {
		fitView,
		focus: focusOn,
		zoom,
		getViewport: () => view.viewport.value,
		setViewport: view.setViewport,
		exportSvg: async options => buildSceneSvg(scene(), options),
		exportPng: options => buildScenePng(scene(), options),
	}
}
