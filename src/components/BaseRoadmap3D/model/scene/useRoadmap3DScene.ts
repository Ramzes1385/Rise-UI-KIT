import { PCFShadowMap } from 'three'
import type { ShallowRef } from 'vue'
import { buildContent } from './roadmap3dContent'
import { createRoadmapPalette } from './roadmap3dPalette'
import { useSceneTheme } from '@/scene3d/theme/useSceneTheme'
import { useScene3DModels } from '@/scene3d/models/useModels3D'
import { createModelLibrary } from '@/scene3d/scene/gltfLoader'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { createResourceCache } from '@/scene3d/scene/resourceCache'
import type { Scene3DContext, Scene3DRenderer } from '@/scene3d/types/scene3d.types'
import type { Roadmap3DSceneOptions } from '../../types/internal/roadmap3dCompose.types'
import type { Roadmap3DBuildOptions, Roadmap3DContent, Roadmap3DDetail } from '../../types/internal/roadmap3dInternal.types'

function enableShadows(renderer: Scene3DRenderer, isOn: boolean): void {
	const map = (renderer as unknown as { shadowMap?: { enabled: boolean; type: number } }).shadowMap
	if (!map) return
	map.enabled = isOn
	map.type = PCFShadowMap
}

function structureOf(options: Roadmap3DSceneOptions): string {
	return options.snapshot.value.stages.map(stage => [stage.id, ...stage.topics.map(topic => topic.id)].join(',')).join('|')
}

function useHooks(options: Roadmap3DSceneOptions, content: Readonly<{ value: Roadmap3DContent | null }>) {
	const { props, viewport } = options
	let cleanup: (() => void) | void
	let offFrame: (() => void) | null = null
	const context = (): Scene3DContext | null => {
		const renderer = viewport.renderer.value
		if (!renderer) return null
		return {
			scene: viewport.scene,
			camera: viewport.camera.value,
			renderer,
			invalidate: viewport.invalidate,
			animate: options.animate,
			getModel: id => content.value?.registry.getHandle(id) ?? null,
		}
	}
	return {
		context,
		stop: () => {
			cleanup?.()
			cleanup = undefined
			offFrame?.()
			offFrame = null
		},
		start: () => {
			const current = context()
			if (!current) return
			cleanup = props.onSceneReady?.(current)
			if (props.onBeforeRender) offFrame = viewport.onBeforeRender(frame => props.onBeforeRender?.(current, frame))
		},
	}
}

export function detailOf(options: { quality: string; isCompact: boolean }): Roadmap3DDetail {
	const level = options.quality === 'auto' && options.isCompact ? 'low' : options.quality
	return { hasShadows: level !== 'low', hasTrees: level !== 'low', hasClouds: level !== 'low' }
}

function buildOptionsOf(
	options: Roadmap3DSceneOptions,
	shared: {
		host: HTMLElement
		detail: Roadmap3DDetail
		cache: Roadmap3DBuildOptions['runtime']['cache']
		gltf: Roadmap3DBuildOptions['gltf']
		appModels: Roadmap3DBuildOptions['appModels']
	},
): Roadmap3DBuildOptions {
	const { viewport, props } = options
	return {
		snapshot: options.snapshot.value,
		palette: createRoadmapPalette(shared.host),
		runtime: {
			loop: {
				invalidate: viewport.invalidate,
				animate: options.animate,
				onFrame: viewport.onFrame,
				onBeforeRender: viewport.onBeforeRender,
			},
			cache: shared.cache,
			getModels: () => props.models ?? {},
			isReducedMotion: options.isReducedMotion,
			onModelReady: handle => props.onModelReady?.(handle),
			onFocus: options.onFocus,
		},
		detail: shared.detail,
		appModels: shared.appModels,
		gltf: shared.gltf,
	}
}

function startAnimation(options: Roadmap3DSceneOptions, built: Roadmap3DContent): (() => void) | null {
	if (options.isReducedMotion()) return null
	return options.animate((_delta, time) => {
		built.markers.bob(time)
		built.decor.drift(time)
	})
}

function watchScene(options: Roadmap3DSceneOptions, scene: { content: ShallowRef<Roadmap3DContent | null>; rebuild: () => void }): void {
	const { viewport } = options
	const { content } = scene
	const structure = computed(() => structureOf(options))
	watch([viewport.renderer, () => options.snapshot.value.island, structure, () => JSON.stringify(options.getDetail())], scene.rebuild, {
		flush: 'post',
	})
	watch(options.snapshot, next => {
		content.value?.update(next, options.getStates())
		viewport.invalidate()
	})
	watch(options.getStates, states => {
		content.value?.setStates(states)
		viewport.invalidate()
	})
	useSceneTheme(() => {
		const host = options.hostRef.value
		if (!content.value || !host) return
		content.value.recolor(createRoadmapPalette(host))
		viewport.invalidate()
	})
}

export function useRoadmap3DScene(options: Roadmap3DSceneOptions) {
	const { viewport, props } = options
	const content = shallowRef<Roadmap3DContent | null>(null)
	const cache = createResourceCache()
	const gltf = createModelLibrary(props.configureLoader)
	const hooks = useHooks(options, content)
	const appModels = useScene3DModels()
	let stopFrames: (() => void) | null = null
	function clear(): void {
		hooks.stop()
		stopFrames?.()
		stopFrames = null
		const built = content.value
		if (!built) return
		viewport.scene.remove(built.root)
		built.dispose()
		content.value = null
		options.onBuilt(null)
	}

	function build(host: HTMLElement, renderer: Scene3DRenderer): void {
		const detail = options.getDetail()
		enableShadows(renderer, detail.hasShadows)
		const built = buildContent(buildOptionsOf(options, { host, detail, cache, gltf, appModels }))
		content.value = built
		viewport.scene.add(built.root)
		built.setStates(options.getStates())
		stopFrames = startAnimation(options, built)
		options.onBuilt(built)
		hooks.start()
		viewport.invalidate()
	}

	watchScene(options, {
		content,
		rebuild: () => {
			clear()
			const host = options.hostRef.value
			const renderer = viewport.renderer.value
			if (renderer && host) build(host, renderer)
		},
	})
	onBeforeUnmount(() => {
		clear()
		cache.dispose()
		void gltf.dispose()
	})

	return { content, getContext: hooks.context }
}
