<template>
	<div
		ref="rootRef"
		class="base-radio"
		:class="[
			{
				'base-radio--error': formField.error,
			},
			variantClass,
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="radiogroup"
		:aria-labelledby="label ? labelId : undefined"
		:aria-required="isRequired ? 'true' : undefined"
		:aria-invalid="formField.error ? 'true' : undefined"
		:aria-describedby="formField.error ? errorId : undefined">
		<FormFieldLabel
			v-if="label"
			:id="labelId"
			tag="span"
			:label="label"
			:is-required="isRequired"
			class-name="base-radio__label"
			:custom-class="classes.label"
			required-class-name="base-radio__required"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<div class="base-radio__options" :class="[{ 'base-radio__options--vertical': isVertical }, classes.options]">
			<label
				v-for="option in options"
				:key="option.value"
				class="base-radio-item"
				:class="[
					{
						'base-radio-item--disabled': option.isDisabled,
						'base-radio-item--error': formField.error,
					},
					classes.radio,
				]">
				<span class="base-radio-item__wrapper" :class="classes.wrapper">
					<input
						type="radio"
						class="base-radio-item__input"
						:class="classes.input"
						:name="name"
						:value="option.value"
						:checked="modelValue === option.value"
						:disabled="option.isDisabled"
						@change="handleChange(option.value)" />
					<span class="base-radio-item__circle" :class="classes.circle" aria-hidden="true">
						<span v-if="modelValue === option.value" class="base-radio-item__dot" :class="classes.dot"></span>
					</span>
				</span>
				<slot name="option" :option="option" :is-checked="modelValue === option.value">
					<span class="base-radio-item__option-label" :class="classes.optionLabel">{{ option.label }}</span>
				</slot>
			</label>
		</div>

		<FormFieldError
			:id="errorId"
			:error="formField.error"
			class-name="base-radio__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseRadio.style.scss'
import { useBaseRadio } from '../model/useBaseRadio'
import { kitDefaults } from '@composables/base/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseRadioEmits, BaseRadioProps, BaseRadioSlots } from '../types/BaseRadio.types'

const props = withDefaults(
	defineProps<BaseRadioProps>(),
	kitDefaults('BaseRadio', {
		variant: DEFAULT_VARIANT,
		isVertical: false,
		isRequired: false,
		error: '',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseRadioEmits>()
defineSlots<BaseRadioSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	labelId,
	errorId,
	formField,
	handleChange,
	exposed,
} = useBaseRadio(props, emit)

defineExpose(exposed)
</script>
