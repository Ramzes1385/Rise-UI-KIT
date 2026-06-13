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
import { computed } from 'vue'

import './BaseButton.style.scss'

import type { BaseButtonEmits, BaseButtonProps, BaseButtonSlots } from './BaseButton.types'

const props = defineProps<BaseButtonProps>()

const emit = defineEmits<BaseButtonEmits>()

defineSlots<BaseButtonSlots>()

const type = computed(() => props.type ?? 'button')
const variant = computed(() => props.variant ?? 'default')
const padding = computed(() => props.padding ?? 10)
const isLoading = computed(() => props.isLoading ?? false)
const isDisabled = computed(() => props.isDisabled ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({
	block: 'base-button',
	getVariant: () => variant.value,
})
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({ getClass: () => props.customClass })
const { paddingStyle } = usePadding({ getPadding: () => padding.value, prefix: '--btn-pad', defaultPadding: 10 })

/** Обработка клика */
function handleClick(e: MouseEvent): void {
	if (!isDisabled.value && !isLoading.value) {
		emit('click', e)
	}
}
</script>
