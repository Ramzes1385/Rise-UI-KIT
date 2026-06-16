<template>
	<form
		class="base-form"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-form--loading': props.isLoading,
				'base-form--disabled': props.isDisabled,
			},
			variantClass,
			classes.root,
		]"
		@submit.prevent="handleSubmit">
		<!-- Оверлей загрузки -->
		<div class="base-form__overlay" :class="[{ 'base-form__overlay--visible': props.isLoading }, classes.overlay]">
			<BaseLoader variant="spinner" size="md" :has-label="true" :label="UI_LOADING_TEXT" :size-scale="props.sizeScale" />
		</div>

		<!-- Контент формы -->
		<div class="base-form__content" :class="classes.content">
			<slot />
		</div>
	</form>
</template>

<script setup lang="ts">
import { BaseLoader } from '@components/BaseLoader'
import { useBaseComponent } from '@composables/useBaseComponent'
import { UI_LOADING_TEXT } from '@constants'
import '../styles/BaseForm.style.scss'
import type { BaseFormEmits, BaseFormProps } from '../model/BaseForm.types'

const props = withDefaults(defineProps<BaseFormProps>(), {
	isLoading: false,
	isDisabled: false,
	sizeScale: 100,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-form',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
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
