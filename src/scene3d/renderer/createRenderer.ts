import { WebGLRenderer } from 'three'
import type { Scene3DRenderer } from '../types/scene3d.types'

export function createWebGLRenderer(canvas: HTMLCanvasElement): Scene3DRenderer {
	return new WebGLRenderer({ canvas, antialias: true, alpha: true })
}
