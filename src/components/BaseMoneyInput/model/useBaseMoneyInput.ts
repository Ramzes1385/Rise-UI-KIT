import { getLocale } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { computed, ref, shallowRef, watch } from 'vue'
import { MONEY_INPUT_PARTS } from '../types/BaseMoneyInput.types'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useFormDisabled } from '@composables/form/useFormContext'
import { clampNumber, roundToPrecision } from '@utils/form/numberInputUtils'
import type { BaseMoneyInputEmits, BaseMoneyInputProps } from '../types/BaseMoneyInput.types'
import { caretAfter, cleanMoney, countMeaningful, draftText, formatMoney, moneyFormat, parseMoney } from './money/moneyFormat'

function useWrapperUi(props: BaseMoneyInputProps) {
	const ui = useUi(props, 'base-money-input')
	return {
		ui,
		inputUi: computed(() =>
			Object.fromEntries(MONEY_INPUT_PARTS.map(part => [part, ui(part).slice(`base-money-input__${part}`.length).trim()])),
		),
	}
}

export function useBaseMoneyInput(props: BaseMoneyInputProps, emit: BaseMoneyInputEmits) {
	const format = computed(() => moneyFormat(getLocale(), { currency: props.currency ?? 'RUB', min: props.min ?? 0 }))
	const isEditing = ref(false)
	const draft = shallowRef('')
	const value = shallowRef(props.modelValue ?? null)
	watch(
		() => props.modelValue,
		next => {
			value.value = next ?? null
		},
	)
	const update = (next: number | null): void => {
		value.value = next
		emit('update:modelValue', next)
	}
	return {
		...useWrapperUi(props),
		classes: useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field'] }).classes,
		isControlDisabled: useFormDisabled(() => props.isDisabled),
		symbol: computed(() => format.value.symbol),
		isSymbolFirst: computed(() => format.value.isSymbolFirst),
		display: computed(() => (isEditing.value ? draft.value : formatMoney(value.value, format.value))),
		handleFocus(): void {
			draft.value = formatMoney(value.value, format.value)
			isEditing.value = true
		},
		handleInput(event: Event): void {
			const input = event.target as HTMLInputElement
			const count = countMeaningful(input.value.slice(0, input.selectionStart ?? input.value.length), format.value)
			const clean = cleanMoney(input.value, format.value)
			draft.value = draftText(clean, format.value)
			input.value = draft.value
			const caret = caretAfter(draft.value, count, format.value)
			input.setSelectionRange(caret, caret)
			update(parseMoney(clean))
		},
		handleBlur(): void {
			isEditing.value = false
			const typed = parseMoney(cleanMoney(draft.value, format.value))
			if (typed === null) return
			const fixed = roundToPrecision(clampNumber(typed, props.min ?? 0, props.max), format.value.fraction)
			if (fixed !== typed) update(fixed)
		},
	}
}
