<template>
	<!-- Группа флажков: имя — заголовок (или подпись BaseFormField вокруг), ошибка и описание описывают группу -->
	<div
		class="base-checkbox-group"
		:class="[variantClass, classes.root, { 'base-checkbox-group--error': control.hasError.value }]"
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
			class-name="base-checkbox-group__label"
			:custom-class="classes.label"
			required-class-name="base-checkbox-group__required"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<div class="base-checkbox-group__options" :class="[{ 'base-checkbox-group__options--vertical': isVertical }, classes.options]">
			<BaseCheckbox
				v-if="hasSelectAll"
				class="base-checkbox-group__select-all"
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
				class="base-checkbox-group__checkbox"
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
			class-name="base-checkbox-group__error"
			:custom-class="classes.error"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import { UI_TEXT } from '@/locales/messages'
import { kitDefaults } from '@composables/useDefaults'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseCheckboxGroup } from '../model/useBaseCheckboxGroup'
import '../styles/BaseCheckboxGroup.style.scss'
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
