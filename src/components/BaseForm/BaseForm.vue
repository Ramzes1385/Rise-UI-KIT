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
			classes.root,
		]"
		@submit.prevent="handleSubmit">
		<!-- Оверлей загрузки -->
		<div class="base-form__overlay" :class="[{ 'base-form__overlay--visible': isLoading }, classes.overlay]">
			<BaseLoader variant="spinner" size="md" :has-label="true" label="Загрузка..." :size-scale="sizeScale" />
		</div>

		<!-- Контент формы -->
		<div class="base-form__content" :class="classes.content">
			<slot />
		</div>
	</form>
</template>

<script setup lang="ts">
import { BaseLoader } from '@components/BaseLoader'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
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
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'overlay', 'content'],
})

const emit = defineEmits<BaseFormEmits>()

function handleSubmit(e: Event): void {
	if (!props.isLoading && !props.isDisabled) {
		emit('submit', e)
	}
}
</script>
