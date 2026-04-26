<template>
	<button
		class="base-button"
		:class="[
			variantClass,
			{
				'base-button--loading': isLoading,
				'base-button--disabled': isDisabled || isLoading,
			},
		]"
		:style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]"
		:type="type"
		:disabled="isDisabled || isLoading"
		@click="handleClick">
		<span v-if="isLoading" class="base-button__loader"></span>
		<span class="base-button__content">
			<span v-if="$slots.left" class="base-button__slot-left">
				<slot name="left" />
			</span>
			<slot />
			<span v-if="$slots.right" class="base-button__slot-right">
				<slot name="right" />
			</span>
		</span>
	</button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'

import './BaseButton.style.scss'

import type { BaseButtonEmits, BaseButtonProps, BaseButtonSlots } from './BaseButton.types'

const props = withDefaults(defineProps<BaseButtonProps>(), {
	type: 'button',
	variant: 'default',
	padding: 10,
	isLoading: false,
	isDisabled: false,
	sizeScale: 100,
})

const emit = defineEmits<BaseButtonEmits>()

defineSlots<BaseButtonSlots>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({
	block: 'base-button',
	getVariant: () => props.variant,
})
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

/** Стиль padding: Y = значение, X = значение × 2 */
const paddingStyle = computed(() => ({
	'--btn-pad-y': `${props.padding}px`,
	'--btn-pad-x': `${props.padding * 2}px`,
}))

/** Обработка клика */
function handleClick(e: MouseEvent): void {
	if (!props.isDisabled && !props.isLoading) {
		emit('click', e)
	}
}
</script>
