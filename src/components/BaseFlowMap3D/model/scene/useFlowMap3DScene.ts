import { applyStates } from './sceneStates'
import { createPalette } from './flowMap3dPalette'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { useSceneTheme } from '@/scene3d/theme/useSceneTheme'
import { useParticles } from '../motion/particles/useParticles'
import { useScene3DModels } from '@/scene3d/models/useModels3D'
import { createModelLibrary } from '@/scene3d/scene/gltfLoader'
import { createSceneBuilder, useSceneHooks } from './sceneBuilder'
import { createLayersBlend } from '../motion/layers/useLayersBlend'
import { createResourceCache } from '@/scene3d/scene/resourceCache'
import type { FlowMap3DContent, FlowMap3DSceneOptions } from '../../types/internal/flowMap3dInternal.types'

function useSceneWatchers(options: FlowMap3DSceneOptions, content: Readonly<{ value: FlowMap3DContent | null }>, apply: () => void) {
	watch(options.getStates, states => {
		if (!content.value) return
		applyStates(content.value, states)
		options.viewport.invalidate()
	})
	watch(options.getHasParticles, apply)
	useSceneTheme(() => {
		const host = options.hostRef.value
		if (!content.value || !host) return
		content.value.recolor(createPalette(host))
		options.viewport.invalidate()
	})
}

export function useFlowMap3DScene(options: FlowMap3DSceneOptions) {
	const content = shallowRef<FlowMap3DContent | null>(null)
	const cache = createResourceCache()
	const gltf = createModelLibrary(options.props.configureLoader)
	const hooks = useSceneHooks(options, content)
	const particles = useParticles(options, content)
	const blend = createLayersBlend({
		animate: options.viewport.animate,
		invalidate: options.viewport.invalidate,
		getDuration: options.getBlendDuration,
		onMoved: options.onMoved,
	})
	const builder = createSceneBuilder(options, { content, cache, gltf, appModels: useScene3DModels(), hooks, particles, blend })

	watch(
		[options.viewport.renderer, options.snapshot],
		([renderer]) => {
			builder.clear()
			const host = options.hostRef.value
			if (renderer && host) builder.build(host)
		},
		{ flush: 'post' },
	)
	useSceneWatchers(options, content, particles.apply)
	onBeforeUnmount(() => {
		builder.clear()
		cache.dispose()
		void gltf.dispose()
	})

	return { content, getContext: hooks.context }
}
