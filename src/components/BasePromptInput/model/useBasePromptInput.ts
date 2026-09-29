import type { Ref } from 'vue'
import { UI_AI } from '@/locales/messages'
import { useFieldControl } from '@composables/form/useFormContext'
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BasePromptInputEmits, BasePromptInputProps } from '../types/BasePromptInput.types'

const IME_KEY_CODE = 229

export function isSubmitKey(event: KeyboardEvent): boolean {
	return event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== IME_KEY_CODE
}

function fitHeight(control: HTMLTextAreaElement | null): void {
	if (control) {
		control.style.height = 'auto'
		control.style.height = `${control.scrollHeight}px`
	}
}

function usePromptControl(props: BasePromptInputProps) {
	const ownId = useId()
	const errorId = `${ownId}-error`
	const hintId = `${ownId}-hint`
	const control = useFieldControl({
		describedBy: () => [props.error ? errorId : '', hintId].filter(Boolean).join(' '),
		hasError: () => Boolean(props.error),
	})
	const isLabelled = (): boolean => Boolean(props.label || control.fieldLabelId.value)
	return {
		errorId,
		hintId,
		controlId: control.id,
		controlAttrs: computed(() => ({ ...control.aria.value, 'aria-label': isLabelled() ? undefined : UI_AI.PROMPT_LABEL })),
	}
}

function usePromptText(props: BasePromptInputProps, emit: BasePromptInputEmits, controlRef: Ref<HTMLTextAreaElement | null>) {
	const text = ref(props.modelValue ?? '')
	watch(
		() => props.modelValue,
		value => {
			text.value = value ?? ''
		},
	)
	watch(text, () => nextTick(() => fitHeight(controlRef.value)))
	onMounted(() => fitHeight(controlRef.value))
	const setText = (value: string): void => {
		text.value = value
		emit('update:modelValue', value)
	}
	const canSubmit = computed(() => !props.isDisabled && !props.isGenerating && text.value.trim().length > 0)
	return { text, setText, canSubmit }
}

export function useBasePromptInput(props: BasePromptInputProps, emit: BasePromptInputEmits) {
	const controlRef = ref<HTMLTextAreaElement | null>(null)
	const { text, setText, canSubmit } = usePromptText(props, emit, controlRef)
	const submit = (): void => {
		if (!canSubmit.value) return
		emit('submit', text.value)
		setText('')
		controlRef.value?.focus()
	}
	return {
		...useStandardBaseComponent('base-prompt-input', props, ['root', 'label', 'box', 'control', 'toolbar', 'error']),
		...usePromptControl(props),
		controlRef,
		text,
		canSubmit,
		rowsStyle: computed(() => ({ '--prompt-max-rows': String(props.maxRows) })),
		submit,
		stop: (): void => emit('stop'),
		handleInput: (event: Event): void => setText((event.target as HTMLTextAreaElement).value),
		handleKeydown(event: KeyboardEvent): void {
			if (!isSubmitKey(event)) return
			event.preventDefault()
			submit()
		},
	}
}
