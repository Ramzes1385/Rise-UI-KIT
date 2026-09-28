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
				>{{ label
				}}<span v-if="isRequired" class="base-form-field__required" :class="classes.required" aria-hidden="true">*</span></label
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
import { kitDefaults } from '@composables/useDefaults'
import { BaseAnimation } from '@components/BaseAnimation'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseFormField } from '../model/useBaseFormField'
import '../styles/BaseFormField.style.scss'
import type { BaseFormFieldProps, BaseFormFieldSlots } from '../types/BaseFormField.types'

const props = withDefaults(
	defineProps<BaseFormFieldProps>(),
	kitDefaults('BaseFormField', {
		variant: DEFAULT_VARIANT,
		isRequired: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
defineSlots<BaseFormFieldSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	rootRef,
	labelId,
	descriptionId,
	errorId,
	error,
	describedBy,
	controlId,
	isGroup,
	exposed,
} = useBaseFormField(props)

defineExpose(exposed)
</script>
