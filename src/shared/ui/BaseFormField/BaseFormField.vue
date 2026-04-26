<template>
	<div
		class="base-form-field"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-form-field--error': error,
			},
			variantClass,
		]">
		<div v-if="label" class="base-form-field__header">
			<label :for="props.for" class="base-form-field__label">
				{{ label }}
				<span v-if="isRequired" class="base-form-field__required">*</span>
			</label>
		</div>

		<div class="base-form-field__content">
			<slot />
		</div>

		<p v-if="description && !error" class="base-form-field__description">
			{{ description }}
		</p>

		<BaseAnimation name="fade" :size-scale="sizeScale">
			<p v-if="error" class="base-form-field__error">
				{{ error }}
			</p>
		</BaseAnimation>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseAnimation } from '@/shared/ui/BaseAnimation'
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
</script>
