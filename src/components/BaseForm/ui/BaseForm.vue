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
import { useBaseComponent } from '@composables/useBaseComponent'
import { computed } from 'vue'
import '../styles/BaseForm.style.scss'
import type { BaseFormEmits, BaseFormProps } from '../model/BaseForm.types'

const props = defineProps<BaseFormProps>()

const isLoading = computed(() => props.isLoading ?? false)
const isDisabled = computed(() => props.isDisabled ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-form',
	getVariant: () => props.variant,
	getSizeScale: () => sizeScale.value,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'overlay', 'content'],
})

const emit = defineEmits<BaseFormEmits>()

function handleSubmit(e: Event): void {
	if (!isLoading.value && !isDisabled.value) {
		emit('submit', e)
	}
}
</script>
