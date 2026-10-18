import { Vector3 } from 'three'
import { computed, watch } from 'vue'
import { toCameraFraming } from './sceneFrame'
import { defaultPose } from '@/scene3d/camera/cameraPose'
import { layerElevation, sceneSettings } from '../scene/sceneLayout'
import { isSamePose, useOrbitCamera } from '@/scene3d/camera/useOrbitCamera'
import type { CameraOptions, CameraPose, SceneFraming } from '../../types/internal/imageMap3dInternal.types'

const FOLLOW_ZOOM = 1.05

function floorY(options: CameraOptions): number {
	const data = options.getData()
	const index = Math.max(
		data.layers.findIndex(layer => layer.id === options.getLayerId()),
		0,
	)
	const layer = data.layers[index]
	return layer ? layerElevation(layer, index, sceneSettings(data)) : 0
}

function homePose(options: CameraOptions, framing: SceneFraming): CameraPose {
	const center = framing.frame.bounds.getCenter(new Vector3())
	if (framing.mode === 'single') center.y = floorY(options)
	return defaultPose(center)
}

export function useCameraController(options: CameraOptions) {
	const framing = computed((): SceneFraming => options.getFraming())
	const orbit = useOrbitCamera({
		camera: options.camera,
		renderer: options.renderer,
		canvasRef: options.canvasRef,
		fitted: options.fitted,
		getHasOrbit: options.getHasOrbit,
		invalidate: options.invalidate,
		getFraming: () => toCameraFraming(framing.value),
		getHomePose: () => homePose(options, framing.value),
	})
	const { state } = orbit

	watch(options.getData, () => state.jump(homePose(options, framing.value)))
	watch(framing, (value, old) => {
		const pose = state.lastPose()
		if (value.mode === old.mode && pose && isSamePose(pose, homePose(options, old))) state.jump(homePose(options, value))
	})
	watch(options.getLayerMode, () => state.goTo(homePose(options, framing.value)))
	watch(options.getLayerId, () => {
		const pose = state.next()
		const y = pose[5] > FOLLOW_ZOOM ? floorY(options) : homePose(options, framing.value)[1]
		state.goTo([pose[0], y, pose[2], pose[3], pose[4], pose[5]])
	})

	return {
		resetCamera: orbit.reset,
		rotate: orbit.rotate,
		rotateLeft: orbit.rotateLeft,
		rotateRight: orbit.rotateRight,
		tilt: orbit.tilt,
		zoomIn: orbit.zoomIn,
		zoomOut: orbit.zoomOut,
		zoomToObject: (id: string) => {
			const box = options.getObjectBox(id)
			if (box) orbit.zoomToBox(box)
		},
		wheelZoom: orbit.wheelZoom,
		pinchZoom: orbit.pinchZoom,
		isMaxZoom: orbit.isMaxZoom,
		isMinZoom: orbit.isMinZoom,
	}
}
