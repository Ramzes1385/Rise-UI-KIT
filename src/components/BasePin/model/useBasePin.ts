import type { Ref } from 'vue'
import { formatMessage } from '@/locales'
import { computed, ref, useId } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { toHTMLInputElement } from '@utils/domUtils'
import { useFormField } from '@composables/useFormField'
import type { BasePinEmits, PinProps } from '../types/BasePin.types'
import { useStandardBaseComponent } from '@composables/useBaseComponent'

function normalizeValue(value: string, length: number): string[] {
	return Array.from({ length }, (_, index) => value[index] || ' ')
}

function useCellInput(props: PinProps, emit: BasePinEmits, inputRefs: Ref<HTMLInputElement[]>) {
	return {
		handleInput(e: Event, index: number): void {
			const target = toHTMLInputElement(e.target)
			if (!target) return
			const val = target.value.slice(-1)
			const chars = normalizeValue(props.modelValue, props.length)
			chars[index] = val || ' '
			const result = chars.join('').trimEnd()
			emit('update:modelValue', result)
			if (val && index < props.length - 1) inputRefs.value[index + 1]?.focus()
			if (result.length === props.length && !result.includes(' ')) emit('complete', result)
		},
		handlePaste(e: ClipboardEvent): void {
			e.preventDefault()
			const data = e.clipboardData?.getData('text') || ''
			const val = data.replace(/\s/g, '').slice(0, props.length)
			emit('update:modelValue', val)
			if (val.length === props.length) emit('complete', val)
		},
	}
}

function useCellKeys(props: PinProps, emit: BasePinEmits, inputRefs: Ref<HTMLInputElement[]>) {
	const focusCell = (index: number): void => inputRefs.value[index]?.focus()
	const erase = (index: number): void => {
		const chars = normalizeValue(props.modelValue, props.length)
		if (chars[index] !== ' ') {
			chars[index] = ' '
			emit('update:modelValue', chars.join('').trimEnd())
		} else if (index > 0) {
			chars[index - 1] = ' '
			emit('update:modelValue', chars.join('').trimEnd())
			focusCell(index - 1)
		}
	}

	return {
		handleKeyDown(e: KeyboardEvent, index: number): void {
			if (e.key === 'Backspace') {
				e.preventDefault()
				erase(index)
			}
			if (e.key === 'ArrowLeft' && index > 0) {
				e.preventDefault()
				focusCell(index - 1)
			}
			if (e.key === 'ArrowRight' && index < props.length - 1) {
				e.preventDefault()
				focusCell(index + 1)
			}
		},
	}
}

export function useBasePin(props: PinProps, emit: BasePinEmits) {
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error })
	const errorId = `${useId()}-error`
	const standard = useStandardBaseComponent('base-pin', props, ['root', 'cells', 'input', 'errorText'])
	const inputRefs = ref<HTMLInputElement[]>([])
	const rootRef = ref<HTMLElement | null>(null)

	return {
		...standard,
		formField,
		hasError: computed(() => Boolean(formField.error)),
		errorId,
		inputRefs,
		rootRef,
		cellLabel: (position: number): string => formatMessage(UI_ARIA.PIN_CELL, { position, length: props.length }),
		cells: computed(() => normalizeValue(props.modelValue, props.length).map(char => (char === ' ' ? '' : char))),
		...useCellInput(props, emit, inputRefs),
		...useCellKeys(props, emit, inputRefs),
		exposed: {
			rootRef,
			focus: () => rootRef.value?.querySelector('input')?.focus(),
			blur: () => rootRef.value?.querySelector('input')?.blur(),
			validate: formField.validate,
			reset: formField.reset,
		},
	}
}
