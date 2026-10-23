import type { ComputedRef } from 'vue'
import { solveFitZoom } from './roadmap3dFit'
import { computed, nextTick, watch } from 'vue'
import { OrthographicCamera, Vector3 } from 'three'
import { useOrbitCamera } from '@/scene3d/camera/useOrbitCamera'
import type { Scene3DCameraPreset } from '@/scene3d/types/scene3d.types'
import { frameCenter, roadmapFrame, toFraming } from '../scene/roadmap3dSpace'
import type { Roadmap3DFrame } from '../../types/internal/roadmap3dInternal.types'
import { baseDistance, clampPose, visibleHalf } from '@/scene3d/camera/cameraPose'
import type { Scene3DCameraPose } from '@/scene3d/types/internal/scene3dInternal.types'
import type { Roadmap3DCameraApi, Roadmap3DCameraOptions } from '../../types/internal/roadmap3dCompose.types'
import { nearestIsoPreset, presetCameraKind, presetPose, quarterTurnPose } from '@/scene3d/camera/cameraPresets'

const FOCUS_FRAME = 11.5
const FOCUS_HEIGHT = 0.6
const FALLBACK_HEIGHT = 600

function isIso(preset: Scene3DCameraPreset): boolean {
	return preset.startsWith('iso')
}

function createHomePose(options: Roadmap3DCameraOptions, frame: ComputedRef<Roadmap3DFrame>, center: ComputedRef<Vector3>) {
	function fitZoom(pose: Scene3DCameraPose): number {
		const camera = options.camera.value
		const canvas = options.canvasRef.value
		const sized = canvas && canvas.clientHeight > 0 ? { width: canvas.clientWidth, height: canvas.clientHeight } : null
		const aspect = camera instanceof OrthographicCamera ? camera.right / Math.max(camera.top, 0.001) : camera.aspect
		const size = sized ?? { width: FALLBACK_HEIGHT * aspect, height: FALLBACK_HEIGHT }
		return solveFitZoom({ camera, size, framing: toFraming(frame.value), pose, snapshot: options.snapshot.value })
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

function useHomeFit(context: {
	options: Roadmap3DCameraOptions
	state: ReturnType<typeof useOrbitCamera>['state']
	homePose: ReturnType<typeof createHomePose>
	move: (pose: Scene3DCameraPose, isAnimated: boolean) => void
}) {
	const { options, state, homePose, move } = context
	let fitted = 0
	let isFirstFit = true
	const isZoomed = (): boolean => Math.abs(state.next()[5] - fitted) > 0.001

	function applyHome(isAnimated: boolean): void {
		const next = homePose(options.preset.value, state.next()[3])
		fitted = next[5]
		move(next, isAnimated)
	}

	watch(options.fitted, () => {
		if (!isFirstFit && isZoomed()) return
		isFirstFit = false
		applyHome(false)
	})

	watch(
		() => options.snapshot.value.island,
		() => {
			if (!isZoomed()) applyHome(false)
		},
	)

	return {
		home: (): void => applyHome(true),
		remember: (pose: Scene3DCameraPose): void => {
			fitted = pose[5]
		},
	}
}

export function useRoadmap3DCamera(options: Roadmap3DCameraOptions): Roadmap3DCameraApi {
	const { frame, orbit, homePose } = useFrame(options)
	const { state } = orbit

	function move(pose: Scene3DCameraPose, isAnimated: boolean): void {
		if (isAnimated && !options.isReducedMotion()) state.goTo(pose)
		else state.jump(pose)
	}

	const fit = useHomeFit({ options, state, homePose, move })
	const { home } = fit

	function setPreset(preset: Scene3DCameraPreset): void {
		const isKindChange = presetCameraKind(preset) !== presetCameraKind(options.preset.value)
		options.preset.value = preset
		const pose = homePose(preset, state.next()[3])
		fit.remember(pose)
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
