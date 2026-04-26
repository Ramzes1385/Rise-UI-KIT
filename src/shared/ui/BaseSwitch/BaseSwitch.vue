<template>
	<div
		class="base-switch"
		:class="[
			variantClass,
			{
				'base-switch--error': error,
				'base-switch--disabled': isDisabled,
				'base-switch--reverse': reverse,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label class="base-switch__row" :for="inputId">
			<span class="base-switch__wrapper">
				<input
					:id="inputId"
					type="checkbox"
					class="base-switch__input"
					:checked="modelValue"
					:disabled="isDisabled"
					@change="handleChange" />
				<span class="base-switch__slider">
					<span class="base-switch__handle"></span>
				</span>
			</span>
			<span class="base-switch__content">
				<slot name="label">
					<BaseText v-if="label" tag="span" class="base-switch__label" :size-scale="sizeScale">{{ label }}</BaseText>
				</slot>
				<BaseText v-if="isRequired" tag="span" class="base-switch__required" :size-scale="sizeScale">*</BaseText>
				<slot />
			</span>
		</label>
		<slot name="error">
			<BaseText v-if="error" tag="span" class="base-switch__error-text" :size-scale="sizeScale">{{ error }}</BaseText>
		</slot>
	</div>
</template>

<script setup lang="ts">
import type { BaseSwitchEmits, BaseSwitchProps } from './BaseSwitch.types'

import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseText } from '@/shared/ui/BaseText'
import { useId } from 'vue'

import './BaseSwitch.style.scss'

const props = withDefaults(defineProps<BaseSwitchProps>(), {
	variant: 'default',
	isDisabled: false,
	isRequired: false,
	reverse: false,
	sizeScale: 100,
})

const inputId = useId()
const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-switch', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseSwitchEmits>()

function handleChange(e: Event): void {
	const target = e.target as HTMLInputElement
	emit('update:modelValue', target.checked)
	emit('change', target.checked)
}
</script>
