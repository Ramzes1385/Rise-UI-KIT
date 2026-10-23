<template>
	<div
		ref="rootRef"
		:class="[
			ui('root'),
			{
				'base-radio--error': control.hasError.value,
			},
			variantClass,
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="radiogroup"
		v-bind="groupAttrs">
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

		<div :class="[ui('options'), { 'base-radio__options--vertical': isVertical }, classes.options]">
			<label
				v-for="option in options"
				:key="option.value"
				:class="[
					ui('item'),
					{
						'base-radio-item--disabled': option.isDisabled,
						'base-radio-item--error': control.hasError.value,
					},
					classes.radio,
				]">
				<span :class="[ui('wrapper'), classes.wrapper]">
					<input
						type="radio"
						:class="[ui('input'), classes.input]"
						:name="name"
						:value="option.value"
						:checked="modelValue === option.value"
						:disabled="option.isDisabled"
						@change="handleChange(option.value)" />
					<span :class="[ui('circle'), classes.circle]" aria-hidden="true">
						<Transition name="base-radio-dot">
							<span v-if="modelValue === option.value" :class="[ui('dot'), classes.dot]"></span>
						</Transition>
					</span>
				</span>
				<slot name="option" :option="option" :is-checked="modelValue === option.value">
					<span :class="[ui('option-label'), classes.optionLabel]">{{ option.label }}</span>
				</slot>
			</label>
		</div>

		<FormFieldError
			:id="errorId"
			:error="formField.error"
			:class-name="ui('error-text')"
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
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	labelId,
	errorId,
	formField,
	control,
	groupAttrs,
	handleChange,
	exposed,
} = useBaseRadio(props, emit)

defineExpose(exposed)
</script>
