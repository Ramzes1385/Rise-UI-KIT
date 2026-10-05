<template>
	<BaseAutocomplete
		ref="autocompleteRef"
		:class="ui('root')"
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
		:ui="autocompleteUi"
		@update:model-value="emit('update:modelValue', toTime($event))"
		@change="emit('change', toTime($event))"
		@blur="emit('blur', $event)"
		@focus="emit('focus', $event)" />
</template>

<script setup lang="ts">
import { UI_TEXT } from '@/locales/messages'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseTimePicker } from '../model/useBaseTimePicker'
import { BaseAutocomplete } from '@components/BaseAutocomplete'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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

const { ui, autocompleteUi, classes, autocompleteRef, options, filterTime, normalizeTime, toTime, exposed } = useBaseTimePicker(props)

defineExpose(exposed)
</script>
