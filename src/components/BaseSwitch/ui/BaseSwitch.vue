<template>
	<div
		ref="rootRef"
		class="base-switch"
		:class="[
			classes.root,
			variantClass,
			{
				'base-switch--error': formField.error,
				'base-switch--disabled': isDisabled,
				'base-switch--reverse': reverse,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label class="base-switch__row" :class="classes.row" :for="inputId">
			<span class="base-switch__wrapper" :class="classes.wrapper">
				<input
					:id="inputId"
					type="checkbox"
					role="switch"
					class="base-switch__input"
					:class="classes.input"
					:checked="modelValue"
					:disabled="isDisabled"
					:aria-required="isRequired ? 'true' : undefined"
					:aria-invalid="formField.error ? 'true' : undefined"
					:aria-describedby="formField.error ? errorId : undefined"
					@change="handleChange" />
				<span class="base-switch__slider" :class="classes.slider" aria-hidden="true">
					<span class="base-switch__handle" :class="classes.handle"></span>
				</span>
			</span>
			<span class="base-switch__content" :class="classes.content">
				<slot name="label">
					<FormFieldLabel
						v-if="label"
						tag="span"
						:label="label"
						class-name="base-switch__label"
						:custom-class="classes.label"
						:size-scale="sizeScale" />
				</slot>
				<BaseText
					v-if="isRequired"
					tag="span"
					class="base-switch__required"
					:custom-class="classes.required"
					:size-scale="sizeScale"
					aria-hidden="true"
					>*</BaseText
				>
				<slot />
			</span>
		</label>
		<div :id="errorId" class="base-switch__error">
			<slot name="error">
				<FormFieldError
					:error="formField.error"
					class-name="base-switch__error-text"
					:custom-class="classes.errorText"
					:size-scale="sizeScale" />
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSwitch.style.scss'
import { BaseText } from '@components/BaseText'
import { useBaseSwitch } from '../model/useBaseSwitch'
import { kitDefaults } from '@composables/base/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseSwitchEmits, BaseSwitchProps, BaseSwitchSlots } from '../types/BaseSwitch.types'

const props = withDefaults(
	defineProps<BaseSwitchProps>(),
	kitDefaults('BaseSwitch', {
		variant: DEFAULT_VARIANT,
		modelValue: false,
		isDisabled: false,
		isRequired: false,
		reverse: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseSwitchEmits>()
defineSlots<BaseSwitchSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	inputId,
	errorId,
	rootRef,
	formField,
	handleChange,
	exposed,
} = useBaseSwitch(props, emit)

defineExpose(exposed)
</script>
