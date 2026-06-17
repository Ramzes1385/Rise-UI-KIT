<template>
	<div
		class="base-form-field"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-form-field--error': formField.error,
			},
			variantClass,
			classes.root,
		]">
		<div v-if="label" class="base-form-field__header" :class="classes.header">
			<label :for="props.for" class="base-form-field__label" :class="classes.label">
				{{ label }}
				<span v-if="isRequired" class="base-form-field__required" :class="classes.required">*</span>
			</label>
		</div>

		<div class="base-form-field__content" :class="classes.content">
			<slot />
		</div>

		<p v-if="description && !formField.error" class="base-form-field__description" :class="classes.description">
			{{ description }}
		</p>

		<BaseAnimation name="fade" :size-scale="sizeScale" :custom-class="classes.animation">
			<p v-if="formField.error" class="base-form-field__error" :class="classes.error">
				{{ formField.error }}
			</p>
		</BaseAnimation>
	</div>
</template>

<script setup lang="ts">
import { BaseAnimation } from '@components/BaseAnimation'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import '../styles/BaseFormField.style.scss'
import { SIZE_SCALE_DEFAULT } from '@constants'
import type { BaseFormFieldProps } from '../model/BaseFormField.types'

const props = withDefaults(defineProps<BaseFormFieldProps>(), {
	isRequired: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-form-field', props, ['root', 'header', 'label', 'required', 'content', 'description', 'animation', 'error'])

const formField = useFormField({
	value: () => undefined,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

defineExpose({
	validate: formField.validate,
	reset: formField.reset,
})
</script>
