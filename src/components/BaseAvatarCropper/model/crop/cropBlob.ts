import type { AvatarCrop, AvatarCropShape, AvatarBlobOptions } from '../../types/BaseAvatarCropper.types'

function drawCrop(context: CanvasRenderingContext2D, source: { image: HTMLImageElement; crop: AvatarCrop }, size: number): void {
	const { image, crop } = source
	context.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, size, size)
}

export function cropBlob(
	source: { image: HTMLImageElement; crop: AvatarCrop },
	shape: AvatarCropShape,
	options: AvatarBlobOptions = {},
): Promise<Blob | null> {
	const size = Math.max(1, Math.round(options.size ?? 256))
	const type = options.type ?? 'image/png'
	const canvas = document.createElement('canvas')
	canvas.width = size
	canvas.height = size
	const context = canvas.getContext('2d')
	if (!context) return Promise.resolve(null)
	if (shape === 'circle' && type === 'image/png') {
		context.beginPath()
		context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
		context.clip()
	}
	drawCrop(context, source, size)
	return new Promise(resolve => {
		try {
			canvas.toBlob(resolve, type, options.quality)
		} catch {
			resolve(null)
		}
	})
}
