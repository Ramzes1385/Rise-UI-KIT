<template>
	<div
		class="base-radio-group"
		:class="[
			{
				'base-radio-group--vertical': isVertical,
			},
			variantClass,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label
			v-for="option in options"
			:key="option.value"
			class="base-radio"
			:class="{
				'base-radio--disabled': option.isDisabled,
				'base-radio--error': hasError,
			}">
			<div class="base-radio__wrapper">
				<input
					type="radio"
					class="base-radio__input"
					:name="name"
					:value="option.value"
					:checked="modelValue === option.value"
					:disabled="option.isDisabled"
					@change="handleChange(option.value)" />
				<div class="base-radio__circle">
					<div v-if="modelValue === option.value" class="base-radio__dot"></div>
				</div>
			</div>
			<span class="base-radio__label">{{ option.label }}</span>
		</label>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import './BaseRadio.style.scss'
import type { BaseRadioEmits, BaseRadioProps } from './BaseRadio.types'

const props = withDefaults(defineProps<BaseRadioProps>(), {
	isVertical: false,
	variant: 'default',
	hasError: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-radio-group', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseRadioEmits>()

function handleChange(value: string | number): void {
	emit('update:modelValue', value)
	emit('change', value)
}
</script>
