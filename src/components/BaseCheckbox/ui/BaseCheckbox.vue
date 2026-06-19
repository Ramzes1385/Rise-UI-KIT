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
			<div class="base-checkbox__wrapper" :class="classes.wrapper">
				<input
					type="checkbox"
					class="base-checkbox__input"
					:class="classes.input"
				:checked="modelValue"
				:disabled="isDisabled"
					@change="handleChange" />
				<div class="base-checkbox__box" :class="classes.box">
					<BaseIcon
						v-if="modelValue"
						name="check"
						:size-scale="calcIconScale('xs', sizeScale)"
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
				:size-scale="sizeScale" />
		</label>
		<slot name="error">
			<FormFieldError
				:error="formField.error"
				class-name="base-checkbox__error-text"
				:custom-class="classes.errorText"
				:size-scale="sizeScale" />
		</slot>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { BaseIcon } from '@components/BaseIcon'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField, type FormFieldExpose } from '@composables/useFormField'
import { SIZE_SCALE_DEFAULT } from '@constants'
import { toHTMLInputElement } from '@utils/domUtils'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseCheckbox.style.scss'
import type { BaseCheckboxEmits, BaseCheckboxProps, BaseCheckboxSlots } from '../model/BaseCheckbox.types'

const props = withDefaults(defineProps<BaseCheckboxProps>(), {
	modelValue: false,
	isDisabled: false,
	error: '',
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseCheckboxEmits>()
defineSlots<BaseCheckboxSlots>()

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-checkbox', props, ['root', 'labelWrapper', 'wrapper', 'input', 'box', 'icon', 'label', 'errorText'])

const rootRef = ref<HTMLElement | null>(null)

function handleChange(e: Event): void {
	const target = toHTMLInputElement(e.target)
	if (!target) return
	emit('update:modelValue', target.checked)
	emit('change', target.checked)
}

defineExpose<FormFieldExpose>({
	rootRef,
	focus: () => rootRef.value?.querySelector('input')?.focus(),
	blur: () => rootRef.value?.querySelector('input')?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
