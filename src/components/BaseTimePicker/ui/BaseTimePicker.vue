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
import { UI_TEXT } from '@/locales/messages'
import { kitDefaults } from '@composables/useDefaults'
import { useBaseTimePicker } from '../model/useBaseTimePicker'
import { BaseAutocomplete } from '@components/BaseAutocomplete'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseTimePickerEmits, BaseTimePickerProps } from '../types/BaseTimePicker.types'

const props = withDefaults(
	defineProps<BaseTimePickerProps>(),
	kitDefaults('BaseTimePicker', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		step: 30,
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseTimePickerEmits>()

const { classes, autocompleteRef, options, filterTime, normalizeTime, toTime, exposed } = useBaseTimePicker(props)

defineExpose(exposed)
</script>
