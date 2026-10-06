import type { ComputedRef } from 'vue'
import { sceneFrame } from './sceneFrame'
import { ROTATE_STEP } from './cameraKeys'
import { MathUtils, Vector3 } from 'three'
import { useTween } from '@composables/interaction/useTween'
import { layerElevation, sceneSettings } from '../scene/sceneLayout'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { CameraOptions, CameraPose, CameraPoseState, SceneFrame, SceneFraming } from '../../types/internal/imageMap3dInternal.types'
import {
	CAMERA_LIMITS,
	applyPose,
	baseDistance,
	clampPose,
	defaultPose,
	easeInOutCubic,
	limitTarget,
	objectPose,
	readPose,
	visibleHalf,
} from './cameraPose'

const ZOOM_STEP = 1.5
const FOLLOW_ZOOM = 1.05
const WHEEL_SPEED = 0.004
const WHEEL_LINE = 16
const WHEEL_PAGE = 400

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

function distanceLimits(options: CameraOptions, framing: SceneFraming): { minDistance: number; maxDistance: number } {
	const distance = baseDistance(options.camera.value, framing)
	return { minDistance: distance / CAMERA_LIMITS.maxZoom, maxDistance: distance / CAMERA_LIMITS.minZoom }
}

function limitPan(controls: OrbitControls, frame: SceneFrame): void {
	const limited = limitTarget(controls.target, frame)
	if (limited.equals(controls.target)) return
	controls.object.position.add(limited.clone().sub(controls.target))
	controls.target.copy(limited)
}

function setTouchAction(canvas: HTMLElement, hasOrbit: boolean): void {
	canvas.style.touchAction = hasOrbit ? 'none' : 'pan-x pan-y'
}

function createControls(options: CameraOptions, canvas: HTMLCanvasElement, framing: SceneFraming): OrbitControls {
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

function useCameraPose(options: CameraOptions, framing: ComputedRef<SceneFraming>): CameraPoseState {
	const goal = shallowRef<CameraPose>(homePose(options, framing.value))
	const tween = useTween(goal, { duration: 'xslow', easing: easeInOutCubic, target: options.canvasRef })
	const zoom = ref(1)
	const controls = shallowRef<OrbitControls | null>(null)
	let lastPose: CameraPose | null = null

	const distance = () => baseDistance(options.camera.value, framing.value)

	function show(pose: CameraPose): void {
		const target = applyPose(options.camera.value, pose, distance())
		lastPose = pose
		zoom.value = pose[5]
		controls.value?.target.copy(target)
		options.invalidate()
	}

	function current(): CameraPose {
		const target = controls.value?.target
		return target ? readPose(options.camera.value, target, distance()) : (lastPose ?? homePose(options, framing.value))
	}

	function goTo(pose: CameraPose): void {
		const from = current()
		goal.value = clampPose(pose, framing.value.frame)
		tween.replay(from)
	}

	function jump(pose: CameraPose): void {
		goal.value = clampPose(pose, framing.value.frame)
		tween.replay(goal.value)
		show(goal.value)
	}

	function next(): CameraPose {
		return tween.isRunning.value ? goal.value : current()
	}

	function sync(): void {
		lastPose = current()
		zoom.value = lastPose[5]
	}

	watch(tween.value, show)

	return { tween, zoom, controls, current, next, sync, goTo, jump, lastPose: () => lastPose }
}

function useOrbitControls(options: CameraOptions, state: CameraPoseState, framing: ComputedRef<SceneFraming>): void {
	function stop(): void {
		state.controls.value?.dispose()
		state.controls.value = null
	}

	function start(canvas: HTMLCanvasElement): void {
		const pose = state.lastPose() ?? homePose(options, framing.value)
		stop()
		const controls = createControls(options, canvas, framing.value)
		controls.addEventListener('start', () => state.tween.stop())
		controls.addEventListener('change', () => {
			limitPan(controls, framing.value.frame)
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

	watch(framing, value => {
		const controls = state.controls.value
		if (controls) Object.assign(controls, distanceLimits(options, value))
	})

	watch(options.getHasOrbit, value => {
		const controls = state.controls.value
		if (!controls) return
		controls.enableRotate = value
		setTouchAction(controls.domElement as HTMLElement, value)
	})

	onBeforeUnmount(stop)
}

function turn(pose: CameraPose, index: 3 | 4, degrees: number): CameraPose {
	return pose.map((value, position) => (position === index ? value + MathUtils.degToRad(degrees) : value)) as CameraPose
}

function zoomBy(pose: CameraPose, factor: number): CameraPose {
	return [pose[0], pose[1], pose[2], pose[3], pose[4], pose[5] * factor]
}

function wheelFactor(event: WheelEvent): number {
	const scale = [1, WHEEL_LINE, WHEEL_PAGE][event.deltaMode] ?? 1
	return MathUtils.clamp(Math.exp(-event.deltaY * scale * WHEEL_SPEED), 1 / ZOOM_STEP, ZOOM_STEP)
}

export function useCameraController(options: CameraOptions) {
	const framing = computed((): SceneFraming => ({ frame: sceneFrame(options.getData()), mode: options.getLayerMode() }))
	const state = useCameraPose(options, framing)
	useOrbitControls(options, state, framing)

	watch(options.getData, () => state.jump(homePose(options, framing.value)))
	watch(options.getLayerMode, () => state.goTo(homePose(options, framing.value)))
	watch(options.getLayerId, () => {
		const pose = state.next()
		const y = pose[5] > FOLLOW_ZOOM ? floorY(options) : homePose(options, framing.value)[1]
		state.goTo([pose[0], y, pose[2], pose[3], pose[4], pose[5]])
	})

	const rotate = (degrees: number) => state.goTo(turn(state.next(), 3, degrees))

	return {
		resetCamera: () => state.goTo(homePose(options, framing.value)),
		rotate,
		rotateLeft: () => rotate(-ROTATE_STEP),
		rotateRight: () => rotate(ROTATE_STEP),
		tilt: (degrees: number) => state.goTo(turn(state.next(), 4, degrees)),
		zoomIn: () => state.goTo(zoomBy(state.next(), ZOOM_STEP)),
		zoomOut: () => state.goTo(zoomBy(state.next(), 1 / ZOOM_STEP)),
		zoomToObject: (id: string) => {
			const box = options.getObjectBox(id)
			if (box)
				state.goTo(
					objectPose(box, state.next(), visibleHalf(options.camera.value, baseDistance(options.camera.value, framing.value))),
				)
		},
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
