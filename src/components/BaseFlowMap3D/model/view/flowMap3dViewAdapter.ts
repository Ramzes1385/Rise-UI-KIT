import { captureScene } from './flowMap3dCapture'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import type { FlowMap3DAdapterParts } from '../../types/internal/flowMap3dView.types'
import type { FlowViewport } from '@components/BaseFlowMap/types/api/flowController.types'
import type { FlowViewAdapter } from '@components/BaseFlowMap/types/internal/flowModel.types'

function zoomedAt(current: FlowViewport, to: number, size: { width: number; height: number }): FlowViewport {
	const ratio = to / current.zoom
	return {
		zoom: to,
		x: size.width / 2 - (size.width / 2 - current.x) * ratio,
		y: size.height / 2 - (size.height / 2 - current.y) * ratio,
	}
}

export function createViewAdapter(parts: FlowMap3DAdapterParts): FlowViewAdapter {
	const { camera } = parts
	const flat = () => (parts.getView() === '2d' ? parts.getTwoD() : null)

	return {
		fitView: options => {
			const twoD = flat()
			if (twoD) return twoD.fitView(options)
			if (options?.ids?.length === 1) camera.fly(options.ids[0])
			else camera.fit()
		},
		focus: (id, options) => {
			const twoD = flat()
			if (twoD) return twoD.focus(id, options)
			parts.focusNode(id)
			if (options?.isZoomed) camera.fly(id)
		},
		zoom: to => {
			const twoD = flat()
			if (twoD) return twoD.zoom(to)
			if (to === 'in') return camera.zoomIn()
			if (to === 'out') return camera.zoomOut()
			camera.setViewport(zoomedAt(camera.viewport(), to, parts.getSize()), { isAnimated: true })
		},
		getViewport: () => flat()?.getViewport() ?? camera.viewport(),
		setViewport: (viewport, options) => {
			const twoD = flat()
			if (twoD) twoD.setViewport(viewport, options)
			else camera.setViewport(viewport, options)
		},
		exportSvg: async options => {
			const twoD = flat() ?? parts.getTwoD()
			if (!twoD) throw new Error(UI_FLOW_MAP_3D.ERROR_EXPORT_SVG)
			return twoD.exportSvg(options)
		},
		exportPng: async options => {
			const twoD = flat()
			if (twoD) return twoD.exportPng(options)
			const source = parts.getCapture()
			if (!source) throw new Error(UI_FLOW_MAP_3D.ERROR_EXPORT_PNG)
			const blob = await captureScene(source, options)
			parts.announce(UI_FLOW_MAP_3D.ANNOUNCE_SNAPSHOT)
			return blob
		},
	}
}
