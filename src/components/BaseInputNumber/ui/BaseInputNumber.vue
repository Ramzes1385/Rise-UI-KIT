<template>
	<!--
		Поле числа по образцу APG Spinbutton: поле — role="spinbutton" с aria-valuenow/min/max, ↑/↓ — шаг,
		PageUp/PageDown — десять шагов, Home/End — границы. Кнопки −/+ вне порядка Tab: с клавиатуры шагают стрелки
	-->
	<BaseInput
		ref="inputRef"
		class="base-input-number"
		:class="[{ 'base-input-number--controls': showControls }, classes.root]"
		:model-value="draft"
		:variant="variant"
		:label="label"
		:placeholder="placeholder"
		:error="error"
		:is-disabled="isControlDisabled"
		:is-readonly="isReadonly"
		:is-required="isRequired"
		:aria-label="ariaLabel"
		:input-attrs="spinbuttonAttrs"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="{ field: classes.field }"
		@update:model-value="handleInput"
		@keydown="handleKeydown"
		@blur="handleBlur"
		@focus="handleFocus">
		<template v-if="showControls" #prefix>
			<button
				type="button"
				class="base-input-number__button"
				:class="classes.button"
				tabindex="-1"
				:aria-label="UI_ARIA.NUMBER_DECREASE"
				:disabled="isControlDisabled || isAtMin"
				@mousedown.prevent
				@click="stepBy(-1)">
				<BaseIcon name="minus" :size-scale="calcIconScale('sm', sizeScale)" />
			</button>
		</template>
		<template v-if="showControls" #postfix>
			<button
				type="button"
				class="base-input-number__button"
				:class="classes.button"
				tabindex="-1"
				:aria-label="UI_ARIA.NUMBER_INCREASE"
				:disabled="isControlDisabled || isAtMax"
				@mousedown.prevent
				@click="stepBy(1)">
				<BaseIcon name="plus" :size-scale="calcIconScale('sm', sizeScale)" />
			</button>
		</template>
	</BaseInput>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { formatNumber } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { useCustomClass } from '@composables/useCustomClass'
import { kitDefaults } from '@composables/useDefaults'
import { useFormDisabled } from '@composables/useFormContext'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, UI_ARIA } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import { clampNumber, parseNumberInput, roundToPrecision, stepPrecision } from '@utils/numberInputUtils'
import '../styles/BaseInputNumber.style.scss'
import type { BaseInputNumberEmits, BaseInputNumberProps } from '../model/BaseInputNumber.types'

const props = withDefaults(defineProps<BaseInputNumberProps>(), kitDefaults('BaseInputNumber', {
	variant: DEFAULT_VARIANT,
	modelValue: null,
	step: 1,
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	hasControls: true,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const emit = defineEmits<BaseInputNumberEmits>()

/** Классы по элементам (customClass): вид, размер и цвет задаёт BaseInput */
const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'button'] })

const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг */
const isControlDisabled = useFormDisabled(() => props.isDisabled)

/** Знаков после запятой: из пропа или по шагу */
const precision = computed(() => props.precision ?? stepPrecision(props.step))

const showControls = computed(() => props.hasControls && !props.isReadonly)

/** Число в формате языка без разделителей разрядов: `1,5` по-русски */
function format(value: number | null): string {
	if (value === null) return ''
	return formatNumber(value, { useGrouping: false, minimumFractionDigits: props.precision, maximumFractionDigits: precision.value })
}

/** Текст в поле: пока пользователь печатает — его текст, иначе — значение в формате языка */
const draft = ref(format(props.modelValue))
const isEditing = ref(false)

watch(
	() => props.modelValue,
	value => {
		if (!isEditing.value || parseNumberInput(draft.value) !== value) draft.value = format(value)
	},
)

/** Значение, от которого шагают кнопки и стрелки: набранное число, иначе v-model, иначе min или 0 */
function currentValue(): number {
	const typed = parseNumberInput(draft.value)
	if (typeof typed === 'number') return typed
	return props.modelValue ?? props.min ?? 0
}

const isAtMin = computed(() => props.min !== undefined && props.modelValue !== null && props.modelValue <= props.min)
const isAtMax = computed(() => props.max !== undefined && props.modelValue !== null && props.modelValue >= props.max)

/** Последнее подтверждённое значение: `change` приходит, только если итог отличается от него */
let committedValue = props.modelValue

/** Записать значение: округлить, ограничить, обновить v-model и текст */
function commit(value: number | null): void {
	const next = value === null ? null : clampNumber(roundToPrecision(value, precision.value), props.min, props.max)
	draft.value = format(next)
	if (next !== props.modelValue) emit('update:modelValue', next)
	if (next !== committedValue) emit('change', next)
	committedValue = next
}

/** Шаг кнопкой или клавишей (у отключённого поля и в режиме чтения кнопок и клавиш нет) */
function stepBy(multiplier: number): void {
	commit(currentValue() + props.step * multiplier)
}

/** Ввод: допустимое число в границах сразу уходит в v-model, остальное ждёт выхода из поля */
function handleInput(text: string | number): void {
	draft.value = String(text)
	const value = parseNumberInput(draft.value)
	if (value === undefined) return
	if (value !== null && clampNumber(value, props.min, props.max) !== value) return
	if (value !== props.modelValue) emit('update:modelValue', value)
}

const STEP_KEYS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }

function handleKeydown(event: KeyboardEvent): void {
	if (props.isReadonly) return
	if (event.key in STEP_KEYS) {
		event.preventDefault()
		stepBy(STEP_KEYS[event.key])
	} else if (event.key === 'Home' && props.min !== undefined) {
		event.preventDefault()
		commit(props.min)
	} else if (event.key === 'End' && props.max !== undefined) {
		event.preventDefault()
		commit(props.max)
	} else if (event.key === 'Enter') {
		commitDraft()
	}
}

/** Выход из поля или Enter: набранное число округляется и ограничивается, нечисло возвращает прежнее значение */
function commitDraft(): void {
	const value = parseNumberInput(draft.value)
	commit(value === undefined ? props.modelValue : value)
}

function handleBlur(event: FocusEvent): void {
	isEditing.value = false
	if (!props.isReadonly) commitDraft()
	emit('blur', event)
}

function handleFocus(event: FocusEvent): void {
	isEditing.value = true
	committedValue = props.modelValue
	emit('focus', event)
}

/** Семантика spinbutton на нативном поле; атрибуты приложения — первыми */
const spinbuttonAttrs = computed(() => ({
	...props.inputAttrs,
	role: 'spinbutton',
	inputmode: precision.value > 0 || (props.min ?? -1) < 0 ? 'decimal' : 'numeric',
	autocomplete: 'off',
	'aria-valuenow': props.modelValue ?? undefined,
	'aria-valuemin': props.min,
	'aria-valuemax': props.max,
	'aria-valuetext': props.modelValue !== null && props.formatValueText ? props.formatValueText(props.modelValue) : undefined,
}))

defineExpose({
	focus: () => inputRef.value?.focus(),
	blur: () => inputRef.value?.blur(),
	validate: () => inputRef.value?.validate() ?? true,
	reset: () => inputRef.value?.reset(),
})
</script>
