import type { Ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useMotion } from '@composables/app/useMotion'
import { isImeKeydown } from '@utils/dom/keyboardUtils'
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useFieldControl } from '@composables/form/useFormContext'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { filterMentionOptions, findMentionQuery, insertMention } from './mentionText'
import type { BaseMentionEmits, BaseMentionProps, MentionOption, MentionQuery } from '../types/BaseMention.types'

function useMentionControl(props: BaseMentionProps) {
	const errorId = `${useId()}-error`
	const control = useFieldControl({
		describedBy: () => (props.error ? errorId : undefined),
		hasError: () => Boolean(props.error),
	})
	return { errorId, controlId: control.id, controlAria: control.aria }
}

function useMentionState(props: BaseMentionProps, emit: BaseMentionEmits) {
	const mention = ref<MentionQuery | null>(null)
	const activeIndex = ref(0)
	let dismissedStart: number | null = null
	const update = (found: MentionQuery | null): void => {
		if (!found || found.start === dismissedStart) {
			mention.value = null
			if (!found) dismissedStart = null
			return
		}
		const isNew = found.query !== mention.value?.query || found.start !== mention.value?.start
		mention.value = found
		if (!isNew) return
		activeIndex.value = 0
		emit('search', found.query)
	}
	const dismiss = (): void => {
		dismissedStart = mention.value?.start ?? null
		mention.value = null
	}
	const close = (): void => {
		mention.value = null
	}
	return { mention, activeIndex, update, dismiss, close }
}

function useMentionText(props: BaseMentionProps, emit: BaseMentionEmits, controlRef: Ref<HTMLTextAreaElement | null>) {
	const text = ref(props.modelValue ?? '')
	watch(
		() => props.modelValue,
		value => {
			text.value = value ?? ''
		},
	)
	const setText = (value: string, caret?: number): void => {
		text.value = value
		emit('update:modelValue', value)
		if (caret === undefined) return
		nextTick(() => {
			controlRef.value?.focus()
			controlRef.value?.setSelectionRange(caret, caret)
		})
	}
	return { text, setText }
}

function listKeyAction(key: string): 'next' | 'previous' | 'select' | 'dismiss' | null {
	if (key === 'ArrowDown') return 'next'
	if (key === 'ArrowUp') return 'previous'
	if (key === 'Enter' || key === 'Tab') return 'select'
	return key === 'Escape' ? 'dismiss' : null
}

function useMentionActions(
	props: BaseMentionProps,
	emit: BaseMentionEmits,
	context: ReturnType<typeof useMentionText> & { state: ReturnType<typeof useMentionState> },
) {
	const { state, text, setText } = context
	const suggestions = computed(() =>
		state.mention.value ? filterMentionOptions(props.options ?? [], state.mention.value.query, props.maxSuggestions ?? 8) : [],
	)
	const select = (option: MentionOption): void => {
		const result = insertMention(text.value, state.mention.value as MentionQuery, `${props.trigger}${option.value}`)
		state.close()
		setText(result.text, result.caret)
		emit('mention', option)
	}
	const moveActive = (step: number): void => {
		const count = suggestions.value.length
		state.activeIndex.value = (state.activeIndex.value + step + count) % count
	}
	const actions = {
		next: () => moveActive(1),
		previous: () => moveActive(-1),
		select: () => select(suggestions.value[state.activeIndex.value]),
		dismiss: state.dismiss,
	}
	return {
		suggestions,
		select,
		handleKeydown(event: KeyboardEvent): void {
			const action = listKeyAction(event.key)
			const needsItems = action !== 'dismiss' && suggestions.value.length === 0
			if (!action || !state.mention.value || needsItems || isImeKeydown(event)) return
			event.preventDefault()
			actions[action]()
		},
	}
}

export function useBaseMention(props: BaseMentionProps, emit: BaseMentionEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const controlRef = ref<HTMLTextAreaElement | null>(null)
	const textState = useMentionText(props, emit, controlRef)
	const state = useMentionState(props, emit)
	const listId = `rise-mention-${useId()}`
	const detect = (): void => {
		const control = controlRef.value as HTMLTextAreaElement
		state.update(findMentionQuery(textState.text.value, control.selectionStart, props.trigger ?? '@'))
	}
	return {
		...useStandardBaseComponent('base-mention', props, ['root', 'label', 'control', 'list', 'error']),
		...useMentionControl(props),
		...useMentionActions(props, emit, { ...textState, state }),
		ui: useUi(props, 'base-mention'),
		rootRef,
		isMotionReduced: useMotion(rootRef).isReduced,
		controlRef,
		text: textState.text,
		listId,
		activeIndex: state.activeIndex,
		isOpen: computed(() => state.mention.value !== null),
		optionId: (index: number): string => `${listId}-${index}`,
		detect,
		close: state.close,
		handleInput(event: Event): void {
			textState.setText((event.target as HTMLTextAreaElement).value)
			detect()
		},
	}
}
