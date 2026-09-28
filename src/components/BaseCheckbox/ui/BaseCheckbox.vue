<template>
	<div
		ref="rootRef"
		class="base-checkbox"
		:class="[
			variantClass,
			{
				'base-checkbox--disabled': isDisabled,
				'base-checkbox--error': formField.error,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label class="base-checkbox__label-wrapper" :class="classes.labelWrapper">
			<span class="base-checkbox__wrapper" :class="classes.wrapper">
				<!-- Нативный checkbox лежит поверх квадрата: он получает клик, фокус и клавиатуру, квадрат только рисует состояние -->
				<input
					type="checkbox"
					class="base-checkbox__input"
					:class="classes.input"
					:checked="modelValue"
					:indeterminate="isIndeterminate"
					:disabled="isDisabled"
					:aria-invalid="formField.error ? 'true' : undefined"
					:aria-describedby="formField.error ? errorId : undefined"
					@change="handleChange" />
				<span class="base-checkbox__box" :class="classes.box" aria-hidden="true">
					<BaseIcon
						v-if="modelValue || isIndeterminate"
						:name="isIndeterminate ? 'minus' : 'check'"
						:size-scale="calcIconScale('sm', sizeScale)"
						class="base-checkbox__icon"
						:custom-class="classes.icon" />
				</span>
			</span>
			<FormFieldLabel
				v-if="label"
				tag="span"
				:label="label"
				class-name="base-checkbox__label"
				:custom-class="classes.label"
				:size-scale="sizeScale" />
		</label>
		<!-- Ошибка — текст или разметка слота error — лежит в обёртке с id: чекбокс описан ею через aria-describedby
			в обоих случаях. Без ошибки обёртка пуста и скрыта (:empty), лишнего отступа нет -->
		<div :id="errorId" class="base-checkbox__error">
			<slot name="error">
				<FormFieldError
					:error="formField.error"
					class-name="base-checkbox__error-text"
					:custom-class="classes.errorText"
					:size-scale="sizeScale" />
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { toHTMLInputElement } from '@utils/domUtils'
import { kitDefaults } from '@composables/useDefaults'
import { useFormField } from '@composables/useFormField'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseCheckbox.style.scss'
import type { BaseCheckboxEmits, BaseCheckboxProps, BaseCheckboxSlots } from '../types/BaseCheckbox.types'

const props = withDefaults(
	defineProps<BaseCheckboxProps>(),
	kitDefaults('BaseCheckbox', {
		variant: DEFAULT_VARIANT,
		modelValue: false,
		isDisabled: false,
		isIndeterminate: false,
		error: '',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCheckboxEmits>()
defineSlots<BaseCheckboxSlots>()

/** id обёртки ошибки: чекбокс связан с ней через aria-describedby (и для текста error, и для слота error) */
const errorId = `${useId()}-error`

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-checkbox', props, [
	'root',
	'labelWrapper',
	'wrapper',
	'input',
	'box',
	'icon',
	'label',
	'errorText',
])

const rootRef = ref<HTMLElement | null>(null)

function handleChange(e: Event): void {
	const target = toHTMLInputElement(e.target)
	if (!target) return
	emit('update:modelValue', target.checked)
	emit('change', target.checked)
	// Клик снимает indeterminate у элемента; вернуть его, если родитель оставил частичный выбор
	target.indeterminate = props.isIndeterminate
}

defineExpose({
	rootRef,
	focus: () => rootRef.value?.querySelector('input')?.focus(),
	blur: () => rootRef.value?.querySelector('input')?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
