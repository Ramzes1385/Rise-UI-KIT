<template>
	<label
		class="base-checkbox"
		:class="[
			{
				'base-checkbox--disabled': isDisabled,
				'base-checkbox--error': hasError,
			},
			variantClass,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div class="base-checkbox__wrapper">
			<input
				type="checkbox"
				class="base-checkbox__input"
				:checked="modelValue"
				:disabled="isDisabled"
				@change="handleChange" />
			<div class="base-checkbox__box">
				<BaseIcon v-if="modelValue" name="check" size="xs" :size-scale="sizeScale" class="base-checkbox__icon" />
			</div>
		</div>
		<span v-if="label" class="base-checkbox__label">{{ label }}</span>
	</label>
</template>

<script setup lang="ts">
import { useSizeScale } from '@/shared/composables/useSizeScale'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import './BaseCheckbox.style.scss'
import type { BaseCheckboxEmits, BaseCheckboxProps } from './BaseCheckbox.types'

const props = withDefaults(defineProps<BaseCheckboxProps>(), {
	isDisabled: false,
	hasError: false,
	sizeScale: 100,
})

const emit = defineEmits<BaseCheckboxEmits>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })

function handleChange(e: Event): void {
	const target = e.target as HTMLInputElement
	emit('update:modelValue', target.checked)
	emit('change', target.checked)
}
</script>
