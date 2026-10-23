import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { formatNumber } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import type { BaseInput } from '@components/BaseInput'
import { isImeKeydown } from '@utils/dom/keyboardUtils'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useFormDisabled } from '@composables/form/useFormContext'
import { INPUT_NUMBER_PARTS } from '../types/BaseInputNumber.types'
import { clampNumber, parseNumberInput, roundToPrecision, stepPrecision } from '@utils/form/numberInputUtils'
import type { BaseInputNumberEmits, InputNumberProps, NumberCommit, NumberDraft } from '../types/BaseInputNumber.types'

const STEP_KEYS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }

function useNumberDraft(props: InputNumberProps): NumberDraft {
	const precision = computed(() => props.precision ?? stepPrecision(props.step))

	function format(value: number | null): string {
		if (value === null) return ''
		return formatNumber(value, { useGrouping: false, minimumFractionDigits: props.precision, maximumFractionDigits: precision.value })
	}

	return { draft: ref(format(props.modelValue)), precision, format }
}

function useNumberCommit(props: InputNumberProps, emit: BaseInputNumberEmits, text: NumberDraft): NumberCommit {
	let committedValue = props.modelValue

	function commit(value: number | null): void {
		const next = value === null ? null : clampNumber(roundToPrecision(value, text.precision.value), props.min, props.max)
		text.draft.value = text.format(next)
		if (next !== props.modelValue) emit('update:modelValue', next)
		if (next !== committedValue) emit('change', next)
		committedValue = next
	}

	function currentValue(): number {
		const typed = parseNumberInput(text.draft.value)
		if (typeof typed === 'number') return typed
		return props.modelValue ?? props.min ?? 0
	}

	return {
		commit,
		commitDraft: () => {
			const value = parseNumberInput(text.draft.value)
			commit(value === undefined ? props.modelValue : value)
		},
		stepBy: multiplier => commit(currentValue() + props.step * multiplier),
		rememberCommitted: () => {
			committedValue = props.modelValue
		},
	}
}

function useNumberKeyboard(props: InputNumberProps, actions: NumberCommit): (event: KeyboardEvent) => void {
	function stepFor(key: string): (() => void) | undefined {
		const { min, max } = props
		if (key in STEP_KEYS) return () => actions.stepBy(STEP_KEYS[key])
		if (key === 'Home' && min !== undefined) return () => actions.commit(min)
		if (key === 'End' && max !== undefined) return () => actions.commit(max)
		return undefined
	}

	return event => {
		if (props.isReadonly || isImeKeydown(event)) return
		const step = stepFor(event.key)
		if (step) {
			event.preventDefault()
			step()
		} else if (event.key === 'Enter') {
			actions.commitDraft()
		}
	}
}

function useSpinbuttonAttrs(props: InputNumberProps, precision: Readonly<Ref<number>>) {
	return computed(() => ({
		...props.inputAttrs,
		role: 'spinbutton',
		inputmode: precision.value > 0 || (props.min ?? -1) < 0 ? 'decimal' : 'numeric',
		autocomplete: 'off',
		'aria-valuenow': props.modelValue ?? undefined,
		'aria-valuemin': props.min,
		'aria-valuemax': props.max,
		'aria-valuetext': props.modelValue !== null && props.formatValueText ? props.formatValueText(props.modelValue) : undefined,
	}))
}

function useInputNumberUi(props: InputNumberProps) {
	const ui = useUi(props, 'base-input-number')
	const ownClasses = (part: (typeof INPUT_NUMBER_PARTS)[number]) => ui(part).slice(`base-input-number__${part}`.length).trim()

	return {
		ui,
		inputUi: computed(() =>
			Object.fromEntries(INPUT_NUMBER_PARTS.filter(part => part !== 'button').map(part => [part, ownClasses(part)])),
		),
	}
}

export function useBaseInputNumber(props: InputNumberProps, emit: BaseInputNumberEmits) {
	const text = useNumberDraft(props)
	const actions = useNumberCommit(props, emit, text)
	const isEditing = ref(false)
	const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)

	watch(
		() => props.modelValue,
		value => {
			if (!isEditing.value || parseNumberInput(text.draft.value) !== value) text.draft.value = text.format(value)
		},
	)

	function handleInput(input: string | number): void {
		text.draft.value = String(input)
		const value = parseNumberInput(text.draft.value)
		if (value === undefined || (value !== null && clampNumber(value, props.min, props.max) !== value)) return
		if (value !== props.modelValue) emit('update:modelValue', value)
	}

	return {
		...useInputNumberUi(props),
		inputRef,
		exposed: {
			focus: () => inputRef.value?.focus(),
			blur: () => inputRef.value?.blur(),
			validate: () => inputRef.value?.validate() ?? true,
			reset: () => inputRef.value?.reset(),
		},
		classes: useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'button'] }).classes,
		isControlDisabled: useFormDisabled(() => props.isDisabled),
		showControls: computed(() => props.hasControls && !props.isReadonly),
		isAtMin: computed(() => props.min !== undefined && props.modelValue !== null && props.modelValue <= props.min),
		isAtMax: computed(() => props.max !== undefined && props.modelValue !== null && props.modelValue >= props.max),
		draft: text.draft,
		spinbuttonAttrs: useSpinbuttonAttrs(props, text.precision),
		stepBy: actions.stepBy,
		handleInput,
		handleKeydown: useNumberKeyboard(props, actions),
		handleFocus: (event: FocusEvent) => {
			isEditing.value = true
			actions.rememberCommitted()
			emit('focus', event)
		},
		handleBlur: (event: FocusEvent) => {
			isEditing.value = false
			if (!props.isReadonly) actions.commitDraft()
			emit('blur', event)
		},
	}
}
