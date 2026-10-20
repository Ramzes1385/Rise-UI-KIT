import { buildTags } from './data/roadmap3dTags'
import { detailOf } from './scene/useRoadmap3DScene'
import { useRoadmap3DStage } from './useRoadmap3DStage'
import { useRoadmapTour } from './motion/useRoadmapTour'
import { useRoadmap3DTwoD } from './view/useRoadmap3DTwoD'
import { useRoadmap3DParts } from './view/useRoadmap3DParts'
import { useRoadmap3DCore } from './compose/useRoadmap3DCore'
import { useRoadmap3DEdit } from './compose/useRoadmap3DEdit'
import { useRoadmap3DFocus } from './motion/useRoadmap3DFocus'
import { ROADMAP_3D_PARTS } from '../types/BaseRoadmap3D.types'
import { useRoadmap3DInput } from './compose/useRoadmap3DInput'
import { useRoadmap3DPanel } from './compose/useRoadmap3DPanel'
import { computed, ref, shallowRef, useTemplateRef } from 'vue'
import { useRoadmap3DSnapshot } from './data/useRoadmap3DSnapshot'
import { useRoadmap3DTemplate } from './compose/useRoadmap3DTemplate'
import type { Scene3DCameraPreset } from '@/scene3d/types/scene3d.types'
import { presetOf, useRoadmap3DShell } from './compose/useRoadmap3DShell'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseRoadmap3DEmits, Roadmap3DProps } from '../types/BaseRoadmap3D.types'
import type { Roadmap3DCameraApi, Roadmap3DStageApi } from '../types/internal/roadmap3dCompose.types'

function useRefs() {
	return {
		rootRef: useTemplateRef<HTMLElement>('rootRef'),
		viewportRef: useTemplateRef<HTMLElement>('viewportRef'),
		canvasRef: useTemplateRef<HTMLCanvasElement>('canvasRef'),
		labelsRef: useTemplateRef<HTMLElement>('labelsRef'),
	}
}

function useFocusState(props: Roadmap3DProps, emit: BaseRoadmap3DEmits, core: ReturnType<typeof useRoadmap3DCore>) {
	const { model } = core
	const snapshot = useRoadmap3DSnapshot({ data: model.data, stageViews: model.stageViews })
	const preset = ref<Scene3DCameraPreset>(presetOf(props.camera ?? model.data.value.view3d?.camera))
	const cameraRef = shallowRef<Roadmap3DCameraApi | null>(null)
	const focus = useRoadmap3DFocus({ props, emit, snapshot, getCamera: () => cameraRef.value, announce: core.announce })
	const states = computed(() => ({
		hover: focus.hovered.value,
		focus: focus.focused.value,
		selected: model.selectedId.value,
		currentId: model.statuses.value.currentStageId,
	}))
	const tags = computed(() => buildTags(snapshot.value, states.value, focus.cursor.value))
	return { snapshot, preset, cameraRef, focus, states, tags }
}

function useTour(emit: BaseRoadmap3DEmits, props: Roadmap3DProps, state: ReturnType<typeof useFocusState>) {
	const { snapshot, focus } = state
	return useRoadmapTour({
		getRequested: () => props.isTourPlaying,
		getCount: () => snapshot.value.stages.length,
		getFocusedIndex: () => focus.indexOf(focus.focused.value),
		focusAt: index => focus.focusStage(snapshot.value.stages[index]!.id),
		onChange: isPlaying => emit('update:isTourPlaying', isPlaying),
	})
}

function useStage(context: {
	props: Roadmap3DProps
	emit: BaseRoadmap3DEmits
	core: ReturnType<typeof useRoadmap3DCore>
	state: ReturnType<typeof useFocusState>
	refs: ReturnType<typeof useRefs>
}): Roadmap3DStageApi {
	const { props, emit, core, state, refs } = context
	const stage = useRoadmap3DStage({
		props,
		snapshot: state.snapshot,
		tags: state.tags,
		preset: state.preset,
		canvasRef: refs.canvasRef,
		hostRef: refs.viewportRef,
		labelsRef: refs.labelsRef,
		getStates: () => state.states.value,
		getDetail: () => detailOf({ quality: props.quality, isCompact: core.isCompact.value }),
		getDuration: () => core.motion.duration('xslow'),
		isReducedMotion: () => core.isReducedMotion.value,
		onError: () => (core.view.fallback.hasRenderError.value = true),
		onPreset: next => emit('update:camera', next),
		onFocus: id => state.focus.focusStage(id),
	})
	state.cameraRef.value = stage.camera
	return stage
}

export function useBaseRoadmap3D(props: Roadmap3DProps, emit: BaseRoadmap3DEmits) {
	const base = useStandardBaseComponent('base-roadmap-3d', props, [...ROADMAP_3D_PARTS])
	const refs = useRefs()
	const core = useRoadmap3DCore(props, emit, refs.rootRef)
	const { model, view } = core
	const state = useFocusState(props, emit, core)
	const { snapshot, focus, preset, tags } = state
	const stage = useStage({ props, emit, core, state, refs })
	const tour = useTour(emit, props, state)
	const edit = useRoadmap3DEdit({ model, snapshot, announce: core.announce, focusStage: focus.focusStage })
	const panel = useRoadmap3DPanel({ model, snapshot, focus })
	const parts = { props, emit, model, view, snapshot, focus, tour, edit, panel, preset, hostRef: refs.viewportRef }
	const input = useRoadmap3DInput(parts, stage)
	const expose = useRoadmap3DShell(parts, stage)
	const template = useRoadmap3DTemplate(parts, stage)

	return {
		...base,
		...template,
		...useRoadmap3DParts(),
		twoD: useRoadmap3DTwoD({ props, emit, model, getLabel: () => template.label.value }),
		...input.pointer,
		...input.keyboard,
		...input.swipe,
		expose,
		model,
		tags,
		panel,
		edit,
		tour,
		focus,
		camera: stage.camera,
		preset,
		listStages: input.list,
		shownView: view.shownView,
		statusText: view.fallback.statusText,
		setView: view.setView,
		isCompact: core.isCompact,
		isEditing: model.isEditing,
		announcement: core.announcement,
		onFocusOut: () => (focus.cursor.value = focus.focused.value),
	}
}
