import { useFlowModel } from './useFlowModel'
import { UI_FLOW_MAP } from '@/locales/messages'
import { computed, getCurrentInstance } from 'vue'
import { useFlowModes } from './state/useFlowModes'
import { readListeners } from './state/flowListeners'
import { useFlowRendering } from './useFlowRendering'
import { useFlowFrame } from './viewport/useFlowFrame'
import { useFlowAnnouncer } from './a11y/useFlowAnnouncer'
import { FLOW_MAP_PARTS } from '../types/BaseFlowMap.types'
import { useFlowLazyStart } from './state/useFlowLazyStart'
import { useFlowPanels } from './viewport/panels/useFlowPanels'
import { useFlowVisibility } from './viewport/useFlowVisibility'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import type { FlowEmit } from '../types/internal/core/flowModelCore.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseFlowMapEmits, BaseFlowMapProps } from '../types/BaseFlowMap.types'
import { loadEditKernel, loadEditUi, loadReviewUi, loadScenarioUi } from '../ui/lazy/flowLazyLoaders'

export function useBaseFlowMap(props: BaseFlowMapProps, emit: BaseFlowMapEmits) {
	const instance = getCurrentInstance()
	const isReducedMotion = useReducedMotion()
	const frame = useFlowFrame(props)
	const { isVisible } = useFlowVisibility(frame.element)
	const { announcement, announce } = useFlowAnnouncer()
	const model = useFlowModel(props, {
		emit: emit as unknown as FlowEmit,
		listeners: () => readListeners(instance?.vnode.props),
		environment: {
			isVisible: () => isVisible.value,
			isReducedMotion: () => isReducedMotion.value,
			announce,
		},
		isCompact: () => frame.isCompact.value,
		preloadScenario: loadScenarioUi,
	})
	const rendering = useFlowRendering(props, model, { frame, environment: { isReducedMotion, isVisible, announce } })
	const modes = useFlowModes(props, {
		...{ model, props, map: rendering.canvas.map, element: frame.element, announce },
		...{ preload: loadEditUi, preloadLayer: loadEditKernel, preloadReview: loadReviewUi },
	})
	const { hasHeader, hasSearch, hasScenario, isEmpty } = rendering.chrome
	const { hasToolbar, hasMinimap, hasLegend, hasDetails, editClasses } = useFlowPanels(props, {
		chrome: rendering.chrome,
		modes: modes.state,
		frame,
	})
	useFlowLazyStart(props, model, hasDetails)
	return {
		...useStandardBaseComponent('base-flow-map', props, [...FLOW_MAP_PARTS]),
		...{ hasHeader, hasToolbar, hasSearch, hasMinimap, hasLegend, hasScenario, hasDetails, isEmpty },
		ui: rendering.ui,
		model,
		editClasses,
		editing: modes.edit.part,
		review: modes.review.part,
		isEditLoaded: modes.state.isEditLoaded,
		isEditing: modes.state.isEditing,
		isReviewLoaded: modes.state.isReviewLoaded,
		isScenarioLoaded: modes.state.isScenarioLoaded,
		announcement,
		isCompact: frame.isCompact,
		isMorphing: model.groups.isMorphing,
		label: computed(() => props.ariaLabel ?? model.data.value.title ?? UI_FLOW_MAP.DEFAULT_LABEL),
		rootStyle: computed(() => ({ height: props.height })),
	}
}
