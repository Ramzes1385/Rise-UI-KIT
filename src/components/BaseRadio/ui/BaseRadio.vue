<template>
	<div
		class="base-radio-group"
		:class="[
			{
				'base-radio-group--error': formField.error,
			},
			variantClass,
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseText
			v-if="label"
			tag="span"
			class="base-radio-group__label"
			:size-scale="props.sizeScale"
			:custom-class="classes.label">
			{{ label }}
			<BaseText v-if="props.isRequired" tag="span" class="base-radio-group__required" :size-scale="props.sizeScale">*</BaseText>
		</BaseText>

		<div
			class="base-radio-group__options"
			:class="[{ 'base-radio-group__options--vertical': props.isVertical }, classes.options]">
			<label
				v-for="option in options"
				:key="option.value"
				class="base-radio"
				:class="[
					{
						'base-radio--disabled': option.isDisabled,
						'base-radio--error': formField.error,
					},
					classes.radio,
				]">
				<slot name="option" :option="option" :is-checked="props.modelValue === option.value">
					<div class="base-radio__wrapper" :class="classes.wrapper">
						<input
							type="radio"
							class="base-radio__input"
							:class="classes.input"
							:name="name"
							:value="option.value"
							:checked="props.modelValue === option.value"
							:disabled="option.isDisabled"
							@change="handleChange(option.value)" />
						<div class="base-radio__circle" :class="classes.circle">
							<div v-if="props.modelValue === option.value" class="base-radio__dot" :class="classes.dot"></div>
						</div>
					</div>
					<span class="base-radio__option-label" :class="classes.optionLabel">{{ option.label }}</span>
				</slot>
			</label>
		</div>

		<BaseText
			v-if="formField.error"
			tag="span"
			class="base-radio-group__error-text"
			:size-scale="props.sizeScale"
			:custom-class="classes.errorText">
			{{ formField.error }}
		</BaseText>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import '../styles/BaseRadio.style.scss'
import type { BaseRadioEmits, BaseRadioProps } from '../model/BaseRadio.types'

const props = withDefaults(defineProps<BaseRadioProps>(), {
	isVertical: false,
	isRequired: false,
	error: '',
	sizeScale: 100,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-radio-group', props, ['root', 'label', 'options', 'radio', 'wrapper', 'input', 'circle', 'dot', 'optionLabel', 'errorText'])

const emit = defineEmits<BaseRadioEmits>()

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

function handleChange(value: string | number): void {
	emit('update:modelValue', value)
	emit('change', value)
}

defineExpose({
	validate: formField.validate,
	reset: formField.reset,
})
</script>
