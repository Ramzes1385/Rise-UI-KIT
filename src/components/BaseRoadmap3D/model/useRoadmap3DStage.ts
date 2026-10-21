import { computed, shallowRef, watch } from 'vue'
import { buildLabelSet } from './data/roadmap3dTags'
import { useCarMotion } from './motion/useCarMotion'
import { fitViewCamera } from '@/scene3d/camera/cameraPose'
import { useRoadmap3DScene } from './scene/useRoadmap3DScene'
import { useRoadmap3DCamera } from './camera/useRoadmap3DCamera'
import { roadmapFrame, toFraming } from './scene/roadmap3dSpace'
import { presetCameraKind } from '@/scene3d/camera/cameraPresets'
import { useSceneLabels } from '@/scene3d/overlay/useSceneLabels'
import { createWebGLRenderer } from '@/scene3d/renderer/createRenderer'
import { useScene3DViewport } from '@/scene3d/renderer/useScene3DViewport'
import type { Roadmap3DContent } from '../types/internal/roadmap3dInternal.types'
import type { Scene3DTick } from '@/scene3d/types/internal/scene3dInternal.types'
import type { Roadmap3DStageOptions } from '../types/internal/roadmap3dCompose.types'

function reducedAnimate(viewport: ReturnType<typeof useScene3DViewport>, isReducedMotion: () => boolean) {
	return (tick: Scene3DTick) => {
		if (!isReducedMotion()) return viewport.animate(tick)
		tick(0, 0)
		viewport.invalidate()
		return viewport.animate(() => false)
	}
}

function useViewportCamera(options: Roadmap3DStageOptions) {
	const { props, snapshot } = options
	const frame = computed(() => roadmapFrame(snapshot.value.island.bounds))
	const viewport = useScene3DViewport({
		canvasRef: options.canvasRef,
		hostRef: options.hostRef,
		fit: (camera, size) => fitViewCamera(camera, size, toFraming(frame.value)),
		getFactory: () => props.rendererFactory ?? createWebGLRenderer,
		getCameraKind: () => presetCameraKind(options.preset.value),
		onError: options.onError,
	})
	watch(frame, viewport.refit)
	const camera = useRoadmap3DCamera({
		camera: viewport.camera,
		renderer: viewport.renderer,
		fitted: viewport.fitted,
		invalidate: viewport.invalidate,
		canvasRef: options.canvasRef,
		snapshot,
		preset: options.preset,
		isReducedMotion: options.isReducedMotion,
		onPreset: options.onPreset,
	})
	return { viewport, camera }
}

export function useRoadmap3DStage(options: Roadmap3DStageOptions) {
	const { props, snapshot } = options
	const built = shallowRef<Roadmap3DContent | null>(null)
	const { viewport, camera } = useViewportCamera(options)
	const size = () => ({ width: options.hostRef.value!.clientWidth, height: options.hostRef.value!.clientHeight })
	const animate = reducedAnimate(viewport, options.isReducedMotion)
	const labels = useSceneLabels(options.labelsRef)
	const scene = useRoadmap3DScene({
		viewport,
		animate,
		hostRef: options.hostRef,
		snapshot,
		props,
		getStates: options.getStates,
		getDetail: options.getDetail,
		isReducedMotion: options.isReducedMotion,
		onFocus: options.onFocus,
		onBuilt: content => {
			built.value = content
		},
	})
	const car = useCarMotion({
		content: built,
		snapshot,
		animate,
		invalidate: viewport.invalidate,
		isReducedMotion: options.isReducedMotion,
		getDuration: options.getDuration,
	})
	watch([built, options.tags], ([content, tags]) => {
		labels.setItems(content ? buildLabelSet(tags, content.anchors).items : [])
		viewport.invalidate()
	})
	viewport.onFrame(() => labels.update(viewport.camera.value, size()))
	return { viewport, camera, scene, labels, size, animate, car, content: built }
}
