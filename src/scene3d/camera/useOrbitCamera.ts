import { MathUtils } from 'three'
import type { Box3 } from 'three'
import type { ComputedRef } from 'vue'
import { ROTATE_STEP } from './cameraKeys'
import { useTween } from '@composables/interaction/useTween'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { CameraFraming, OrbitCameraOptions, Scene3DCameraPose, Scene3DPoseState } from '../types/internal/scene3dInternal.types'
import {
	CAMERA_LIMITS,
	applyPose,
	baseDistance,
	clampPose,
	easeInOutCubic,
	limitTarget,
	objectPose,
	readPose,
	visibleHalf,
} from './cameraPose'

const ZOOM_STEP = 1.5
const WHEEL_SPEED = 0.004
const WHEEL_LINE = 16
const WHEEL_PAGE = 400

function distanceLimits(options: OrbitCameraOptions, framing: CameraFraming): { minDistance: number; maxDistance: number } {
	const distance = baseDistance(options.camera.value, framing)
	return { minDistance: distance / CAMERA_LIMITS.maxZoom, maxDistance: distance / CAMERA_LIMITS.minZoom }
}

function limitPan(controls: OrbitControls, frame: CameraFraming): void {
	const limited = limitTarget(controls.target, frame)
	if (limited.equals(controls.target)) return
	controls.object.position.add(limited.clone().sub(controls.target))
	controls.target.copy(limited)
}

function setTouchAction(canvas: HTMLElement, hasOrbit: boolean): void {
	canvas.style.touchAction = hasOrbit ? 'none' : 'pan-x pan-y'
}

function createControls(options: OrbitCameraOptions, canvas: HTMLCanvasElement, framing: CameraFraming): OrbitControls {
	const controls = new OrbitControls(options.camera.value, canvas)
	Object.assign(controls, {
		enableDamping: false,
		screenSpacePanning: false,
		minPolarAngle: CAMERA_LIMITS.minPolar,
		maxPolarAngle: CAMERA_LIMITS.maxPolar,
		minZoom: CAMERA_LIMITS.minZoom,
		maxZoom: CAMERA_LIMITS.maxZoom,
		...distanceLimits(options, framing),
		enableRotate: options.getHasOrbit(),
		enableZoom: false,
	})
	setTouchAction(canvas, options.getHasOrbit())
	return controls
}

function useCameraPose(options: OrbitCameraOptions, framing: ComputedRef<CameraFraming>): Scene3DPoseState {
	const goal = shallowRef<Scene3DCameraPose>(options.getHomePose())
	const tween = useTween(goal, { duration: 'xslow', easing: easeInOutCubic, target: options.canvasRef })
	const zoom = ref(1)
	const controls = shallowRef<OrbitControls | null>(null)
	let lastPose: Scene3DCameraPose | null = null
	let isPending = false

	const distance = () => baseDistance(options.camera.value, framing.value)

	function show(pose: Scene3DCameraPose): void {
		const target = applyPose(options.camera.value, pose, distance())
		lastPose = pose
		isPending = false
		zoom.value = pose[5]
		controls.value?.target.copy(target)
		options.invalidate()
	}

	function current(): Scene3DCameraPose {
		const target = controls.value?.target
		return target ? readPose(options.camera.value, target, distance()) : (lastPose ?? options.getHomePose())
	}

	function goTo(pose: Scene3DCameraPose): void {
		const from = current()
		goal.value = clampPose(pose, framing.value)
		isPending = true
		tween.replay(from)
	}

	function jump(pose: Scene3DCameraPose): void {
		goal.value = clampPose(pose, framing.value)
		tween.replay(goal.value)
		show(goal.value)
	}

	function next(): Scene3DCameraPose {
		return tween.isRunning.value || isPending ? goal.value : current()
	}

	function sync(): void {
		lastPose = current()
		zoom.value = lastPose[5]
	}

	watch(tween.value, show)

	return { tween, zoom, controls, current, next, sync, goTo, jump, show, lastPose: () => lastPose }
}

function useOrbitControls(options: OrbitCameraOptions, state: Scene3DPoseState, framing: ComputedRef<CameraFraming>): void {
	function stop(): void {
		state.controls.value?.dispose()
		state.controls.value = null
	}

	function start(canvas: HTMLCanvasElement): void {
		const pose = state.lastPose() ?? options.getHomePose()
		stop()
		const controls = createControls(options, canvas, framing.value)
		controls.addEventListener('start', () => state.tween.stop())
		controls.addEventListener('change', () => {
			limitPan(controls, framing.value)
			state.sync()
			options.invalidate()
		})
		state.controls.value = controls
		state.jump(pose)
	}

	watch(
		[options.renderer, options.camera],
		([renderer]) => {
			const canvas = options.canvasRef.value
			if (renderer && canvas) start(canvas)
			else stop()
		},
		{ flush: 'post' },
	)

	function refit(): void {
		const controls = state.controls.value
		if (!controls) return
		Object.assign(controls, distanceLimits(options, framing.value))
		const pose = state.lastPose()
		if (pose && !state.tween.isRunning.value) state.show(pose)
	}

	watch(options.fitted, refit)

	watch(options.getHasOrbit, value => {
		const controls = state.controls.value
		if (!controls) return
		controls.enableRotate = value
		setTouchAction(controls.domElement as HTMLElement, value)
	})

	onBeforeUnmount(stop)
}

export function isSamePose(pose: Scene3DCameraPose, other: Scene3DCameraPose): boolean {
	return pose.every((value, index) => Math.abs(value - other[index]) < 1e-6)
}

function turn(pose: Scene3DCameraPose, index: 3 | 4, degrees: number): Scene3DCameraPose {
	return pose.map((value, position) => (position === index ? value + MathUtils.degToRad(degrees) : value)) as Scene3DCameraPose
}

function zoomBy(pose: Scene3DCameraPose, factor: number): Scene3DCameraPose {
	return [pose[0], pose[1], pose[2], pose[3], pose[4], pose[5] * factor]
}

function wheelFactor(event: WheelEvent): number {
	const scale = [1, WHEEL_LINE, WHEEL_PAGE][event.deltaMode] ?? 1
	return MathUtils.clamp(Math.exp(-event.deltaY * scale * WHEEL_SPEED), 1 / ZOOM_STEP, ZOOM_STEP)
}

export function useOrbitCamera(options: OrbitCameraOptions) {
	const framing = computed((): CameraFraming => options.getFraming())
	const state = useCameraPose(options, framing)
	useOrbitControls(options, state, framing)

	const rotate = (degrees: number) => state.goTo(turn(state.next(), 3, degrees))

	return {
		state,
		framing,
		reset: () => state.goTo(options.getHomePose()),
		rotate,
		rotateLeft: () => rotate(-ROTATE_STEP),
		rotateRight: () => rotate(ROTATE_STEP),
		tilt: (degrees: number) => state.goTo(turn(state.next(), 4, degrees)),
		zoomIn: () => state.goTo(zoomBy(state.next(), ZOOM_STEP)),
		zoomOut: () => state.goTo(zoomBy(state.next(), 1 / ZOOM_STEP)),
		zoomToBox: (box: Box3) =>
			state.goTo(objectPose(box, state.next(), visibleHalf(options.camera.value, baseDistance(options.camera.value, framing.value)))),
		wheelZoom: (event: WheelEvent) => {
			if (!(event.ctrlKey || event.metaKey) || !state.controls.value || event.deltaY === 0) return
			event.preventDefault()
			state.goTo(zoomBy(state.next(), wheelFactor(event)))
		},
		pinchZoom: (factor: number) => {
			if (state.controls.value) state.jump(zoomBy(state.next(), factor))
		},
		isMaxZoom: computed(() => state.zoom.value >= CAMERA_LIMITS.maxZoom - 1e-6),
		isMinZoom: computed(() => state.zoom.value <= CAMERA_LIMITS.minZoom + 1e-6),
	}
}
