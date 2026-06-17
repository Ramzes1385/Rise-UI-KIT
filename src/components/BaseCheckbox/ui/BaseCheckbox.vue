<template>
	<div
		class="base-checkbox"
		:class="[
			variantClass,
			{
				'base-checkbox--disabled': props.isDisabled,
				'base-checkbox--error': formField.error,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label class="base-checkbox__label-wrapper" :class="classes.labelWrapper">
			<div class="base-checkbox__wrapper" :class="classes.wrapper">
				<input
					type="checkbox"
					class="base-checkbox__input"
					:class="classes.input"
				:checked="props.modelValue"
				:disabled="props.isDisabled"
					@change="handleChange" />
				<div class="base-checkbox__box" :class="classes.box">
					<BaseIcon
						v-if="props.modelValue"
						name="check"
						:size-scale="calcIconScale('xs', props.sizeScale)"
						class="base-checkbox__icon"
						:custom-class="classes.icon" />
				</div>
			</div>
			<FormFieldLabel
				v-if="label"
				tag="span"
				:label="label"
				class-name="base-checkbox__label"
				:custom-class="classes.label"
				:size-scale="props.sizeScale" />
		</label>
		<slot name="error">
			<FormFieldError
				:error="formField.error"
				class-name="base-checkbox__error-text"
				:custom-class="classes.errorText"
				:size-scale="props.sizeScale" />
		</slot>
	</div>
</template>

<script setup lang="ts">
import type { BaseCheckboxEmits, BaseCheckboxProps } from '../model/BaseCheckbox.types'

import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import { toHTMLInputElement } from '@utils/domUtils'

import '../styles/BaseCheckbox.style.scss'
import { SIZE_SCALE_DEFAULT } from '@constants'

const props = withDefaults(defineProps<BaseCheckboxProps>(), {
	modelValue: false,
	isDisabled: false,
	error: '',
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseCheckboxEmits>()

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-checkbox', props, ['root', 'labelWrapper', 'wrapper', 'input', 'box', 'icon', 'label', 'errorText'])

function handleChange(e: Event): void {
	const target = toHTMLInputElement(e.target)
	if (!target) return
	emit('update:modelValue', target.checked)
	emit('change', target.checked)
}

defineExpose({
	validate: formField.validate,
	reset: formField.reset,
})
</script>
