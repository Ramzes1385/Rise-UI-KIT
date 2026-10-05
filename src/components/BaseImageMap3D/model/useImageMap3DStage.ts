import { cameraKeyAction } from './camera/cameraKeys'
import { useImageMap3DLayer } from './useImageMap3DLayer'
import { createWebGLRenderer } from './scene/createRenderer'
import { useCameraController } from './camera/useCameraController'
import { useImageMap3DScene } from './viewport/useImageMap3DScene'
import { useImageMap3DViewport } from './viewport/useImageMap3DViewport'
import type { CameraKeyAction, StageOptions } from '../types/internal/imageMap3dInternal.types'

function runCameraAction(camera: ReturnType<typeof useCameraController>, action: CameraKeyAction): void {
	if (action.type === 'rotate') camera.rotate(action.degrees)
	else if (action.type === 'tilt') camera.tilt(action.degrees)
	else if (action.type === 'zoom') (action.direction > 0 ? camera.zoomIn : camera.zoomOut)()
	else camera.resetCamera()
}

export function useImageMap3DStage(options: StageOptions) {
	const { props, emit } = options
	const viewport = useImageMap3DViewport({
		canvasRef: options.canvasRef,
		hostRef: options.hostRef,
		getData: () => props.data,
		getFactory: () => props.rendererFactory ?? createWebGLRenderer,
		getCameraKind: () => props.camera,
		onError: options.onError,
	})
	const layers = useImageMap3DLayer(props, emit)
	const scene = useImageMap3DScene({
		...viewport,
		hostRef: options.hostRef,
		getData: () => props.data,
		getLayerId: () => layers.activeLayer.value?.id,
		getLayerMode: () => props.layerMode,
		getActive: () => props.active,
		getConfigureLoader: () => props.configureLoader,
		onModelError: options.onError,
	})
	const camera = useCameraController({
		...viewport,
		canvasRef: options.canvasRef,
		getData: () => props.data,
		getLayerId: () => layers.activeLayer.value?.id,
		getHasOrbit: () => props.hasOrbit,
		getObjectBox: scene.objectBox,
	})

	function onKeydown(event: KeyboardEvent): void {
		const action = cameraKeyAction(event)
		if (!action) return
		event.preventDefault()
		runCameraAction(camera, action)
	}

	function onWheel(event: WheelEvent): void {
		camera.allowWheelZoom(event.ctrlKey || event.metaKey)
	}

	const exposed = {
		invalidate: viewport.invalidate,
		setLayer: layers.setLayer,
		resetCamera: camera.resetCamera,
		rotate: camera.rotate,
		zoomIn: camera.zoomIn,
		zoomOut: camera.zoomOut,
		zoomToObject: camera.zoomToObject,
	}

	return { layers, camera, onKeydown, onWheel, exposed }
}
