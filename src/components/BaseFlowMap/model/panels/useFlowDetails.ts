import type { Ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_PANELS } from '@/locales/messages'
import { useFlowMapContext } from '../context/flowContext'
import { computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { buildDetails, panelsSource, sheetViewport } from './detailsView'
import type { FlowMapContext } from '../../types/internal/flowModel.types'

const HISTORY_FLAG = 'riseFlowDetails'

function useBackClose(isOpen: Ref<boolean>, close: () => void) {
	let isPushed = false

	function onPop(): void {
		isPushed = false
		close()
	}

	function leave(): void {
		window.removeEventListener('popstate', onPop)
		if (!isPushed) return
		isPushed = false
		if (window.history.state?.[HISTORY_FLAG]) window.history.back()
	}

	watch(isOpen, open => {
		if (!open) return leave()
		window.history.pushState({ [HISTORY_FLAG]: true }, '')
		isPushed = true
		window.addEventListener('popstate', onPop)
	})
	onBeforeUnmount(() => window.removeEventListener('popstate', onPop))
}

function useFocusReturn(context: FlowMapContext) {
	let trigger: HTMLElement | null = null

	watch(
		() => context.details.value,
		(next, previous) => {
			if (next && !previous) trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
			if (!next && previous) void nextTick(() => trigger?.isConnected && trigger.focus())
		},
	)
}

function useSheetShift(context: FlowMapContext, isSheetOpen: Ref<boolean>) {
	watch([isSheetOpen, () => context.details.value?.id], ([isOpen, id]) => {
		const rect = isOpen && id ? context.model.layout.value.nodes[id] : undefined
		if (rect) context.setViewport(sheetViewport(rect, context.viewport.value, context.frame.value), { isAnimated: true })
	})
}

export function useFlowDetails() {
	const context = useFlowMapContext()
	const view = computed(() => (context.details.value ? buildDetails(context.details.value, panelsSource(context)) : null))
	const isCompact = context.isCompact
	const isSheetOpen = computed(() => isCompact.value && view.value !== null)

	function close(): void {
		context.openDetails(null)
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || event.defaultPrevented) return
		event.preventDefault()
		close()
	}

	useFocusReturn(context)
	useSheetShift(context, isSheetOpen)
	useBackClose(isSheetOpen, close)

	const labels = computed(() => ({
		title: { node: UI_FLOW_PANELS.DETAILS_NODE, edge: UI_FLOW_PANELS.DETAILS_EDGE, group: UI_FLOW_PANELS.DETAILS_GROUP }[
			view.value?.entity ?? 'node'
		],
		close: UI_FLOW_PANELS.DETAILS_CLOSE,
		calls: UI_FLOW_PANELS.DETAILS_CALLS,
		calledBy: UI_FLOW_PANELS.DETAILS_CALLED_BY,
		metrics: UI_FLOW_PANELS.DETAILS_METRICS,
		team: view.value?.owner ? formatMessage(UI_FLOW_PANELS.DETAILS_TEAM, { name: view.value.owner.name }) : '',
	}))

	function onSheetChange(): void {
		close()
	}

	return { view, isCompact, isSheetOpen, labels, close, onKeydown, onSheetChange }
}
