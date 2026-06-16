<template>
	<div
		class="base-checkbox"
		:class="[
			variantClass,
			{
				'base-checkbox--disabled': props.isDisabled,
				'base-checkbox--error': props.error,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label class="base-checkbox__label-wrapper" :class="classes.labelWrapper">
			<div class="base-checkbox__wrapper" :class="classes.wrapper">
				<input
					type="checkbox"
					class="base-checkbox__input"
					:class="classes.input"
				:checked="props.modelValue"
				:disabled="props.isDisabled"
					@change="handleChange" />
				<div class="base-checkbox__box" :class="classes.box">
					<BaseIcon
						v-if="props.modelValue"
						name="check"
						:size-scale="calcIconScale('xs', props.sizeScale)"
						class="base-checkbox__icon"
						:custom-class="classes.icon" />
				</div>
			</div>
			<BaseText
				v-if="label"
				tag="span"
				class="base-checkbox__label"
				:size-scale="props.sizeScale"
				:custom-class="classes.label"
				>{{ label }}</BaseText
			>
		</label>
		<slot name="error">
			<BaseText
				v-if="props.error"
				tag="span"
				class="base-checkbox__error-text"
				:size-scale="props.sizeScale"
				:custom-class="classes.errorText"
				>{{ props.error }}</BaseText
			>
		</slot>
	</div>
</template>

<script setup lang="ts">
import type { BaseCheckboxEmits, BaseCheckboxProps } from '../model/BaseCheckbox.types'

import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'

import '../styles/BaseCheckbox.style.scss'

const props = withDefaults(defineProps<BaseCheckboxProps>(), {
	modelValue: false,
	isDisabled: false,
	error: '',
	sizeScale: 100,
})

const emit = defineEmits<BaseCheckboxEmits>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-checkbox',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'labelWrapper', 'wrapper', 'input', 'box', 'icon', 'label', 'errorText'],
})

function handleChange(e: Event): void {
	const target = e.target as HTMLInputElement
	emit('update:modelValue', target.checked)
	emit('change', target.checked)
}
</script>
