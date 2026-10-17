import { exportFlowPng, exportFlowSvg } from './flowExport'
import type { FlowViewport } from '../../types/api/flowController.types'
import type { FlowViewAdapter } from '../../types/internal/flowModel.types'

function createFallbackView(): FlowViewAdapter {
	let viewport: FlowViewport = { x: 0, y: 0, zoom: 1 }
	const noop = (): void => undefined
	return {
		fitView: noop,
		focus: noop,
		zoom: noop,
		getViewport: () => viewport,
		setViewport: next => (viewport = next),
		exportSvg: exportFlowSvg,
		exportPng: exportFlowPng,
	}
}

export function createViewHolder(): { view: FlowViewAdapter; set: (adapter: FlowViewAdapter) => void } {
	let current = createFallbackView()
	const view: FlowViewAdapter = {
		fitView: options => current.fitView(options),
		focus: (id, options) => current.focus(id, options),
		zoom: to => current.zoom(to),
		getViewport: () => current.getViewport(),
		setViewport: (viewport, options) => current.setViewport(viewport, options),
		exportSvg: options => current.exportSvg(options),
		exportPng: options => current.exportPng(options),
	}
	return { view, set: adapter => (current = adapter) }
}
