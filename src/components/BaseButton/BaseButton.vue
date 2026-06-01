<template>
	<button
		class="base-button"
		:class="[
			variantClass,
			classes.root,
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
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { usePadding } from '@composables/usePadding'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'

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
const { classes } = useCustomClass({ getClass: () => props.customClass })
const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--btn-pad', defaultPadding: 10 })

/** Обработка клика */
function handleClick(e: MouseEvent): void {
	if (!props.isDisabled && !props.isLoading) {
		emit('click', e)
	}
}
</script>
