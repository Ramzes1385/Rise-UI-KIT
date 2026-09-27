<template>
	<div
		ref="rootRef"
		class="base-form-field"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-form-field--error': formField.error,
			},
			variantClass,
			classes.root,
		]">
		<div v-if="label" class="base-form-field__header" :class="classes.header">
			<label :id="labelId" :for="props.for" class="base-form-field__label" :class="classes.label"
				>{{ label }}<span v-if="isRequired" class="base-form-field__required" :class="classes.required">*</span></label
			>
		</div>

		<!-- Без for подпись не связать с полем атрибутом: содержимое становится группой с именем из подписи,
			а описание или ошибка описывают эту группу (aria-describedby) -->
		<div
			class="base-form-field__content"
			:class="classes.content"
			:role="isGroup ? 'group' : undefined"
			:aria-labelledby="isGroup ? labelId : undefined"
			:aria-describedby="isGroup ? describedBy : undefined">
			<slot />
		</div>

		<p v-if="description && !formField.error" :id="descriptionId" class="base-form-field__description" :class="classes.description">
			{{ description }}
		</p>

		<!-- Обёртка анимации рендерится только вместе с ошибкой: так появление ошибки плавное, а без ошибки нет пустого элемента -->
		<BaseAnimation v-if="formField.error" name="fade" :size-scale="sizeScale" :custom-class="classes.animation">
			<p :id="errorId" class="base-form-field__error" :class="classes.error">
				{{ formField.error }}
			</p>
		</BaseAnimation>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { BaseAnimation } from '@components/BaseAnimation'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import { SIZE_SCALE_DEFAULT } from '@constants'
import '../styles/BaseFormField.style.scss'
import type { BaseFormFieldProps, BaseFormFieldSlots } from '../model/BaseFormField.types'

const props = withDefaults(defineProps<BaseFormFieldProps>(), {
	isRequired: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-form-field', props, ['root', 'header', 'label', 'required', 'content', 'description', 'animation', 'error'])
defineSlots<BaseFormFieldSlots>()

const rootRef = ref<HTMLElement | null>(null)

/** id подписи, описания и ошибки: по ним содержимое без `for` получает имя и описание группы */
const fieldId = useId()
const labelId = `${fieldId}-label`
const descriptionId = `${fieldId}-description`
const errorId = `${fieldId}-error`

// Обёртка не владеет значением дочернего контрола, поэтому required здесь не проверяется:
// проверка по «пустому» значению всегда проваливалась бы и показывала ложное «Обязательное поле».
// isRequired влияет только на звёздочку; обязательность валидирует сам контрол (его isRequired/validate()).
const formField = useFormField({
	value: () => undefined,
	error: () => props.error,
})

/** Подпись есть, но `for` не задан — связываем подпись с содержимым как с группой */
const isGroup = computed(() => Boolean(props.label) && !props.for)

/** Что описывает группу: ошибка вытесняет описание так же, как на экране */
const describedBy = computed(() => {
	if (formField.error) return errorId
	return props.description ? descriptionId : undefined
})

defineExpose({
	rootRef,
	validate: formField.validate,
	reset: formField.reset,
})
</script>
