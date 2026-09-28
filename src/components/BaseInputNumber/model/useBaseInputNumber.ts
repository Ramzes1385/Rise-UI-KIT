/** Composable: логика BaseInputNumber — текст поля, шаги кнопками и клавишами, атрибуты spinbutton */
import { computed, ref, watch } from 'vue'
import { formatNumber } from '@/locales/state'
import { useCustomClass } from '@composables/useCustomClass'
import { useFormDisabled } from '@composables/useFormContext'
import { clampNumber, parseNumberInput, roundToPrecision, stepPrecision } from '@utils/numberInputUtils'
import type { Ref } from 'vue'
import type { BaseInput } from '@components/BaseInput'
import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseInputNumberEmits, BaseInputNumberProps } from './BaseInputNumber.types'

/** Пропсы BaseInputNumber после значений по умолчанию */
export type InputNumberProps = PropsWithDefaults<BaseInputNumberProps, 'modelValue' | 'step' | 'isDisabled' | 'isReadonly' | 'hasControls'>

/** Текст поля и его формат */
interface NumberDraft {
	/** Текст в поле: пока пользователь печатает — его текст, иначе — значение в формате языка */
	draft: Ref<string>
	/** Знаков после запятой: из пропа или по шагу */
	precision: Readonly<Ref<number>>
	/** Число в формате языка без разделителей разрядов: `1,5` по-русски */
	format: (value: number | null) => string
}

/** Запись значения: округление, границы, v-model и `change` */
interface NumberCommit {
	commit: (value: number | null) => void
	/** Набранный текст: число округляется и ограничивается, нечисло возвращает прежнее значение */
	commitDraft: () => void
	/** Шаг кнопкой или клавишей */
	stepBy: (multiplier: number) => void
	/** Фокус в поле: `change` сравнивается со значением на входе */
	rememberCommitted: () => void
}

/** Клавиши шага: стрелки — один шаг, PageUp/PageDown — десять */
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
	/** Последнее подтверждённое значение: `change` приходит, только если итог отличается от него */
	let committedValue = props.modelValue

	function commit(value: number | null): void {
		const next = value === null ? null : clampNumber(roundToPrecision(value, text.precision.value), props.min, props.max)
		text.draft.value = text.format(next)
		if (next !== props.modelValue) emit('update:modelValue', next)
		if (next !== committedValue) emit('change', next)
		committedValue = next
	}

	/** Значение, от которого шагают кнопки и стрелки: набранное число, иначе v-model, иначе min или 0 */
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
	/** Действие клавиши: шаг или граница по Home/End; `undefined` — клавиша не наша */
	function stepFor(key: string): (() => void) | undefined {
		const { min, max } = props
		if (key in STEP_KEYS) return () => actions.stepBy(STEP_KEYS[key])
		if (key === 'Home' && min !== undefined) return () => actions.commit(min)
		if (key === 'End' && max !== undefined) return () => actions.commit(max)
		return undefined
	}

	return event => {
		if (props.isReadonly) return
		const step = stepFor(event.key)
		if (step) {
			event.preventDefault()
			step()
		} else if (event.key === 'Enter') {
			actions.commitDraft()
		}
	}
}

/** Семантика spinbutton на нативном поле; атрибуты приложения — первыми */
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

/**
 * Поле числа по образцу APG Spinbutton: текст поля, шаги кнопками и клавишами, подтверждение по Enter и выходу из поля.
 */
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

	/** Ввод: допустимое число в границах сразу уходит в v-model, остальное ждёт выхода из поля */
	function handleInput(input: string | number): void {
		text.draft.value = String(input)
		const value = parseNumberInput(text.draft.value)
		if (value === undefined || (value !== null && clampNumber(value, props.min, props.max) !== value)) return
		if (value !== props.modelValue) emit('update:modelValue', value)
	}

	return {
		inputRef,
		/** Методы для ref компонента: всё делает поле BaseInput */
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
