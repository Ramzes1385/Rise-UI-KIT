<template>
	<form
		ref="formRef"
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
		:aria-busy="isLoading || undefined"
		@submit.prevent="handleSubmit">
		<!-- Оверлей загрузки: вне загрузки скрыт через visibility — лоадер со статусом «Загрузка» не виден и скринридеру -->
		<div class="base-form__overlay" :class="[{ 'base-form__overlay--visible': isLoading }, classes.overlay]">
			<BaseLoader variant="spinner" :has-label="true" :label="UI_TEXT.LOADING" :size-scale="sizeScale" />
		</div>

		<div class="base-form__content" :class="classes.content">
			<!-- fieldset[disabled] отключает все нативные контролы: pointer-events блокирует только мышь, но не клавиатуру.
				role="presentation" — обёртка чисто поведенческая, скринридеру не нужна лишняя группа -->
			<fieldset class="base-form__fieldset" :disabled="isLocked" role="presentation">
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
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
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

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, formRef, isLocked, handleSubmit, exposed } = useBaseForm(
	props,
	emit,
)

defineExpose<BaseFormExpose>(exposed)
</script>
