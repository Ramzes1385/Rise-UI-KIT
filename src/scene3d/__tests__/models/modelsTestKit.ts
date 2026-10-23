import { Color, MeshStandardMaterial } from 'three'
import { createModelRegistry } from '../../models/registry'
import { resolveScenePalette } from '../../theme/scenePalette'
import { createResourceCache } from '../../scene/resourceCache'
import type { Model3DContext, Model3DNode } from '../../types/model3d.types'
import type { Model3DRegistryOptions } from '../../types/internal/model3dInternal.types'
import type { Scene3DLoop, Scene3DTick } from '../../types/internal/scene3dInternal.types'

export function fakeLoop(): Scene3DLoop & { tickers: Set<Scene3DTick>; frames: number } {
	const tickers = new Set<Scene3DTick>()
	const loop = {
		tickers,
		frames: 0,
		invalidate: () => undefined,
		animate: (tick: Scene3DTick) => {
			tickers.add(tick)
			return () => void tickers.delete(tick)
		},
		onFrame: () => () => undefined,
		onBeforeRender: () => () => undefined,
	}
	return loop
}

export function runFrames(loop: ReturnType<typeof fakeLoop>, count: number, delta = 0.1): void {
	for (let index = 0; index < count; index += 1)
		loop.tickers.forEach(tick => tick(delta, index * delta) === false && loop.tickers.delete(tick))
}

export function createTestRegistry(extra: Partial<Model3DRegistryOptions> = {}) {
	const cache = createResourceCache()
	const loop = fakeLoop()
	const resolveColor = () => new Color('#3366aa')
	const registry = createModelRegistry({
		cache,
		loop,
		resolveColor,
		getPalette: () => resolveScenePalette(resolveColor),
		cell: { width: 1.6, depth: 1.6, height: 1.2 },
		...extra,
	})
	return { registry, cache, loop }
}

export function createTestContext(extra: Partial<Model3DContext> = {}): Model3DContext {
	const cache = createResourceCache()
	return {
		size: { width: 1.6, depth: 1.6, height: 1.2 },
		color: () => new Color('#3366aa'),
		material: () => new MeshStandardMaterial(),
		geometry: (key, build) => cache.geometry(key, build),
		seed: 1,
		isReducedMotion: false,
		...extra,
	}
}

export function node(id: string, title: string, extra: Partial<Model3DNode> = {}): Model3DNode {
	return { id, title, tone: 'none', source: {}, ...extra }
}
