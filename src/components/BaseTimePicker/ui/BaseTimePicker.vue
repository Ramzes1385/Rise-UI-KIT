<template>
	<!--
		Время — BaseAutocomplete: список с шагом `step` и свой ввод. Набранное «930», «9:30», «9.30» становится 09:30
		при выходе из поля или Enter; время вне minTime–maxTime и не время не принимаются
	-->
	<BaseAutocomplete
		ref="autocompleteRef"
		class="base-time-picker"
		:model-value="modelValue"
		:options="options"
		:filter="filterTime"
		:normalize="normalizeTime"
		:is-custom-allowed="true"
		:variant="variant"
		:label="label"
		:placeholder="placeholder ?? UI_TEXT.TIME_PLACEHOLDER"
		:error="error"
		:is-disabled="isDisabled"
		:is-readonly="isReadonly"
		:is-required="isRequired"
		:aria-label="ariaLabel"
		:input-attrs="{ inputmode: 'numeric', ...inputAttrs }"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="{ root: classes.root, field: classes.field, panel: classes.panel, option: classes.option }"
		@update:model-value="emit('update:modelValue', toTime($event))"
		@change="emit('change', toTime($event))"
		@blur="emit('blur', $event)"
		@focus="emit('focus', $event)" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseAutocomplete } from '@components/BaseAutocomplete'
import { useCustomClass } from '@composables/useCustomClass'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, UI_TEXT } from '@constants'
import { buildTimeOptions, parseTimeInput, timePrefixes, timeToMinutes } from '@utils/timeUtils'
import type { BaseTimePickerEmits, BaseTimePickerProps } from '../model/BaseTimePicker.types'
import type { AutocompleteOption } from '@components/BaseAutocomplete'

const props = withDefaults(defineProps<BaseTimePickerProps>(), kitDefaults('BaseTimePicker', {
	variant: DEFAULT_VARIANT,
	modelValue: null,
	step: 30,
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const emit = defineEmits<BaseTimePickerEmits>()

const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'panel', 'option'] })

const autocompleteRef = ref<InstanceType<typeof BaseAutocomplete> | null>(null)

const options = computed((): AutocompleteOption[] => buildTimeOptions(props.step, props.minTime, props.maxTime).map(time => ({ value: time, label: time })))

/** Вариант подходит, если начинается с набранного: «9» — 09:… и 9…, «9:3» — 09:3… */
function filterTime(option: AutocompleteOption, query: string): boolean {
	return timePrefixes(query).some(prefix => option.label.startsWith(prefix))
}

/** Набранное время → `HH:MM` в границах minTime–maxTime; иначе `null` (значение не меняется) */
function normalizeTime(text: string): string | null {
	const time = parseTimeInput(text)
	if (!time) return null
	const minutes = timeToMinutes(time) as number
	const min = props.minTime ? timeToMinutes(props.minTime) : undefined
	const max = props.maxTime ? timeToMinutes(props.maxTime) : undefined
	if ((min !== undefined && minutes < min) || (max !== undefined && minutes > max)) return null
	return time
}

/** Значение автодополнения — строка времени или null */
function toTime(value: string | number | null): string | null {
	return value === null ? null : String(value)
}

defineExpose({
	focus: () => autocompleteRef.value?.focus(),
	blur: () => autocompleteRef.value?.blur(),
	validate: () => autocompleteRef.value?.validate() ?? true,
	reset: () => autocompleteRef.value?.reset(),
})
</script>
