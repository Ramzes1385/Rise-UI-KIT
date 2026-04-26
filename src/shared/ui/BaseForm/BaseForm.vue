<template>
	<form
		class="base-form"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-form--loading': isLoading,
				'base-form--disabled': isDisabled,
			},
			variantClass,
		]"
		@submit.prevent="handleSubmit">
		<!-- Оверлей загрузки -->
		<div v-if="isLoading" class="base-form__overlay">
			<BaseLoader variant="spinner" size="md" :has-label="true" label="Загрузка..." :size-scale="sizeScale" />
		</div>

		<slot />
	</form>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseLoader } from '@/shared/ui/BaseLoader'
import './BaseForm.style.scss'
import type { BaseFormEmits, BaseFormProps } from './BaseForm.types'

const props = withDefaults(defineProps<BaseFormProps>(), {
	isLoading: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-form', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseFormEmits>()

function handleSubmit(e: Event): void {
	if (!props.isLoading && !props.isDisabled) {
		emit('submit', e)
	}
}
</script>
