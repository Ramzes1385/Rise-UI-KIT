import type { ComputedRef } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import { useStageMotion } from './motion/useStageMotion'
import { nodeTones, scenarioIds } from './scene/sceneTones'
import { fitViewCamera } from '@/scene3d/camera/cameraPose'
import { useFlowMap3DScene } from './scene/useFlowMap3DScene'
import { useFlowMap3DCamera } from './camera/useFlowMap3DCamera'
import { presetCameraKind } from '@/scene3d/camera/cameraPresets'
import { useSceneLabels } from '@/scene3d/overlay/useSceneLabels'
import { sceneFrame, toCameraFraming } from './camera/flowMap3dFrame'
import { createWebGLRenderer } from '@/scene3d/renderer/createRenderer'
import { useScene3DViewport } from '@/scene3d/renderer/useScene3DViewport'
import { useFlowHighlight } from '@components/BaseFlowMap/model/context/useFlowHighlight'
import type { Scene3DLabelItem, Scene3DTick } from '@/scene3d/types/internal/scene3dInternal.types'
import type {
	FlowMap3DContent,
	FlowMap3DFrame,
	FlowMap3DSceneOptions,
	FlowMap3DSceneStates,
	FlowMap3DStageOptions,
	FlowMap3DStageParts,
	FlowMap3DViewport,
} from '../types/internal/flowMap3dInternal.types'

const PRIORITY = { flag: 5, selected: 4, hovered: 3, active: 2, focused: 2.5, base: 1 }

function priorityOf(id: string, states: FlowMap3DSceneStates): number {
	if (states.selection.has(id)) return PRIORITY.selected
	if (states.hover === id) return PRIORITY.hovered
	if (states.focus === id) return PRIORITY.focused
	return states.active.has(id) ? PRIORITY.active : PRIORITY.base
}

function labelItems(content: FlowMap3DContent, states: FlowMap3DSceneStates): Scene3DLabelItem[] {
	const nodes = [...content.nodes.entries.values()].map(entry => ({
		id: entry.id,
		anchor: entry.anchor,
		priority: priorityOf(entry.id, states),
		isPinned: states.selection.has(entry.id),
	}))
	const flags = content.layout.layers.flags.map(flag => ({ id: flag.id, anchor: flag.anchor, priority: PRIORITY.flag, isPinned: true }))
	return [...nodes, ...flags]
}

function useStates(options: FlowMap3DStageOptions) {
	const { model } = options
	const highlight = useFlowHighlight(model, options.hovered)
	return computed((): FlowMap3DSceneStates => {
		const active = scenarioIds(model)
		const lit = new Set([...(highlight.value ?? []), ...active])
		return {
			hover: options.hovered.value,
			focus: options.focused.value,
			selection: new Set(model.selection.value),
			active,
			highlight: lit.size > 0 ? lit : null,
			tones: nodeTones(model),
			isPlaying: model.scenario.state.value.status === 'playing',
		}
	})
}

function reducedAnimate(viewport: FlowMap3DViewport, isReducedMotion: () => boolean) {
	return (tick: Scene3DTick) => {
		if (!isReducedMotion()) return viewport.animate(tick)
		tick(0, 0)
		viewport.invalidate()
		return () => undefined
	}
}

function useStageViewport(options: FlowMap3DStageOptions, frame: ComputedRef<FlowMap3DFrame>) {
	const viewport = useScene3DViewport({
		canvasRef: options.canvasRef,
		hostRef: options.hostRef,
		fit: (camera, size) => fitViewCamera(camera, size, toCameraFraming(frame.value)),
		getFactory: () => options.props.rendererFactory ?? createWebGLRenderer,
		getCameraKind: () => presetCameraKind(options.preset.value),
		onError: options.onError,
	})
	watch(frame, viewport.refit)
	return viewport
}

function sceneOptionsOf(options: FlowMap3DStageOptions, parts: FlowMap3DStageParts): FlowMap3DSceneOptions {
	const { viewport, animate, labels, states, camera, built } = parts
	return {
		viewport,
		animate,
		hostRef: options.hostRef,
		snapshot: options.snapshot,
		props: options.props,
		getStates: () => states.value,
		getAzimuth: camera.azimuth,
		getQuality: options.getQuality,
		getParticleCount: options.getParticleCount,
		getHasParticles: options.getHasParticles,
		getHasLayers: options.getHasLayers,
		getBlendDuration: options.getBlendDuration,
		onMoved: () => labels.markDirty(),
		isReducedMotion: options.isReducedMotion,
		onFocus: options.onFocus,
		onBuilt: content => {
			built.value = content
		},
	}
}

export function useFlowMap3DStage(options: FlowMap3DStageOptions) {
	const { snapshot } = options
	const built = shallowRef<FlowMap3DContent | null>(null)
	const frame = computed(() => sceneFrame(snapshot.value))
	const viewport = useStageViewport(options, frame)
	const size = () => ({ width: options.hostRef.value!.clientWidth, height: options.hostRef.value!.clientHeight })
	const camera = useFlowMap3DCamera({
		...viewport,
		canvasRef: options.canvasRef,
		snapshot,
		preset: options.preset,
		getSize: size,
		getBox: id => built.value?.nodes.entries.get(id)?.box ?? null,
		onPreset: options.onPreset,
	})
	const animate = reducedAnimate(viewport, options.isReducedMotion)
	const labels = useSceneLabels(options.labelsRef)
	const states = useStates(options)
	const scene = useFlowMap3DScene(sceneOptionsOf(options, { viewport, animate, labels, states, camera, built }))
	watch([built, states], ([content, next]) => {
		labels.setItems(content ? labelItems(content, next) : [])
		viewport.invalidate()
	})
	viewport.onFrame(() => labels.update(viewport.camera.value, size()))
	const flags = useStageMotion({ options, viewport, built, size })
	return { viewport, camera, scene, labels, states, size, animate, flags }
}
