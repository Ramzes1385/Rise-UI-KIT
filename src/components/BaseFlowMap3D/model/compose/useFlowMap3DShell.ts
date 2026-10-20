import { onMounted, watch } from 'vue'
import { warnFlow3d } from '../validate3d'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { createViewAdapter } from '../view/flowMap3dViewAdapter'
import { createFlowMap3DController } from '../flowMap3dController'
import { useViewTransition } from '../motion/view/useViewTransition'
import { useFlowMap3DTransition } from '../view/useFlowMap3DTransition'
import type { FlowMap3DComposeParts, FlowMap3DInput, FlowMap3DStage } from '../../types/internal/flowMap3dCompose.types'

function useAnnouncements(parts: FlowMap3DComposeParts): void {
	const { core, settings } = parts
	watch(core.view.targetView, value => core.announce(value === '3d' ? UI_FLOW_MAP_3D.ANNOUNCE_VIEW_3D : UI_FLOW_MAP_3D.ANNOUNCE_VIEW_2D))
	watch(settings.isLayered, value => core.announce(value ? UI_FLOW_MAP_3D.ANNOUNCE_LAYERS_ON : UI_FLOW_MAP_3D.ANNOUNCE_LAYERS_OFF))
	watch(settings.hasParticles, value =>
		core.announce(value ? UI_FLOW_MAP_3D.ANNOUNCE_PARTICLES_ON : UI_FLOW_MAP_3D.ANNOUNCE_PARTICLES_OFF),
	)
}

function useSync(parts: FlowMap3DComposeParts, stage: FlowMap3DStage): void {
	const { props, core, settings } = parts
	watch(
		() => props.camera,
		value => value && value !== settings.preset.value && stage.camera.setPreset(value),
	)
	watch(stage.viewport.fitted, () => {
		core.state.frame.value = stage.size()
	})
	watch(() => props.data, warnFlow3d, { immediate: true })
}

function captureSource(parts: FlowMap3DComposeParts, stage: FlowMap3DStage) {
	return () => {
		const renderer = stage.viewport.renderer.value
		const host = parts.refs.viewportRef.value
		if (!renderer || !host) return null
		return { host, canvas: renderer.domElement, render: () => renderer.render(stage.viewport.scene, stage.viewport.camera.value) }
	}
}

export function useFlowMap3DShell(parts: FlowMap3DComposeParts, stage: FlowMap3DStage, input: FlowMap3DInput) {
	const { core, settings } = parts
	const { model, view } = core
	const flight = useViewTransition({
		view,
		camera: stage.camera,
		getPreset: () => settings.preset.value,
		getFlightMs: core.motion.flightMs,
		getFadeMs: core.motion.fadeMs,
	})
	const transition = useFlowMap3DTransition({ shownView: view.shownView, camera: stage.camera, onReturn: flight.arrive })
	model.setView(
		createViewAdapter({
			camera: stage.camera,
			getView: () => view.shownView.value,
			getTwoD: () => transition.twoD.value,
			getSize: stage.size,
			focusNode: input.focus.move,
			getCapture: captureSource(parts, stage),
			announce: core.announce,
		}),
	)
	const controller = createFlowMap3DController({
		base: model.controller,
		camera: stage.camera,
		setView: view.setView,
		setLayered: settings.setLayered,
		getContent: () => stage.scene.content.value,
		getContext: stage.scene.getContext,
		flyTo: id => {
			input.focus.move(id)
			stage.camera.fly(id)
		},
	})
	useSync(parts, stage)
	useAnnouncements(parts)
	onMounted(() => model.events.emit('ready', controller))
	return { controller, transition }
}
