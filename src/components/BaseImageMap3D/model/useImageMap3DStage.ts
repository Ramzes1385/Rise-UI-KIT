import { computed } from 'vue'
import { toNdc } from './interaction/projection'
import { cameraKeyAction } from './camera/cameraKeys'
import { useRouteTube } from './viewport/useRouteTube'
import { pickObjectId } from './interaction/pickObject'
import { createWebGLRenderer } from './scene/createRenderer'
import { useSceneOverlay } from './interaction/useSceneOverlay'
import { useScenePointer } from './interaction/useScenePointer'
import { useSceneKeyboard } from './interaction/useSceneKeyboard'
import { useCameraController } from './camera/useCameraController'
import { useImageMap3DScene } from './viewport/useImageMap3DScene'
import { useImageMap3DViewport } from './viewport/useImageMap3DViewport'
import type { Center } from '@components/BaseImageMap/types/internal/imageMapInternal.types'
import type { CameraKeyAction, ImageMap3DStage, StageOptions } from '../types/internal/imageMap3dInternal.types'

function runCameraAction(camera: ReturnType<typeof useCameraController>, action: CameraKeyAction): void {
	if (action.type === 'rotate') camera.rotate(action.degrees)
	else if (action.type === 'tilt') camera.tilt(action.degrees)
	else if (action.type === 'zoom') (action.direction > 0 ? camera.zoomIn : camera.zoomOut)()
	else camera.resetCamera()
}

function useStageState(options: StageOptions) {
	const { map } = options
	return {
		layerId: computed(() => map.data.currentLayer.value?.id),
		hidden: computed(
			(): ReadonlySet<string> =>
				new Set(map.data.resolved.value.filter(item => !map.filters.isShown(item.object)).map(item => item.object.id)),
		),
		points: computed(() => (map.data.view.value?.objects ?? []).filter(item => item.object.type === 'point')),
		cardItem: computed(() => {
			const item = map.data.findObject(map.overlay.hoverId.value)
			const isShown = item && map.hasTooltip() && !item.object.isTooltipHidden && !map.overlay.popupId.value
			return isShown && map.data.view.value?.objects.includes(item) ? item : undefined
		}),
	}
}

export function useImageMap3DStage(options: StageOptions) {
	const { props, map } = options
	const state = useStageState(options)
	const viewport = useImageMap3DViewport({
		canvasRef: options.canvasRef,
		hostRef: options.hostRef,
		getData: () => props.data,
		getFactory: () => props.rendererFactory ?? createWebGLRenderer,
		getCameraKind: () => props.camera,
		onError: options.onError,
	})
	const scene = useImageMap3DScene({
		...viewport,
		hostRef: options.hostRef,
		getData: () => props.data,
		getLayerId: () => state.layerId.value,
		getLayerMode: () => props.layerMode,
		getActive: () => map.actions.localActive.value,
		getHover: () => map.overlay.hoverId.value,
		getHidden: () => state.hidden.value,
		getConfigureLoader: () => props.configureLoader,
		onModelError: options.onError,
	})
	const camera = useCameraController({
		...viewport,
		canvasRef: options.canvasRef,
		getData: () => props.data,
		getLayerId: () => state.layerId.value,
		getHasOrbit: () => props.hasOrbit,
		getObjectBox: scene.objectBox,
	})
	const overlay = useSceneOverlay({
		...viewport,
		hostRef: options.hostRef,
		cardRef: options.cardRef,
		getCamera: () => viewport.camera.value,
		objectBox: scene.objectBox,
		getData: () => props.data,
		getCardItem: () => state.cardItem.value,
		getPoints: () => state.points.value,
		getActive: () => map.actions.localActive.value,
		getHover: () => map.overlay.hoverId.value,
	})
	useRouteTube({ ...viewport, hostRef: options.hostRef, getData: () => props.data, getRoute: () => map.routes.routePath.value })
	return { viewport, scene, camera, overlay, state }
}

function sceneCenters(options: StageOptions, stage: ImageMap3DStage): Center[] {
	const host = options.hostRef.value
	const size = { width: host?.clientWidth ?? 0, height: host?.clientHeight ?? 0 }
	const items = (options.map.data.view.value?.objects ?? []).filter(item => !item.isDisabled)
	return items.flatMap(item => {
		const world = stage.overlay.anchorOf(item)
		const spot = world ? stage.overlay.project(world, size) : null
		return spot ? [{ id: item.object.id, x: spot.x, y: spot.y }] : []
	})
}

export function useStageInput(options: StageOptions, stage: ImageMap3DStage, announce: (id: string | null) => void) {
	const { map } = options
	const pointer = useScenePointer({
		pickAt: (x, y) => {
			const content = stage.scene.content.value
			const ndc = options.hostRef.value ? toNdc(x, y, options.hostRef.value.getBoundingClientRect()) : null
			return content && ndc
				? pickObjectId(content, { layerId: stage.state.layerId.value, camera: stage.viewport.camera.value, ndc })
				: null
		},
		setHover: map.setHover,
		activate: map.actions.activate,
	})
	const onSceneKey = useSceneKeyboard({
		centers: () => sceneCenters(options, stage),
		getFocus: () => map.overlay.hoverId.value,
		getActive: () => map.actions.localActive.value,
		focus: id => {
			map.setHover(id)
			announce(id)
		},
		activate: map.actions.activate,
		stepLayer: step => {
			const layers = options.props.data.layers
			const index = layers.findIndex(layer => layer.id === stage.state.layerId.value)
			const next = layers[index + step]
			if (next) map.actions.setLayer(next.id)
		},
	})

	function onKeydown(event: KeyboardEvent): void {
		if (onSceneKey(event)) return
		const action = cameraKeyAction(event)
		if (!action) return
		event.preventDefault()
		runCameraAction(stage.camera, action)
	}

	return { ...pointer, onKeydown, onWheel: (event: WheelEvent) => stage.camera.allowWheelZoom(event.ctrlKey || event.metaKey) }
}
