<template>
	<div
		class="base-checkbox"
		:class="[
			variantClass,
			{
				'base-checkbox--disabled': isDisabled,
				'base-checkbox--error': error,
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
					:checked="modelValue"
					:disabled="isDisabled"
					@change="handleChange" />
				<div class="base-checkbox__box" :class="classes.box">
					<BaseIcon
						v-if="modelValue"
						name="check"
						:size-scale="calcIconScale('xs', sizeScale)"
						class="base-checkbox__icon"
						:custom-class="classes.icon" />
				</div>
			</div>
			<BaseText
				v-if="label"
				tag="span"
				class="base-checkbox__label"
				:size-scale="sizeScale"
				:custom-class="classes.label"
				>{{ label }}</BaseText
			>
		</label>
		<slot name="error">
			<BaseText
				v-if="error"
				tag="span"
				class="base-checkbox__error-text"
				:size-scale="sizeScale"
				:custom-class="classes.errorText"
				>{{ error }}</BaseText
			>
		</slot>
	</div>
</template>

<script setup lang="ts">
import type { BaseCheckboxEmits, BaseCheckboxProps } from '../model/BaseCheckbox.types'

import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import { computed } from 'vue'

import '../styles/BaseCheckbox.style.scss'

const props = defineProps<BaseCheckboxProps>()

const emit = defineEmits<BaseCheckboxEmits>()

const modelValue = computed(() => props.modelValue ?? false)
const isDisabled = computed(() => props.isDisabled ?? false)
const error = computed(() => props.error ?? '')
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-checkbox',
	getVariant: () => props.variant,
	getSizeScale: () => sizeScale.value,
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
