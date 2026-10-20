import type { ShallowRef } from 'vue'
import { applyStates } from './sceneStates'
import { createPalette } from './flowMap3dPalette'
import { buildContent } from './build/buildContent'
import type { Scene3DContext } from '@/scene3d/types/scene3d.types'
import type { FlowMap3DSceneParts } from '../../types/internal/flowMap3dBuild.types'
import type {
	FlowMap3DContent,
	FlowMap3DRuntime,
	FlowMap3DSceneOptions,
	FlowMap3DSnapshot,
} from '../../types/internal/flowMap3dInternal.types'

export function useSceneHooks(options: FlowMap3DSceneOptions, content: Readonly<ShallowRef<FlowMap3DContent | null>>) {
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
			getModel: id => content.value?.nodes.registry.getHandle(id) ?? null,
		}
	}

	function stop(): void {
		cleanup?.()
		cleanup = undefined
		offFrame?.()
		offFrame = null
	}

	function start(): void {
		const current = context()!
		cleanup = props.onSceneReady?.(current)
		if (props.onBeforeRender) offFrame = viewport.onBeforeRender(frame => props.onBeforeRender?.(current, frame))
	}

	return { context, start, stop }
}

function createRuntime(options: FlowMap3DSceneOptions, parts: FlowMap3DSceneParts): FlowMap3DRuntime {
	const { viewport, props } = options
	return {
		loop: {
			invalidate: viewport.invalidate,
			animate: options.animate,
			onFrame: viewport.onFrame,
			onBeforeRender: viewport.onBeforeRender,
		},
		cache: parts.cache,
		getModels: () => props.models ?? {},
		isReducedMotion: options.isReducedMotion,
		onModelReady: handle => props.onModelReady?.(handle),
		onFocus: options.onFocus,
	}
}

export function createSceneBuilder(options: FlowMap3DSceneOptions, parts: FlowMap3DSceneParts) {
	const { viewport, props } = options
	const { content } = parts
	let offOrient: (() => void) | null = null
	let previous: FlowMap3DSnapshot | null = null

	function clear(): void {
		parts.hooks.stop()
		parts.particles.stop()
		parts.blend.stop()
		offOrient?.()
		offOrient = null
		const built = content.value
		if (!built) return
		viewport.scene.remove(built.root, built.nodes.group)
		built.dispose()
		content.value = null
		options.onBuilt(null)
	}

	function build(host: HTMLElement): void {
		const [snapshot, palette, hasLayers] = [options.snapshot.value, createPalette(host), options.getHasLayers()]
		const built = buildContent({
			snapshot,
			palette,
			runtime: createRuntime(options, parts),
			quality: options.getQuality(),
			particles: options.getParticleCount(),
			hasLayers,
			appModels: parts.appModels,
			modelResolver: props.modelResolver,
			gltf: parts.gltf,
		})
		content.value = built
		viewport.scene.add(built.root, built.nodes.group)
		offOrient = viewport.onBeforeRender(() => void built.labels.orient(options.getAzimuth()))
		applyStates(built, options.getStates())
		options.onBuilt(built)
		parts.hooks.start()
		parts.particles.apply()
		if (previous)
			parts.blend.start({ content: built, from: previous, to: snapshot, palette, hasSlabs: hasLayers || snapshot.isLayered })
		previous = snapshot
		viewport.invalidate()
	}

	return { clear, build }
}
