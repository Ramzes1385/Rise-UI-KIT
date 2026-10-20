import { useFlowMap3DUi } from '../ui/useFlowMap3DUi'
import { computed, onMounted, useId, watch } from 'vue'
import { useFlowMap3DDock } from '../ui/useFlowMap3DDock'
import { useFlowMap3DTags } from '../interaction/useFlowMap3DTags'
import { UI_FLOW_MAP, UI_FLOW_MAP_3D, UI_SCENE_3D } from '@/locales/messages'
import type { FlowMap3DComposeParts, FlowMap3DStage, FlowMap3DTemplateExtras } from '../../types/internal/flowMap3dCompose.types'

function useStatus(parts: FlowMap3DComposeParts, stage: FlowMap3DStage) {
	const { props, core } = parts
	const status = computed(() => {
		if (core.view.shownView.value === '2d') return null
		if (props.error) return { kind: 'error', text: props.error }
		if (props.isLoading) return { kind: 'loading', text: UI_FLOW_MAP.LOADING }
		if (core.model.data.value.nodes.length === 0) return { kind: 'empty', text: UI_FLOW_MAP.EMPTY }
		return stage.scene.content.value ? null : { kind: 'loading', text: UI_FLOW_MAP_3D.BUILDING }
	})
	const say = (text: string | undefined) => text && core.announce(text)
	onMounted(() => say(status.value?.text))
	watch(() => status.value?.text, say)
	return status
}

export function useFlowMap3DTemplate(parts: FlowMap3DComposeParts, stage: FlowMap3DStage, extras: FlowMap3DTemplateExtras) {
	const { snapshot, classes } = extras
	const { props, core, settings } = parts
	const { view, model } = core
	const ui = useFlowMap3DUi(props)
	const className = (part: 'dock' | 'zoom') => [ui(part), classes.value[part]].filter(Boolean).join(' ')
	return {
		ui,
		dock: useFlowMap3DDock(props, {
			className: () => className('dock'),
			shownView: () => view.targetView.value,
			isSupported: () => view.fallback.isSupported.value,
			isNarrow: () => core.state.isNarrow.value,
			isEditing: () => core.view.isEditIn3D.value,
			hasParticles: () => settings.hasParticles.value,
			isLayered: () => settings.isLayered.value,
			preset: () => settings.preset.value,
		}),
		zoomProps: computed(() => ({
			className: className('zoom'),
			isMax: stage.camera.isMaxZoom.value,
			isMin: stage.camera.isMinZoom.value,
		})),
		status: useStatus(parts, stage),
		statusText: computed(() => view.fallback.statusText.value),
		hasCanvas: computed(() => (view.shownView.value === '3d' || view.isFading.value) && view.fallback.isSupported.value === true),
		isFading: view.isFading,
		flags: stage.flags,
		tags: useFlowMap3DTags({ model, snapshot, states: stage.states }),
		label: computed(() => props.ariaLabel ?? model.data.value.title ?? UI_FLOW_MAP.DEFAULT_LABEL),
		hintId: `${useId()}-hint`,
		keyboardHint: `${UI_SCENE_3D.KEYBOARD_HINT}. ${UI_FLOW_MAP_3D.KEYBOARD_HINT_FLOW}`,
	}
}
