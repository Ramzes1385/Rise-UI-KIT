<template>
	<div
		class="base-switch"
		:class="[
			classes.root,
			variantClass,
			{
				'base-switch--error': error,
				'base-switch--disabled': props.isDisabled,
				'base-switch--reverse': props.reverse,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label class="base-switch__row" :class="classes.row" :for="inputId">
			<span class="base-switch__wrapper" :class="classes.wrapper">
				<input
					:id="inputId"
					type="checkbox"
					class="base-switch__input"
					:class="classes.input"
					:checked="props.modelValue"
					:disabled="props.isDisabled"
					@change="handleChange" />
				<span class="base-switch__slider" :class="classes.slider">
					<span class="base-switch__handle" :class="classes.handle"></span>
				</span>
			</span>
			<span class="base-switch__content" :class="classes.content">
				<slot name="label">
					<BaseText
						v-if="label"
						tag="span"
						class="base-switch__label"
						:custom-class="classes.label"
						:size-scale="props.sizeScale"
						>{{ label }}</BaseText
					>
				</slot>
				<BaseText
					v-if="props.isRequired"
					tag="span"
					class="base-switch__required"
					:custom-class="classes.required"
					:size-scale="props.sizeScale"
					>*</BaseText
				>
				<slot />
			</span>
		</label>
		<slot name="error">
			<BaseText
				v-if="error"
				tag="span"
				class="base-switch__error-text"
				:custom-class="classes.errorText"
				:size-scale="props.sizeScale"
				>{{ error }}</BaseText
			>
		</slot>
	</div>
</template>

<script setup lang="ts">
import type { BaseSwitchEmits, BaseSwitchProps } from '../model/BaseSwitch.types'

import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import { toHTMLInputElement } from '@utils/domUtils'
import { useId } from 'vue'

import '../styles/BaseSwitch.style.scss'

const props = withDefaults(defineProps<BaseSwitchProps>(), {
	modelValue: false,
	isDisabled: false,
	isRequired: false,
	reverse: false,
	sizeScale: 100,
})

const inputId = useId()
const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-switch',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'row', 'wrapper', 'input', 'slider', 'handle', 'content', 'label', 'required', 'errorText'],
})

const emit = defineEmits<BaseSwitchEmits>()

function handleChange(e: Event): void {
	const target = toHTMLInputElement(e.target)
	if (!target) return
	emit('update:modelValue', target.checked)
	emit('change', target.checked)
}
</script>
