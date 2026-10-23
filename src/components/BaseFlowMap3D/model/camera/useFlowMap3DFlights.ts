import { nextTick } from 'vue'
import { Vector3 } from 'three'
import { CAMERA_LIMITS } from '@/scene3d/camera/cameraPose'
import { presetCameraKind, presetPose } from '@/scene3d/camera/cameraPresets'
import type { FlowMap3DPreset } from '../../types/internal/flowMap3dInternal.types'
import type { FlowMap3DFlightOptions } from '../../types/internal/flowMap3dMotion.types'

const FULL_TURN = Math.PI * 2

export function useFlowMap3DFlights(options: FlowMap3DFlightOptions) {
	const { state } = options

	function setPreset(preset: FlowMap3DPreset): void {
		const isKindChange = presetCameraKind(preset) !== presetCameraKind(options.preset.value)
		options.preset.value = preset
		const pose = presetPose(preset, options.getCenter(), state.next()[3])
		if (!isKindChange) return state.goTo(pose)
		void nextTick(() => nextTick(() => state.jump(pose)))
	}

	function flyTo2d(): void {
		const pose = state.next()
		const turn = Math.round(pose[3] / FULL_TURN) * FULL_TURN
		state.goTo([pose[0], pose[1], pose[2], turn, CAMERA_LIMITS.minPolar, pose[5]])
	}

	function flyFrom2d(preset: FlowMap3DPreset): void {
		if (presetCameraKind(preset) !== presetCameraKind(options.preset.value)) return setPreset(preset)
		options.preset.value = preset
		const pose = state.next()
		const next = presetPose(preset, new Vector3(pose[0], pose[1], pose[2]), pose[3])
		state.goTo([next[0], next[1], next[2], next[3], next[4], pose[5]])
	}

	return { setPreset, flyTo2d, flyFrom2d }
}
