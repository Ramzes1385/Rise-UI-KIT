import { MathUtils } from 'three'
import { useTween } from '@composables/interaction/useTween'
import { sceneCenter, sceneExtent } from '../scene/sceneCamera'
import { layerElevation, sceneSettings } from '../scene/sceneLayout'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { CameraOptions, CameraPose, CameraPoseState } from '../../types/internal/imageMap3dInternal.types'
import { CAMERA_LIMITS, applyPose, baseDistance, clampPose, defaultPose, easeInOutCubic, objectPose, readPose } from './cameraPose'

const ZOOM_STEP = 1.5

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
	})
	return controls
}

function useCameraPose(options: CameraOptions): CameraPoseState {
	const goal = shallowRef<CameraPose>(homePose(options))
	const tween = useTween(goal, { duration: 'xslow', easing: easeInOutCubic })
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

	function sync(): void {
		lastPose = current()
		zoom.value = lastPose[5]
	}

	watch(tween.value, show)

	return { tween, zoom, controls, current, sync, goTo, jump, lastPose: () => lastPose }
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
		if (state.controls.value) state.controls.value.enableRotate = value
	})

	onBeforeUnmount(stop)
}

function turn(pose: CameraPose, index: 3 | 4, degrees: number): CameraPose {
	return pose.map((value, position) => (position === index ? value + MathUtils.degToRad(degrees) : value)) as CameraPose
}

function zoomBy(pose: CameraPose, factor: number): CameraPose {
	return [pose[0], pose[1], pose[2], pose[3], pose[4], pose[5] * factor]
}

export function useCameraController(options: CameraOptions) {
	const state = useCameraPose(options)
	useOrbitControls(options, state)

	watch(options.getData, () => state.jump(homePose(options)))
	watch(options.getLayerId, () => {
		const pose = state.current()
		state.goTo([pose[0], homePose(options)[1], pose[2], pose[3], pose[4], pose[5]])
	})

	return {
		resetCamera: () => state.goTo(homePose(options)),
		rotate: (degrees: number) => state.goTo(turn(state.current(), 3, degrees)),
		tilt: (degrees: number) => state.goTo(turn(state.current(), 4, degrees)),
		zoomIn: () => state.goTo(zoomBy(state.current(), ZOOM_STEP)),
		zoomOut: () => state.goTo(zoomBy(state.current(), 1 / ZOOM_STEP)),
		zoomToObject: (id: string) => {
			const box = options.getObjectBox(id)
			if (box) state.goTo(objectPose(box, state.current(), sceneExtent(options.getData())))
		},
		allowWheelZoom: (isAllowed: boolean) => {
			const controls = state.controls.value
			if (controls) controls.enableZoom = isAllowed
			queueMicrotask(() => {
				if (controls) controls.enableZoom = true
			})
		},
		isMaxZoom: computed(() => state.zoom.value >= CAMERA_LIMITS.maxZoom - 1e-6),
		isMinZoom: computed(() => state.zoom.value <= CAMERA_LIMITS.minZoom + 1e-6),
	}
}
