<template>
	<div
		class="base-radio-group"
		:class="[
			{
				'base-radio-group--error': error,
			},
			variantClass,
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseText
			v-if="label"
			tag="span"
			class="base-radio-group__label"
			:size-scale="sizeScale"
			:custom-class="classes.label">
			{{ label }}
			<BaseText v-if="isRequired" tag="span" class="base-radio-group__required" :size-scale="sizeScale">*</BaseText>
		</BaseText>

		<div
			class="base-radio-group__options"
			:class="[{ 'base-radio-group__options--vertical': isVertical }, classes.options]">
			<label
				v-for="option in options"
				:key="option.value"
				class="base-radio"
				:class="[
					{
						'base-radio--disabled': option.isDisabled,
						'base-radio--error': error,
					},
					classes.radio,
				]">
				<slot name="option" :option="option" :is-checked="modelValue === option.value">
					<div class="base-radio__wrapper" :class="classes.wrapper">
						<input
							type="radio"
							class="base-radio__input"
							:class="classes.input"
							:name="name"
							:value="option.value"
							:checked="modelValue === option.value"
							:disabled="option.isDisabled"
							@change="handleChange(option.value)" />
						<div class="base-radio__circle" :class="classes.circle">
							<div v-if="modelValue === option.value" class="base-radio__dot" :class="classes.dot"></div>
						</div>
					</div>
					<span class="base-radio__option-label" :class="classes.optionLabel">{{ option.label }}</span>
				</slot>
			</label>
		</div>

		<BaseText
			v-if="error"
			tag="span"
			class="base-radio-group__error-text"
			:size-scale="sizeScale"
			:custom-class="classes.errorText">
			{{ error }}
		</BaseText>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed } from 'vue'
import './BaseRadio.style.scss'
import type { BaseRadioEmits, BaseRadioProps } from './BaseRadio.types'

const props = defineProps<BaseRadioProps>()

const isVertical = computed(() => props.isVertical ?? false)
const isRequired = computed(() => props.isRequired ?? false)
const variant = computed(() => props.variant ?? 'default')
const error = computed(() => props.error ?? '')
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-radio-group', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'label', 'options', 'radio', 'wrapper', 'input', 'circle', 'dot', 'optionLabel', 'errorText'],
})

const emit = defineEmits<BaseRadioEmits>()

function handleChange(value: string | number): void {
	emit('update:modelValue', value)
	emit('change', value)
}
</script>
