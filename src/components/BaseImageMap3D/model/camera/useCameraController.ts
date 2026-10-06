import { MathUtils } from 'three'
import { ROTATE_STEP } from './cameraKeys'
import { useTween } from '@composables/interaction/useTween'
import { sceneCenter, sceneExtent } from '../scene/sceneCamera'
import { layerElevation, sceneSettings } from '../scene/sceneLayout'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { CameraOptions, CameraPose, CameraPoseState } from '../../types/internal/imageMap3dInternal.types'
import { CAMERA_LIMITS, applyPose, baseDistance, clampPose, defaultPose, easeInOutCubic, objectPose, readPose } from './cameraPose'

const ZOOM_STEP = 1.5
const WHEEL_SPEED = 0.004
const WHEEL_LINE = 16
const WHEEL_PAGE = 400

function homePose(options: CameraOptions): CameraPose {
	const data = options.getData()
	const index = Math.max(
		data.layers.findIndex(layer => layer.id === options.getLayerId()),
		0,
	)
	const layer = data.layers[index]
	const center = sceneCenter(data)
	center.y = layer ? layerElevation(layer, index, sceneSettings(data)) : 0
	return defaultPose(center)
}

function setTouchAction(canvas: HTMLElement, hasOrbit: boolean): void {
	canvas.style.touchAction = hasOrbit ? 'none' : 'pan-x pan-y'
}

function createControls(options: CameraOptions, canvas: HTMLCanvasElement): OrbitControls {
	const controls = new OrbitControls(options.camera.value, canvas)
	const distance = baseDistance(options.camera.value, sceneExtent(options.getData()))
	Object.assign(controls, {
		enableDamping: false,
		screenSpacePanning: false,
		minPolarAngle: CAMERA_LIMITS.minPolar,
		maxPolarAngle: CAMERA_LIMITS.maxPolar,
		minZoom: CAMERA_LIMITS.minZoom,
		maxZoom: CAMERA_LIMITS.maxZoom,
		minDistance: distance / CAMERA_LIMITS.maxZoom,
		maxDistance: distance / CAMERA_LIMITS.minZoom,
		enableRotate: options.getHasOrbit(),
		enableZoom: false,
	})
	setTouchAction(canvas, options.getHasOrbit())
	return controls
}

function useCameraPose(options: CameraOptions): CameraPoseState {
	const goal = shallowRef<CameraPose>(homePose(options))
	const tween = useTween(goal, { duration: 'xslow', easing: easeInOutCubic, target: options.canvasRef })
	const zoom = ref(1)
	const controls = shallowRef<OrbitControls | null>(null)
	let lastPose: CameraPose | null = null

	const distance = () => baseDistance(options.camera.value, sceneExtent(options.getData()))

	function show(pose: CameraPose): void {
		const target = applyPose(options.camera.value, pose, distance())
		lastPose = pose
		zoom.value = pose[5]
		controls.value?.target.copy(target)
		options.invalidate()
	}

	function current(): CameraPose {
		const target = controls.value?.target
		return target ? readPose(options.camera.value, target, distance()) : (lastPose ?? homePose(options))
	}

	function goTo(pose: CameraPose): void {
		const from = current()
		goal.value = clampPose(pose)
		tween.replay(from)
	}

	function jump(pose: CameraPose): void {
		goal.value = clampPose(pose)
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

function useOrbitControls(options: CameraOptions, state: CameraPoseState): void {
	function stop(): void {
		state.controls.value?.dispose()
		state.controls.value = null
	}

	function start(canvas: HTMLCanvasElement): void {
		const pose = state.lastPose() ?? homePose(options)
		stop()
		const controls = createControls(options, canvas)
		controls.addEventListener('start', () => state.tween.stop())
		controls.addEventListener('change', () => {
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
	const state = useCameraPose(options)
	useOrbitControls(options, state)

	watch(options.getData, () => state.jump(homePose(options)))
	watch(options.getLayerId, () => {
		const pose = state.next()
		state.goTo([pose[0], homePose(options)[1], pose[2], pose[3], pose[4], pose[5]])
	})

	const rotate = (degrees: number) => state.goTo(turn(state.next(), 3, degrees))

	return {
		resetCamera: () => state.goTo(homePose(options)),
		rotate,
		rotateLeft: () => rotate(-ROTATE_STEP),
		rotateRight: () => rotate(ROTATE_STEP),
		tilt: (degrees: number) => state.goTo(turn(state.next(), 4, degrees)),
		zoomIn: () => state.goTo(zoomBy(state.next(), ZOOM_STEP)),
		zoomOut: () => state.goTo(zoomBy(state.next(), 1 / ZOOM_STEP)),
		zoomToObject: (id: string) => {
			const box = options.getObjectBox(id)
			if (box) state.goTo(objectPose(box, state.next(), sceneExtent(options.getData())))
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
