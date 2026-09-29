import { UI_AI } from '@/locales/messages'
import { computed, ref, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseToolCallEmits, BaseToolCallProps, ToolCallStatus } from '../types/BaseToolCall.types'

const STATUS_ICONS = {
	pending: 'dots-horizontal',
	running: 'dots-horizontal',
	success: 'check-circle',
	error: 'x-circle',
} as const

const statusLabel = (status: ToolCallStatus): string =>
	({
		pending: UI_AI.TOOL_PENDING,
		running: UI_AI.TOOL_RUNNING,
		success: UI_AI.TOOL_SUCCESS,
		error: UI_AI.TOOL_ERROR,
	})[status]

export function formatToolValue(value: unknown): string | null {
	if (value === undefined) return null
	if (typeof value === 'string') return value
	try {
		return JSON.stringify(value, null, 2) ?? String(value)
	} catch {
		return String(value)
	}
}

function useToolCallOpen(props: BaseToolCallProps, emit: BaseToolCallEmits) {
	const isOpenLocal = ref(Boolean(props.isOpen))
	watch(
		() => props.isOpen,
		isOpen => {
			isOpenLocal.value = Boolean(isOpen)
		},
	)
	return {
		isOpenLocal,
		toggle(): void {
			isOpenLocal.value = !isOpenLocal.value
			emit('update:isOpen', isOpenLocal.value)
		},
	}
}

export function useBaseToolCall(props: BaseToolCallProps, emit: BaseToolCallEmits) {
	const status = computed<ToolCallStatus>(() => props.status ?? 'pending')
	return {
		...useStandardBaseComponent('base-tool-call', props, ['root', 'trigger', 'content']),
		...useToolCallOpen(props, emit),
		contentId: `rise-tool-call-${useId()}`,
		statusIcon: computed(() => STATUS_ICONS[status.value]),
		statusText: computed(() => statusLabel(status.value)),
		argsText: computed(() => formatToolValue(props.args)),
		resultText: computed(() => formatToolValue(props.result)),
	}
}
