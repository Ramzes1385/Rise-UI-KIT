<template>
	<div
		ref="rootRef"
		class="base-form-field"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-form-field--error': error,
			},
			variantClass,
			classes.root,
		]">
		<div v-if="label" class="base-form-field__header" :class="classes.header">
			<!-- Звёздочка — только знак: обязательность объявляет aria-required поля -->
			<label :id="labelId" :for="controlId" class="base-form-field__label" :class="classes.label"
				>{{ label }}<span v-if="isRequired" class="base-form-field__required" :class="classes.required" aria-hidden="true">*</span></label
			>
		</div>

		<!-- Контрол кита внутри сообщает свой id (подпись связана с ним через for) и сам берёт описание и ошибку.
			Без контрола и без for содержимое — группа с именем из подписи, описание или ошибка описывают группу -->
		<div
			class="base-form-field__content"
			:class="classes.content"
			:role="isGroup ? 'group' : undefined"
			:aria-labelledby="isGroup ? labelId : undefined"
			:aria-describedby="isGroup ? describedBy : undefined">
			<slot />
		</div>

		<p v-if="description && !error" :id="descriptionId" class="base-form-field__description" :class="classes.description">
			{{ description }}
		</p>

		<!-- Обёртка анимации рендерится только вместе с ошибкой: так появление ошибки плавное, а без ошибки нет пустого элемента -->
		<BaseAnimation v-if="error" name="fade" :size-scale="sizeScale" :custom-class="classes.animation">
			<p :id="errorId" class="base-form-field__error" :class="classes.error">
				{{ error }}
			</p>
		</BaseAnimation>
	</div>
</template>

<script setup lang="ts">
import { computed, provide, ref, shallowRef, useId } from 'vue'
import { BaseAnimation } from '@components/BaseAnimation'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { FORM_FIELD_CONTEXT_KEY, useFormContext } from '@composables/useFormContext'
import { useFormField } from '@composables/useFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@constants'
import '../styles/BaseFormField.style.scss'
import type { BaseFormFieldProps, BaseFormFieldSlots } from '../model/BaseFormField.types'

const props = withDefaults(defineProps<BaseFormFieldProps>(), kitDefaults('BaseFormField', {
	variant: DEFAULT_VARIANT,
	isRequired: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

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
// isRequired — звёздочка и aria-required у контрола кита внутри; пустоту значения проверяет сам контрол (его validate()).
const form = useFormContext()

/** Ошибка поля: из пропа или из проверки BaseForm по схеме (по `name`) */
const formError = computed(() => (props.name ? form?.errors.value[props.name] : undefined))

const formField = useFormField({
	value: () => undefined,
	error: () => props.error || formError.value,
})

const error = computed(() => formField.error)

/** Контрол кита внутри обёртки (первый): как получить id его элемента и можно ли назвать его через `for` */
const control = shallowRef<{ getId: () => string; isLabelable: boolean } | null>(null)

/** С чем связана подпись: `for` из пропа или id подключённого нативного поля */
const controlId = computed(() => props.for ?? (control.value?.isLabelable ? control.value.getId() : undefined))

/** Подпись есть, но связать её не с чем — связываем подпись с содержимым как с группой */
const isGroup = computed(() => Boolean(props.label) && !props.for && !control.value)

/** Что описывает поле: ошибка вытесняет описание так же, как на экране */
const describedBy = computed(() => {
	if (error.value) return errorId
	return props.description ? descriptionId : undefined
})

provide(FORM_FIELD_CONTEXT_KEY, {
	labelId,
	hasLabel: computed(() => Boolean(props.label)),
	describedBy,
	hasError: computed(() => Boolean(error.value)),
	isRequired: computed(() => props.isRequired),
	register: (getId, isLabelable) => {
		if (control.value) return undefined
		const entry = { getId, isLabelable }
		control.value = entry
		return () => {
			if (control.value === entry) control.value = null
		}
	},
})

defineExpose({
	rootRef,
	validate: formField.validate,
	reset: formField.reset,
})
</script>
