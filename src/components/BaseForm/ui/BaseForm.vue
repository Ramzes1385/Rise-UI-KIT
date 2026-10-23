<template>
	<form
		ref="formRef"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			ui('root'),
			{
				'base-form--loading': isLoading,
				'base-form--disabled': isDisabled,
			},
			variantClass,
			classes.root,
		]"
		:aria-busy="isLoading || undefined"
		@submit.prevent="handleSubmit">
		<div :class="[ui('overlay'), { 'base-form__overlay--visible': isLoading }, classes.overlay]">
			<BaseLoader variant="spinner" :has-label="true" :label="UI_TEXT.LOADING" :size-scale="sizeScale" />
		</div>

		<div :class="[ui('content'), classes.content]">
			<fieldset :class="ui('fieldset')" :disabled="isLocked" role="presentation">
				<slot />
			</fieldset>
		</div>
	</form>
</template>

<script setup lang="ts">
import '../styles/BaseForm.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { useBaseForm } from '../model/useBaseForm'
import { BaseLoader } from '@components/BaseLoader'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFormEmits, BaseFormExpose, BaseFormProps, BaseFormSlots } from '../types/BaseForm.types'

const props = withDefaults(
	defineProps<BaseFormProps>(),
	kitDefaults('BaseForm', {
		variant: DEFAULT_VARIANT,
		isLoading: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseFormEmits>()
defineSlots<BaseFormSlots>()

const { ui, sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, formRef, isLocked, handleSubmit, exposed } = useBaseForm(
	props,
	emit,
)

defineExpose<BaseFormExpose>(exposed)
</script>
