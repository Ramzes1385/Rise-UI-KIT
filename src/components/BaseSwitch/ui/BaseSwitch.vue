<template>
	<div
		ref="rootRef"
		class="base-switch"
		:class="[
			classes.root,
			variantClass,
			{
				'base-switch--error': formField.error,
				'base-switch--disabled': isDisabled,
				'base-switch--reverse': reverse,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label class="base-switch__row" :class="classes.row" :for="inputId">
			<span class="base-switch__wrapper" :class="classes.wrapper">
				<!-- role="switch" допустим на checkbox (ARIA in HTML); состояние aria-checked браузер берёт из нативного checked,
					поэтому явный aria-checked не дублируем — он мог бы разойтись с checked.
					Нативный input лежит поверх трека: он получает клик, фокус и клавиатуру, трек только рисует состояние -->
				<input
					:id="inputId"
					type="checkbox"
					role="switch"
					class="base-switch__input"
					:class="classes.input"
					:checked="modelValue"
					:disabled="isDisabled"
					:aria-required="isRequired ? 'true' : undefined"
					:aria-invalid="formField.error ? 'true' : undefined"
					:aria-describedby="formField.error ? errorId : undefined"
					@change="handleChange" />
				<span class="base-switch__slider" :class="classes.slider" aria-hidden="true">
					<span class="base-switch__handle" :class="classes.handle"></span>
				</span>
			</span>
			<span class="base-switch__content" :class="classes.content">
				<slot name="label">
					<FormFieldLabel
						v-if="label"
						tag="span"
						:label="label"
						class-name="base-switch__label"
						:custom-class="classes.label"
						:size-scale="sizeScale" />
				</slot>
				<BaseText
					v-if="isRequired"
					tag="span"
					class="base-switch__required"
					:custom-class="classes.required"
					:size-scale="sizeScale"
					aria-hidden="true"
					>*</BaseText
				>
				<slot />
			</span>
		</label>
		<!-- Ошибка — текст или разметка слота error — лежит в обёртке с id: переключатель описан ею через aria-describedby
			в обоих случаях. Без ошибки обёртка пуста и скрыта (:empty), лишнего отступа нет -->
		<div :id="errorId" class="base-switch__error">
			<slot name="error">
				<FormFieldError
					:error="formField.error"
					class-name="base-switch__error-text"
					:custom-class="classes.errorText"
					:size-scale="sizeScale" />
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useFormField } from '@composables/useFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@constants'
import { toHTMLInputElement } from '@utils/domUtils'
import '../styles/BaseSwitch.style.scss'
import type { BaseSwitchEmits, BaseSwitchProps, BaseSwitchSlots } from '../model/BaseSwitch.types'

const props = withDefaults(defineProps<BaseSwitchProps>(), kitDefaults('BaseSwitch', {
	variant: DEFAULT_VARIANT,
	modelValue: false,
	isDisabled: false,
	isRequired: false,
	reverse: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

/** id переключателя и обёртки ошибки: подпись связана через for, ошибка (текст error или слот error) — через aria-describedby */
const inputId = useId()
const errorId = `${inputId}-error`
const rootRef = ref<HTMLElement | null>(null)
const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-switch', props, ['root', 'row', 'wrapper', 'input', 'slider', 'handle', 'content', 'label', 'required', 'errorText'])

const emit = defineEmits<BaseSwitchEmits>()
defineSlots<BaseSwitchSlots>()

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

function handleChange(e: Event): void {
	const target = toHTMLInputElement(e.target)
	if (!target) return
	emit('update:modelValue', target.checked)
	emit('change', target.checked)
}

defineExpose({
	rootRef,
	focus: () => rootRef.value?.querySelector('input')?.focus(),
	blur: () => rootRef.value?.querySelector('input')?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
