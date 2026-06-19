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
			<BaseLoader variant="spinner" size="md" :has-label="true" :label="UI_TEXT.LOADING" :size-scale="sizeScale" />
		</div>

		<!-- Контент формы -->
		<div class="base-form__content" :class="classes.content">
			<slot />
		</div>
	</form>
</template>

<script setup lang="ts">
import { BaseLoader } from '@components/BaseLoader'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { UI_TEXT, SIZE_SCALE_DEFAULT} from '@constants'
import '../styles/BaseForm.style.scss'
import type { BaseFormEmits, BaseFormProps, BaseFormSlots } from '../model/BaseForm.types'

const props = withDefaults(defineProps<BaseFormProps>(), {
	isLoading: false,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-form', props, ['root', 'overlay', 'content'])

const emit = defineEmits<BaseFormEmits>()
defineSlots<BaseFormSlots>()

function handleSubmit(e: Event): void {
	if (!props.isLoading && !props.isDisabled) {
		emit('submit', e)
	}
}
</script>
