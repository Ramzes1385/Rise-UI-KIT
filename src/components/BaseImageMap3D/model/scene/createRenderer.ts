import { WebGLRenderer } from 'three'
import type { ImageMap3DRenderer } from '../../types/BaseImageMap3D.types'

export function createWebGLRenderer(canvas: HTMLCanvasElement): ImageMap3DRenderer {
	return new WebGLRenderer({ canvas, antialias: true, alpha: true })
}
