import { UI_AI } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { computed, ref, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseReasoningEmits, BaseReasoningProps } from '../types/BaseReasoning.types'

export function formatThinkingTime(seconds: number): string {
	const total = Math.max(1, Math.round(seconds))
	if (total < 60) return formatMessage(UI_AI.SECONDS, { n: total })
	return formatMessage(UI_AI.MINUTES, { m: Math.floor(total / 60), s: total % 60 })
}

function reasoningTitle(props: BaseReasoningProps, seconds: number | null): string {
	if (props.title) return props.title
	if (props.isStreaming) return UI_AI.THINKING
	return seconds === null ? UI_AI.REASONING : formatMessage(UI_AI.THOUGHT_FOR, { time: formatThinkingTime(seconds) })
}

function useThinkingTime(props: BaseReasoningProps) {
	const measured = ref<number | null>(null)
	let startedAt = Date.now()
	watch(
		() => props.isStreaming,
		isStreaming => {
			if (isStreaming) startedAt = Date.now()
			else measured.value = (Date.now() - startedAt) / 1000
		},
	)
	return computed(() => props.duration ?? measured.value)
}

function useReasoningOpen(props: BaseReasoningProps, emit: BaseReasoningEmits) {
	const isOpenLocal = ref(Boolean(props.isOpen))
	let isTouched = false
	const setOpen = (value: boolean): void => {
		if (isOpenLocal.value === value) return
		isOpenLocal.value = value
		emit('update:isOpen', value)
	}
	if (props.hasAutoToggle && props.isStreaming) setOpen(true)
	watch(
		() => props.isOpen,
		isOpen => {
			isOpenLocal.value = Boolean(isOpen)
		},
	)
	watch(
		() => props.isStreaming,
		isStreaming => {
			if (!props.hasAutoToggle) return
			if (isStreaming) isTouched = false
			if (isStreaming || !isTouched) setOpen(Boolean(isStreaming))
		},
	)
	const toggle = (): void => {
		isTouched = true
		setOpen(!isOpenLocal.value)
	}
	return { isOpenLocal, toggle }
}

export function useBaseReasoning(props: BaseReasoningProps, emit: BaseReasoningEmits) {
	const seconds = useThinkingTime(props)
	return {
		...useStandardBaseComponent('base-reasoning', props, ['root', 'trigger', 'content']),
		...useReasoningOpen(props, emit),
		contentId: `rise-reasoning-${useId()}`,
		seconds,
		title: computed(() => reasoningTitle(props, seconds.value)),
	}
}
