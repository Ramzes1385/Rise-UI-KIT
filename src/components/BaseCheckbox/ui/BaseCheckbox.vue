<template>
	<div
		ref="rootRef"
		class="base-checkbox"
		:class="[
			variantClass,
			{
				'base-checkbox--disabled': isDisabled,
				'base-checkbox--error': formField.error,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label class="base-checkbox__label-wrapper" :class="classes.labelWrapper">
			<span class="base-checkbox__wrapper" :class="classes.wrapper">
				<input
					type="checkbox"
					class="base-checkbox__input"
					:class="classes.input"
					:checked="modelValue"
					:indeterminate="isIndeterminate"
					:disabled="isDisabled"
					:aria-invalid="formField.error ? 'true' : undefined"
					:aria-describedby="formField.error ? errorId : undefined"
					@change="handleChange" />
				<span class="base-checkbox__box" :class="classes.box" aria-hidden="true">
					<BaseIcon
						v-if="modelValue || isIndeterminate"
						:name="isIndeterminate ? 'minus' : 'check'"
						:size-scale="calcIconScale('sm', sizeScale)"
						class="base-checkbox__icon"
						:custom-class="classes.icon" />
				</span>
			</span>
			<FormFieldLabel
				v-if="label"
				tag="span"
				:label="label"
				class-name="base-checkbox__label"
				:custom-class="classes.label"
				:size-scale="sizeScale" />
		</label>
		<div :id="errorId" class="base-checkbox__error">
			<slot name="error">
				<FormFieldError
					:error="formField.error"
					class-name="base-checkbox__error-text"
					:custom-class="classes.errorText"
					:size-scale="sizeScale" />
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseCheckbox.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/media/iconUtils'
import { useBaseCheckbox } from '../model/useBaseCheckbox'
import { kitDefaults } from '@composables/base/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCheckboxEmits, BaseCheckboxProps, BaseCheckboxSlots } from '../types/BaseCheckbox.types'

const props = withDefaults(
	defineProps<BaseCheckboxProps>(),
	kitDefaults('BaseCheckbox', {
		variant: DEFAULT_VARIANT,
		modelValue: false,
		isDisabled: false,
		isIndeterminate: false,
		error: '',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCheckboxEmits>()
defineSlots<BaseCheckboxSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, errorId, formField, rootRef, handleChange, exposed } =
	useBaseCheckbox(props, emit)

defineExpose(exposed)
</script>
