<template>
	<!-- Группа радиокнопок: имя — из заголовка (label) или из aria-label на компоненте, ошибка описывает группу -->
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

		<div
			class="base-radio__options"
			:class="[{ 'base-radio__options--vertical': isVertical }, classes.options]">
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
				<!-- Нативный radio и индикатор вне слота: кастомная подпись не должна отнимать выбор, клавиатуру и роль radio -->
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
import { ref, useId } from 'vue'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useFormField } from '@composables/useFormField'
import '../styles/BaseRadio.style.scss'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@constants'
import type { BaseRadioEmits, BaseRadioProps, BaseRadioSlots } from '../model/BaseRadio.types'

const props = withDefaults(defineProps<BaseRadioProps>(), kitDefaults('BaseRadio', {
	variant: DEFAULT_VARIANT,
	isVertical: false,
	isRequired: false,
	error: '',
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-radio', props, ['root', 'label', 'options', 'radio', 'wrapper', 'input', 'circle', 'dot', 'optionLabel', 'errorText'])

const rootRef = ref<HTMLElement | null>(null)

/** id заголовка и текста ошибки: заголовок — имя группы (aria-labelledby), ошибка — её описание (aria-describedby) */
const groupId = useId()
const labelId = `${groupId}-label`
const errorId = `${groupId}-error`

const emit = defineEmits<BaseRadioEmits>()
defineSlots<BaseRadioSlots>()

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
	rootRef,
	focus: () => rootRef.value?.querySelector('input')?.focus(),
	blur: () => rootRef.value?.querySelector('input')?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
