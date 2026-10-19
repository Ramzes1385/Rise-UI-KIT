import { computed, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { getFlowEditing } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { useFlowMapContext } from '../../context/flowContext'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'

function statusIssues(model: FlowModelInternal) {
	return {
		issues: computed(() =>
			model.issues.value.map((issue, index) => ({
				key: `${issue.code}-${index}`,
				message: issue.message,
				badge: issue.level === 'error' ? UI_FLOW_EDITOR.ISSUE_ERROR : UI_FLOW_EDITOR.ISSUE_WARNING,
				type: issue.level === 'error' ? ('error' as const) : ('warning' as const),
				target: issue.target?.id,
			})),
		),
		title: computed(() => formatMessage(UI_FLOW_EDITOR.ISSUES_TITLE, { notation: model.notation.value.label() })),
		rules: computed(() => {
			const text = model.notation.value.rulesSummary?.()
			return text ? formatMessage(UI_FLOW_EDITOR.ISSUES_RULES, { rules: text }) : ''
		}),
	}
}

export function useFlowEditStatus() {
	const { model } = useFlowMapContext()
	const editing = getFlowEditing(model)
	const { state } = editing.context.env
	const isOpen = ref(false)
	const savedAt = computed(() => {
		const value = editing.savedAt()
		return value === undefined ? null : new Date(value)
	})
	const changes = computed(() => {
		void model.history.state.value
		const from = savedAt.value?.getTime() ?? 0
		return model.history.list().filter(item => !item.isUndone && item.time > from).length
	})
	const issues = computed(() => model.issues.value)
	return {
		isVisible: computed(() => state.isEditing.value && !state.isCompact.value),
		isOpen,
		selected: computed(() => formatMessage(UI_FLOW_EDITOR.STATUS_SELECTED, { count: model.selection.value.length })),
		changes: computed(() => formatMessage(UI_FLOW_EDITOR.STATUS_CHANGES, { count: changes.value })),
		saved: computed(() =>
			savedAt.value
				? formatMessage(UI_FLOW_EDITOR.STATUS_SAVED, { time: savedAt.value.toLocaleTimeString() })
				: UI_FLOW_EDITOR.STATUS_UNSAVED,
		),
		counts: computed(() =>
			formatMessage(UI_FLOW_EDITOR.STATUS_COUNTS, { nodes: model.data.value.nodes.length, edges: model.data.value.edges.length }),
		),
		summary: computed(() =>
			issues.value.length === 0
				? UI_FLOW_EDITOR.STATUS_ISSUES_OK
				: formatMessage(UI_FLOW_EDITOR.STATUS_ISSUES, { count: issues.value.length }),
		),
		hasIssues: computed(() => issues.value.length > 0),
		...statusIssues(editing.context.env.model),
		ok: UI_FLOW_EDITOR.ISSUES_OK,
		show: UI_FLOW_EDITOR.ISSUE_SHOW,
		region: UI_FLOW_EDITOR.STATUS,
		issuesRegion: UI_FLOW_EDITOR.ISSUES_REGION,
		focus: (id: string) => model.controller.focus(id, { isZoomed: true, isAnimated: true }),
	}
}
