import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useFlowMap3DFlights } from './useFlowMap3DFlights'
import { useOrbitCamera } from '@/scene3d/camera/useOrbitCamera'
import type { Scene3DCameraPose } from '@/scene3d/types/internal/scene3dInternal.types'
import type { FlowViewport } from '@components/BaseFlowMap/types/api/flowController.types'
import { nearestIsoPreset, presetPose, quarterTurnPose } from '@/scene3d/camera/cameraPresets'
import { frameCenter, poseOfViewport, sceneFrame, toCameraFraming, viewSpec, viewportOfPose } from './flowMap3dFrame'
import type {
	FlowMap3DCameraApi,
	FlowMap3DCameraOptions,
	FlowMap3DFrame,
	FlowMap3DPreset,
} from '../../types/internal/flowMap3dInternal.types'

function useViewportMapping(
	options: FlowMap3DCameraOptions,
	frame: ComputedRef<FlowMap3DFrame>,
	state: ReturnType<typeof useOrbitCamera>['state'],
) {
	const spec = () =>
		viewSpec(options.camera.value, toCameraFraming(frame.value), {
			size: options.getSize(),
			unit: options.snapshot.value.unit,
			origin: options.snapshot.value.origin,
		})
	return {
		viewport: () => viewportOfPose(state.next(), spec()),
		setViewport(viewport: FlowViewport, parts?: { isAnimated?: boolean }): void {
			const pose: Scene3DCameraPose = poseOfViewport(viewport, state.next(), spec())
			if (parts?.isAnimated) state.goTo(pose)
			else state.jump(pose)
		},
	}
}

function poseAccess(state: ReturnType<typeof useOrbitCamera>['state']) {
	return {
		azimuth: () => state.next()[3],
		setOrbit: (isEnabled: boolean): void => {
			if (state.controls.value) state.controls.value.enabled = isEnabled
		},
	}
}

function isIso(preset: FlowMap3DPreset): boolean {
	return preset.startsWith('iso')
}

export function useFlowMap3DCamera(options: FlowMap3DCameraOptions): FlowMap3DCameraApi {
	const frame = computed(() => sceneFrame(options.snapshot.value))
	const center = computed(() => frameCenter(frame.value))
	const orbit = useOrbitCamera({
		camera: options.camera,
		renderer: options.renderer,
		canvasRef: options.canvasRef,
		getFraming: () => toCameraFraming(frame.value),
		getHomePose: () => presetPose(options.preset.value, center.value),
		fitted: options.fitted,
		getHasOrbit: () => true,
		invalidate: options.invalidate,
	})
	const { state } = orbit

	const flights = useFlowMap3DFlights({ state, preset: options.preset, getCenter: () => center.value })

	function rotate(step: 1 | -1): void {
		const pose = quarterTurnPose(state.next(), step)
		state.goTo(pose)
		if (isIso(options.preset.value)) options.onPreset(nearestIsoPreset(pose[3]))
	}

	const mapping = useViewportMapping(options, frame, state)

	function fly(id: string): void {
		const box = options.getBox(id)
		if (box) orbit.zoomToBox(box)
	}

	return {
		...poseAccess(state),
		zoom: state.zoom,
		isMaxZoom: orbit.isMaxZoom,
		isMinZoom: orbit.isMinZoom,
		home: orbit.reset,
		rotate,
		turn: orbit.rotate,
		tilt: orbit.tilt,
		zoomIn: orbit.zoomIn,
		zoomOut: orbit.zoomOut,
		wheelZoom: orbit.wheelZoom,
		pinchZoom: orbit.pinchZoom,
		fly,
		...flights,
		...mapping,
		fit: orbit.reset,
	}
}
