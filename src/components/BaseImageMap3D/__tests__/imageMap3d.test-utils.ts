import { vi } from 'vitest'
import type { ImageMap3DData } from '../types/imageMap3dData.types'
import type { ImageMap3DRenderer } from '../types/BaseImageMap3D.types'

export const DATA_3D: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', image: 'plan-1.png', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', image: 'plan-2.png', width: 800, height: 400, elevation: 200 },
	],
	objects: [
		{ id: 'shop', type: 'point', title: 'Магазин', x: 0.25, y: 0.5, layer: 'f1', height3d: 20 },
		{ id: 'cafe', type: 'point', title: 'Кафе', x: 0.75, y: 0.5, layer: 'f1' },
	],
}

export function createFakeRenderer() {
	return {
		domElement: document.createElement('canvas'),
		setPixelRatio: vi.fn(),
		setSize: vi.fn(),
		render: vi.fn(),
		dispose: vi.fn(),
		forceContextLoss: vi.fn(),
	} satisfies ImageMap3DRenderer
}

export function mockWebGL(isSupported: boolean): { loseContext: ReturnType<typeof vi.fn> } {
	const loseContext = vi.fn()
	const context = { getExtension: () => ({ loseContext }) }
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) =>
		isSupported && type === 'webgl2' ? context : null) as never)
	return { loseContext }
}
