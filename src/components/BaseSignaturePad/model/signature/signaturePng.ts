import { signaturePath } from './signaturePath'
import type { SignatureStroke, SignatureRenderOptions } from '../../types/BaseSignaturePad.types'

export function signaturePng(strokes: readonly SignatureStroke[], options: SignatureRenderOptions): Promise<Blob | null> {
	const ratio = options.pixelRatio ?? 2
	const canvas = document.createElement('canvas')
	canvas.width = Math.round(options.width * ratio)
	canvas.height = Math.round(options.height * ratio)
	const context = canvas.getContext('2d')
	if (!context || strokes.length === 0) return Promise.resolve(null)
	context.scale(ratio, ratio)
	if (options.background) {
		context.fillStyle = options.background
		context.fillRect(0, 0, options.width, options.height)
	}
	Object.assign(context, { strokeStyle: options.color, lineWidth: options.lineWidth, lineCap: 'round', lineJoin: 'round' })
	context.stroke(new Path2D(signaturePath(strokes)))
	return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}
