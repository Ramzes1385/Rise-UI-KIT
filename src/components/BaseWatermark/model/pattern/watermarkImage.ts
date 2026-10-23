import { tileGeometry } from './watermarkPattern'
import type { ImagePlacement, ImageTileOptions, WatermarkTile } from '../../types/BaseWatermark.types'

const MAX_PIXEL_RATIO = 3

function loadImage(source: string): Promise<HTMLImageElement | null> {
	return new Promise(resolve => {
		const image = new Image()
		image.crossOrigin = 'anonymous'
		image.onload = () => resolve(image)
		image.onerror = () => resolve(null)
		image.src = source
	})
}

function plainTile(options: ImageTileOptions): WatermarkTile {
	return { url: options.image.replace(/"/g, '%22'), width: options.width, height: options.height ?? null, repeat: 'space' }
}

function paintTile(context: CanvasRenderingContext2D, image: HTMLImageElement, placement: ImagePlacement): void {
	for (const [x, y] of placement.geometry.centers) {
		context.save()
		context.translate(x, y)
		context.rotate((placement.rotate * Math.PI) / 180)
		context.drawImage(image, -placement.width / 2, -placement.height / 2, placement.width, placement.height)
		context.restore()
	}
}

function drawTile(image: HTMLImageElement, options: ImageTileOptions): WatermarkTile | null {
	const height = options.height ?? (options.width * image.naturalHeight) / (image.naturalWidth || 1)
	const geometry = tileGeometry({ width: options.width, height, rotate: options.rotate, gap: options.gap })
	const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
	const canvas = document.createElement('canvas')
	canvas.width = geometry.width * ratio
	canvas.height = geometry.height * ratio
	const context = canvas.getContext('2d')
	if (!context) return null
	context.scale(ratio, ratio)
	paintTile(context, image, { geometry, rotate: options.rotate, width: options.width, height })
	return { url: canvas.toDataURL(), width: geometry.width, height: geometry.height, repeat: 'repeat' }
}

export async function buildImageTile(options: ImageTileOptions): Promise<WatermarkTile> {
	const image = await loadImage(options.image)
	if (!image) return plainTile(options)
	try {
		return drawTile(image, options) ?? plainTile(options)
	} catch {
		return plainTile(options)
	}
}
