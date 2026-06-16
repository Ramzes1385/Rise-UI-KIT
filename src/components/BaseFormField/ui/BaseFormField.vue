<template>
	<div
		class="base-form-field"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-form-field--error': error,
			},
			variantClass,
			classes.root,
		]">
		<div v-if="label" class="base-form-field__header" :class="classes.header">
			<label :for="props.for" class="base-form-field__label" :class="classes.label">
				{{ label }}
				<span v-if="props.isRequired" class="base-form-field__required" :class="classes.required">*</span>
			</label>
		</div>

		<div class="base-form-field__content" :class="classes.content">
			<slot />
		</div>

		<p v-if="description && !error" class="base-form-field__description" :class="classes.description">
			{{ description }}
		</p>

		<BaseAnimation name="fade" :size-scale="props.sizeScale" :custom-class="classes.animation">
			<p v-if="error" class="base-form-field__error" :class="classes.error">
				{{ error }}
			</p>
		</BaseAnimation>
	</div>
</template>

<script setup lang="ts">
import { BaseAnimation } from '@components/BaseAnimation'
import { useBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseFormField.style.scss'
import type { BaseFormFieldProps } from '../model/BaseFormField.types'

const props = withDefaults(defineProps<BaseFormFieldProps>(), {
	isRequired: false,
	sizeScale: 100,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-form-field',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'header', 'label', 'required', 'content', 'description', 'animation', 'error'],
})
</script>
