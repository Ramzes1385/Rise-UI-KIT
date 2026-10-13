import { watch } from 'vue'
import { useSceneTheme } from './useSceneTheme'
import { disposeObject } from '../scene/disposeObject'
import { useTween } from '@composables/interaction/useTween'
import { createColorResolver } from '../scene/materials/sceneColors'
import { createRouteTube, growRoute, routeSegments } from '../scene/routeTube'
import type { RouteTube, RouteTubeOptions } from '../../types/internal/imageMap3dInternal.types'

const ROUTE_COLORS = {
	line: 'var(--rise-primary)',
	start: 'var(--rise-success)',
	end: 'var(--rise-primary)',
	transition: 'var(--rise-warning)',
} as const

function paintRoute(tube: RouteTube | null, host: HTMLElement | null): void {
	if (!tube || !host) return
	const resolve = createColorResolver(host)
	tube.materials.line.color.copy(resolve(ROUTE_COLORS.line))
	tube.materials.start.color.copy(resolve(ROUTE_COLORS.start))
	tube.materials.end.color.copy(resolve(ROUTE_COLORS.end))
	tube.materials.transition.color.copy(resolve(ROUTE_COLORS.transition))
}

export function useRouteTube(options: RouteTubeOptions) {
	const progress = useTween<number>(() => 1, { duration: 'xslow', target: options.hostRef })
	let tube: RouteTube | null = null

	function clear(): void {
		if (!tube) return
		options.scene.remove(tube.group)
		disposeObject(tube.group)
		tube = null
	}

	function show(next: RouteTube): void {
		paintRoute(next, options.hostRef.value)
		options.scene.add(next.group)
		progress.replay(0)
		growRoute(next, progress.value.value)
	}

	function build(): void {
		clear()
		const route = options.getRoute()
		const data = options.getData()
		const layerId = options.getLayerMode() === 'single' ? options.getLayerId() : undefined
		tube = options.renderer.value && route ? createRouteTube(routeSegments(route, data, layerId), data) : null
		if (tube) show(tube)
		options.invalidate()
	}

	watch([options.renderer, options.getRoute, options.getData, options.getLayerId, options.getLayerMode], build, { flush: 'post' })

	watch(progress.value, value => {
		if (tube) growRoute(tube, value)
		options.invalidate()
	})

	useSceneTheme(() => {
		paintRoute(tube, options.hostRef.value)
		options.invalidate()
	})

	return { clear }
}
