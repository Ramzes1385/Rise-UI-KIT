import { computed, nextTick } from 'vue'
import { useOrbitCamera } from '@/scene3d/camera/useOrbitCamera'
import type { Scene3DCameraPreset } from '@/scene3d/types/scene3d.types'
import { frameCenter, roadmapFrame, toFraming } from '../scene/roadmap3dSpace'
import { baseDistance, clampPose, visibleHalf } from '@/scene3d/camera/cameraPose'
import type { Roadmap3DCameraApi, Roadmap3DCameraOptions } from '../../types/internal/roadmap3dCompose.types'
import { nearestIsoPreset, presetCameraKind, presetPose, quarterTurnPose } from '@/scene3d/camera/cameraPresets'

const FOCUS_FRAME = 11.5
const FOCUS_HEIGHT = 0.6

function isIso(preset: Scene3DCameraPreset): boolean {
	return preset.startsWith('iso')
}

function useFrame(options: Roadmap3DCameraOptions) {
	const frame = computed(() => roadmapFrame(options.snapshot.value.island.bounds))
	const center = computed(() => frameCenter(frame.value))
	const orbit = useOrbitCamera({
		camera: options.camera,
		renderer: options.renderer,
		canvasRef: options.canvasRef,
		getFraming: () => toFraming(frame.value),
		getHomePose: () => presetPose(options.preset.value, center.value),
		fitted: options.fitted,
		getHasOrbit: () => true,
		invalidate: options.invalidate,
	})
	return { frame, center, orbit }
}

export function useRoadmap3DCamera(options: Roadmap3DCameraOptions): Roadmap3DCameraApi {
	const { frame, center, orbit } = useFrame(options)
	const { state } = orbit

	function move(pose: ReturnType<typeof state.next>, isAnimated: boolean): void {
		if (isAnimated && !options.isReducedMotion()) state.goTo(pose)
		else state.jump(pose)
	}

	const home = (): void => move(presetPose(options.preset.value, center.value, state.next()[3]), true)

	function setPreset(preset: Scene3DCameraPreset): void {
		const isKindChange = presetCameraKind(preset) !== presetCameraKind(options.preset.value)
		options.preset.value = preset
		const pose = presetPose(preset, center.value, state.next()[3])
		if (!isKindChange) return move(pose, true)
		void nextTick(() => nextTick(() => state.jump(pose)))
	}

	function rotate(step: 1 | -1): void {
		const pose = quarterTurnPose(state.next(), step)
		move(pose, true)
		if (isIso(options.preset.value)) options.onPreset(nearestIsoPreset(pose[3]))
	}

	function focusPoint(point: { x: number; z: number } | null): void {
		if (!point) return home()
		const camera = options.camera.value
		const view = visibleHalf(camera, baseDistance(camera, toFraming(frame.value)))
		const pose = state.next()
		const zoom = (2 * Math.min(view.half, view.half * view.aspect)) / FOCUS_FRAME
		move(clampPose([point.x, FOCUS_HEIGHT, point.z, pose[3], pose[4], zoom]), true)
	}

	return {
		...orbit,
		azimuth: () => state.next()[3],
		turn: orbit.rotate,
		home,
		setPreset,
		rotate,
		focusPoint,
		fit: home,
	}
}
