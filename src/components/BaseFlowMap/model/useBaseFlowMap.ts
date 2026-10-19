import { useFlowModel } from './useFlowModel'
import { UI_FLOW_MAP } from '@/locales/messages'
import { readListeners } from './state/flowListeners'
import { useFlowRendering } from './useFlowRendering'
import { useFlowEditing } from './edit/useFlowEditing'
import { useFlowReview } from './review/useFlowReview'
import { useFlowFrame } from './viewport/useFlowFrame'
import { useFlowAnnouncer } from './a11y/useFlowAnnouncer'
import { FLOW_MAP_PARTS } from '../types/BaseFlowMap.types'
import { computed, getCurrentInstance, onMounted } from 'vue'
import { useFlowVisibility } from './viewport/useFlowVisibility'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import type { FlowEmit } from '../types/internal/core/flowModelCore.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseFlowMapEmits, BaseFlowMapProps } from '../types/BaseFlowMap.types'

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
	})
	const rendering = useFlowRendering(props, model, { frame, environment: { isReducedMotion, isVisible, announce } })
	onMounted(() => model.events.emit('ready', model.controller))
	const editing = useFlowEditing(model, { map: rendering.canvas.map, element: frame.element, props })
	const { hasHeader, hasSearch, hasScenario, isEmpty } = rendering.chrome
	const { state } = editing.context.env
	// В «Правке» (мокап FlowEditor) нет легенды и мини-карты: их закрыли бы панель инструментов и строка состояния
	const isEditChrome = computed(() => state.isEditing.value && !state.isCompact.value)
	const hasMinimap = computed(() => rendering.chrome.hasMinimap.value && !isEditChrome.value)
	const hasLegend = computed(() => rendering.chrome.hasLegend.value && !isEditChrome.value)
	const hasToolbar = computed(() => rendering.chrome.hasToolbar.value && !(state.isEditing.value && !state.isCompact.value))
	const hasDetails = computed(() => rendering.chrome.hasDetails.value && !state.isEditing.value)
	return {
		...useStandardBaseComponent('base-flow-map', props, [...FLOW_MAP_PARTS]),
		...{ hasHeader, hasToolbar, hasSearch, hasMinimap, hasLegend, hasScenario, hasDetails, isEmpty },
		ui: rendering.ui,
		model,
		editing,
		editClasses: computed(() => {
			const isChrome = state.isEditing.value && !state.isCompact.value
			return [isChrome && 'base-flow-map__stage--edit', isChrome && !state.isGridOn.value && 'base-flow-map__stage--no-grid']
		}),
		review: useFlowReview(model, props, announce),
		announcement,
		isCompact: frame.isCompact,
		isMorphing: model.groups.isMorphing,
		label: computed(() => props.ariaLabel ?? model.data.value.title ?? UI_FLOW_MAP.DEFAULT_LABEL),
		rootStyle: computed(() => ({ height: props.height })),
	}
}
