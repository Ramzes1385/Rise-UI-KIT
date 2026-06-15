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
import { useBaseComponent } from '@composables/useBaseComponent'
import { computed } from 'vue'
import '../styles/BaseFormField.style.scss'
import type { BaseFormFieldProps } from '../model/BaseFormField.types'

const props = defineProps<BaseFormFieldProps>()

const isRequired = computed(() => props.isRequired ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-form-field',
	getVariant: () => props.variant,
	getSizeScale: () => sizeScale.value,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'header', 'label', 'required', 'content', 'description', 'animation', 'error'],
})
</script>
