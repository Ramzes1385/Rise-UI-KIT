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
				<span v-if="isRequired" class="base-form-field__required" :class="classes.required">*</span>
			</label>
		</div>

		<div class="base-form-field__content" :class="classes.content">
			<slot />
		</div>

		<p v-if="description && !error" class="base-form-field__description" :class="classes.description">
			{{ description }}
		</p>

		<BaseAnimation name="fade" :size-scale="sizeScale" :custom-class="classes.animation">
			<p v-if="error" class="base-form-field__error" :class="classes.error">
				{{ error }}
			</p>
		</BaseAnimation>
	</div>
</template>

<script setup lang="ts">
import { BaseAnimation } from '@components/BaseAnimation'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import './BaseFormField.style.scss'
import type { BaseFormFieldProps } from './BaseFormField.types'

const props = withDefaults(defineProps<BaseFormFieldProps>(), {
	variant: 'default',
	isRequired: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-form-field', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'header', 'label', 'required', 'content', 'description', 'animation', 'error'],
})
</script>
