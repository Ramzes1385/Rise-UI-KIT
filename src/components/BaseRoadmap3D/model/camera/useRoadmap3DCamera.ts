import type { ComputedRef } from 'vue'
import { computed, nextTick, watch } from 'vue'
import { OrthographicCamera, Vector3 } from 'three'
import { useOrbitCamera } from '@/scene3d/camera/useOrbitCamera'
import type { Scene3DCameraPreset } from '@/scene3d/types/scene3d.types'
import type { Roadmap3DFrame } from '../../types/internal/roadmap3dInternal.types'
import type { Scene3DCameraPose } from '@/scene3d/types/internal/scene3dInternal.types'
import { frameCenter, roadmapFrame, SLAB, STEP, toFraming } from '../scene/roadmap3dSpace'
import { baseDistance, clampPose, frameHalf, visibleHalf } from '@/scene3d/camera/cameraPose'
import type { Roadmap3DCameraApi, Roadmap3DCameraOptions } from '../../types/internal/roadmap3dCompose.types'
import { nearestIsoPreset, presetCameraKind, presetPose, quarterTurnPose } from '@/scene3d/camera/cameraPresets'

const FOCUS_FRAME = 11.5
const FOCUS_HEIGHT = 0.6
const FIT_MARGIN = 1.04
const MAX_FIT = 3

function isIso(preset: Scene3DCameraPreset): boolean {
	return preset.startsWith('iso')
}

function createHomePose(options: Roadmap3DCameraOptions, frame: ComputedRef<Roadmap3DFrame>, center: ComputedRef<Vector3>) {
	function fitZoom(pose: Scene3DCameraPose): number {
		const camera = options.camera.value
		const canvas = options.canvasRef.value
		const sized = canvas && canvas.clientHeight > 0 ? canvas.clientWidth / canvas.clientHeight : 0
		const aspect = sized || (camera instanceof OrthographicCamera ? camera.right / Math.max(camera.top, 0.001) : camera.aspect)
		const half = frameHalf(toFraming(frame.value), aspect)
		const island = options.snapshot.value.island
		const origin = center.value
		const [azimuth, elevation] = [pose[3], Math.PI / 2 - pose[4]]
		const extent = { sideways: 0, up: 0 }
		const take = (point: { x: number; z: number }, height: number): void => {
			const [dx, dz] = [point.x - origin.x, -point.z - origin.z]
			const toward = dx * Math.sin(azimuth) + dz * Math.cos(azimuth)
			extent.sideways = Math.max(extent.sideways, Math.abs(dx * Math.cos(azimuth) - dz * Math.sin(azimuth)))
			extent.up = Math.max(extent.up, Math.abs(height * Math.cos(elevation) - toward * Math.sin(elevation)))
		}
		island.shoreline.forEach(point => {
			take(point, -SLAB - STEP * 3)
			take(point, 0)
		})
		island.mountains.forEach(mountain => take(mountain, mountain.height + 1.6))
		const { sideways, up } = extent
		const zoom = Math.min((half * aspect) / (sideways * FIT_MARGIN), half / (up * FIT_MARGIN))
		return Math.min(Math.max(zoom, 1), MAX_FIT)
	}
	return (preset: Scene3DCameraPreset, azimuth?: number): Scene3DCameraPose => {
		const pose = presetPose(preset, center.value, azimuth)
		return [pose[0], pose[1], pose[2], pose[3], pose[4], fitZoom(pose)]
	}
}

function useFrame(options: Roadmap3DCameraOptions) {
	const frame = computed(() => roadmapFrame(options.snapshot.value.island.bounds))
	const center = computed(() => frameCenter(frame.value))
	const homePose = createHomePose(options, frame, center)
	const orbit = useOrbitCamera({
		camera: options.camera,
		renderer: options.renderer,
		canvasRef: options.canvasRef,
		getFraming: () => toFraming(frame.value),
		getHomePose: () => homePose(options.preset.value),
		fitted: options.fitted,
		getHasOrbit: () => true,
		invalidate: options.invalidate,
	})
	return { frame, orbit, homePose }
}

export function useRoadmap3DCamera(options: Roadmap3DCameraOptions): Roadmap3DCameraApi {
	const { frame, orbit, homePose } = useFrame(options)
	const { state } = orbit

	function move(pose: Scene3DCameraPose, isAnimated: boolean): void {
		if (isAnimated && !options.isReducedMotion()) state.goTo(pose)
		else state.jump(pose)
	}

	let fitted = homePose(options.preset.value)[5]
	watch(options.fitted, () => {
		const pose = state.next()
		if (Math.abs(pose[5] - fitted) > 0.001) return
		const next = homePose(options.preset.value, pose[3])
		fitted = next[5]
		state.jump(next)
	})

	const home = (): void => move(homePose(options.preset.value, state.next()[3]), true)

	function setPreset(preset: Scene3DCameraPreset): void {
		const isKindChange = presetCameraKind(preset) !== presetCameraKind(options.preset.value)
		options.preset.value = preset
		const pose = homePose(preset, state.next()[3])
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
		turn: orbit.rotate,
		home,
		setPreset,
		rotate,
		focusPoint,
		fit: home,
	}
}
