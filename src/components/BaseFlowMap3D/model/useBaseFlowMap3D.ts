import { useFlowMap3DStage } from './useFlowMap3DStage'
import { loadEditUi } from '../ui/lazy/flowMap3dLazyLoaders'
import { useFlowMap3DSettings } from './ui/useFlowMap3DDock'
import { useFlowMap3DParts } from './view/useFlowMap3DParts'
import { useFlowMap3DCore } from './compose/useFlowMap3DCore'
import { useFlowMap3DInput } from './compose/useFlowMap3DInput'
import { useFlowMap3DShell } from './compose/useFlowMap3DShell'
import { useScene3DModels } from '@/scene3d/models/useModels3D'
import { FLOW_MAP_3D_PARTS } from '../types/BaseFlowMap3D.types'
import { useFlowMap3DSnapshot } from './data/useFlowMap3DSnapshot'
import { useFlowMap3DBindings } from './view/useFlowMap3DBindings'
import { useFlowMap3DTemplate } from './compose/useFlowMap3DTemplate'
import { useFlowMap3DEditLoader } from './edit/useFlowMap3DEditLoader'
import { onBeforeUnmount, ref, shallowRef, useTemplateRef } from 'vue'
import { SCENE_3D_CAMERA_PRESETS } from '@/scene3d/types/scene3d.types'
import type { Scene3DCameraPreset } from '@/scene3d/types/scene3d.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseFlowMap3DEmits, FlowMap3DProps } from '../types/BaseFlowMap3D.types'
import type { FlowMap3DComposeParts, FlowMap3DInput, FlowMap3DRefs } from '../types/internal/flowMap3dCompose.types'

function isPreset(value: string): value is Scene3DCameraPreset {
	return (SCENE_3D_CAMERA_PRESETS as readonly string[]).includes(value)
}

function useRefs(): FlowMap3DRefs {
	return {
		rootRef: useTemplateRef<HTMLElement>('rootRef'),
		viewportRef: useTemplateRef<HTMLElement>('viewportRef'),
		canvasRef: useTemplateRef<HTMLCanvasElement>('canvasRef'),
		labelsRef: useTemplateRef<HTMLElement>('labelsRef'),
	}
}

function useParts(props: FlowMap3DProps, emit: BaseFlowMap3DEmits): FlowMap3DComposeParts {
	const refs = useRefs()
	const core = useFlowMap3DCore(props, emit, refs.rootRef)
	return {
		props,
		emit,
		core,
		refs,
		settings: useFlowMap3DSettings(props, emit, core.model),
		hovered: ref(null),
		focused: ref(null),
		appModels: useScene3DModels(),
	}
}

function useStage(
	parts: FlowMap3DComposeParts,
	snapshot: ReturnType<typeof useFlowMap3DSnapshot>,
	input: { value: FlowMap3DInput | null },
) {
	const { props, emit, core, settings, refs } = parts
	return useFlowMap3DStage({
		props,
		model: core.model,
		snapshot,
		canvasRef: refs.canvasRef,
		hostRef: refs.viewportRef,
		labelsRef: refs.labelsRef,
		preset: settings.preset,
		hovered: parts.hovered,
		focused: parts.focused,
		getQuality: settings.getQuality,
		getParticleCount: settings.getParticleCount,
		getHasParticles: () => settings.hasParticles.value && core.motion.canParticles.value,
		getHasLayers: () => Boolean(props.hasLayersToggle),
		getBlendDuration: core.motion.blendMs,
		isReducedMotion: () => core.isReducedMotion.value,
		onError: () => (core.view.fallback.hasRenderError.value = true),
		onPreset: preset => emit('update:camera', preset),
		onFocus: id => input.value?.focus.move(id),
	})
}

export function useBaseFlowMap3D(props: FlowMap3DProps, emit: BaseFlowMap3DEmits) {
	const base = useStandardBaseComponent('base-flow-map-3d', props, [...FLOW_MAP_3D_PARTS])
	const parts = useParts(props, emit)
	const { core, settings } = parts
	const snapshot = useFlowMap3DSnapshot(core.model, () => settings.isLayered.value)
	const input = shallowRef<FlowMap3DInput | null>(null)
	const stage = useStage(parts, snapshot, input)
	input.value = useFlowMap3DInput(parts, stage)
	onBeforeUnmount(() => input.value?.keyboard.stop())
	const shell = useFlowMap3DShell(parts, stage, input.value)
	const template = useFlowMap3DTemplate(parts, stage, { snapshot, classes: base.classes })
	const editor = useFlowMap3DEditLoader({
		parts,
		stage: { ...stage, snapshot },
		input: input.value,
		ui: template.ui,
		preload: loadEditUi,
	})
	const { edit, panels: editPanels } = editor

	return {
		...base,
		...useFlowMap3DParts(),
		...template,
		...input.value.pointer,
		onClick: (event: MouseEvent) => edit.value.guardClick(input.value!.pointer.onClick)(event),
		edit,
		editPanels,
		isEditLoaded: editor.isLoaded,
		modelInfo: (id: string) => ({ key: edit.value.palette.keyOf(id), title: edit.value.palette.titleOf(id) }),
		rectOf: (id: string) => core.model.layout.value.nodes[id],
		controller: shell.controller,
		camera: stage.camera,
		settings,
		onKeydown: (event: KeyboardEvent) => {
			if (!edit.value.onKeydown(event)) input.value?.keyboard.onKeydown(event)
		},
		listGroups: input.value.list.groups,
		chooseNode: input.value.list.choose,
		onFocusOut: () => (parts.focused.value = null),
		shownView: core.view.shownView,
		isEditIn2D: core.view.isEditIn2D,
		setView: core.view.setView,
		setMode: core.view.setMode,
		isCompact: core.state.isCompact,
		announcement: core.announcement,
		twoDBindings: useFlowMap3DBindings({ props, emit, model: core.model, view: core.view, track: shell.transition.track }),
		setCamera: (preset: string) => {
			if (!isPreset(preset)) return
			stage.camera.setPreset(preset)
			emit('update:camera', preset)
		},
	}
}
