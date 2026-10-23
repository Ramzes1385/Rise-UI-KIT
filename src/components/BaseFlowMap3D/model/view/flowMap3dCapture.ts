import { createColorResolver } from '@/scene3d/theme/colorResolver'
import type { FlowMap3DCaptureSource } from '../../types/internal/flowMap3dInternal.types'
import type { FlowExportImageOptions } from '@components/BaseFlowMap/types/api/flowController.types'

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) => canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('toBlob'))), 'image/png'))
}

export async function captureScene(source: FlowMap3DCaptureSource, options?: FlowExportImageOptions): Promise<Blob> {
	const { host, canvas, render } = source
	render()
	const ratio = options?.pixelRatio ?? 1
	const target = document.createElement('canvas')
	target.width = Math.round(canvas.width * ratio)
	target.height = Math.round(canvas.height * ratio)
	const context = target.getContext('2d')
	if (!context) throw new Error('canvas 2d')
	if (options?.background !== 'transparent') {
		context.fillStyle = `#${createColorResolver(host)('var(--rise-bg)').getHexString()}`
		context.fillRect(0, 0, target.width, target.height)
	}
	context.drawImage(canvas, 0, 0, target.width, target.height)
	return toBlob(target)
}
