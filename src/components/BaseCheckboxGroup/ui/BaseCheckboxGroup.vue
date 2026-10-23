<template>
	<div
		:class="[ui('root'), variantClass, classes.root, { 'base-checkbox-group--error': control.hasError.value }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="group"
		:aria-labelledby="labelledBy"
		:aria-describedby="control.aria.value['aria-describedby']">
		<FormFieldLabel
			v-if="label"
			:id="labelId"
			tag="span"
			:label="label"
			:is-required="isRequired"
			:class-name="ui('label')"
			:custom-class="classes.label"
			:required-class-name="ui('required')"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<div :class="[ui('options'), { 'base-checkbox-group__options--vertical': isVertical }, classes.options]">
			<BaseCheckbox
				v-if="hasSelectAll"
				:class="ui('select-all')"
				:variant="variant"
				:label="selectAllLabel ?? UI_TEXT.SELECT_ALL_OPTIONS"
				:model-value="isAllChecked"
				:is-indeterminate="isPartlyChecked"
				:is-disabled="isControlDisabled || enabledValues.length === 0"
				:size-scale="sizeScale"
				:custom-class="{ root: classes.checkbox }"
				@update:model-value="handleSelectAll" />
			<BaseCheckbox
				v-for="option in options"
				:key="option.value"
				:class="ui('checkbox')"
				:variant="variant"
				:label="option.label"
				:model-value="checkedSet.has(option.value)"
				:is-disabled="isControlDisabled || option.isDisabled"
				:size-scale="sizeScale"
				:custom-class="{ root: classes.checkbox }"
				@update:model-value="handleToggle(option.value, $event)" />
		</div>

		<FormFieldError
			:id="errorId"
			:error="error ?? ''"
			:class-name="ui('error')"
			:custom-class="classes.error"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseCheckboxGroup.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseCheckboxGroup } from '../model/useBaseCheckboxGroup'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCheckboxGroupEmits, BaseCheckboxGroupProps } from '../types/BaseCheckboxGroup.types'

const props = withDefaults(
	defineProps<BaseCheckboxGroupProps>(),
	kitDefaults('BaseCheckboxGroup', {
		variant: DEFAULT_VARIANT,
		modelValue: () => [],
		isRequired: false,
		isDisabled: false,
		isVertical: false,
		hasSelectAll: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCheckboxGroupEmits>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	labelId,
	errorId,
	isControlDisabled,
	control,
	labelledBy,
	checkedSet,
	enabledValues,
	isAllChecked,
	isPartlyChecked,
	handleToggle,
	handleSelectAll,
} = useBaseCheckboxGroup(props, emit)
</script>
