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
import { useBaseComponent } from '@composables/useBaseComponent'
import { usePadding } from '@composables/usePadding'
import { computed } from 'vue'

import '../styles/BaseButton.style.scss'

import type { BaseButtonEmits, BaseButtonProps, BaseButtonSlots } from '../model/BaseButton.types'

const props = defineProps<BaseButtonProps>()

const emit = defineEmits<BaseButtonEmits>()

defineSlots<BaseButtonSlots>()

const type = computed(() => props.type ?? 'button')
const padding = computed(() => props.padding ?? 10)
const isLoading = computed(() => props.isLoading ?? false)
const isDisabled = computed(() => props.isDisabled ?? false)
const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-button',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale ?? 100,
	getColor: () => props.color,
	getClass: () => props.customClass,
})
const { paddingStyle } = usePadding({ getPadding: () => padding.value, prefix: '--btn-pad', defaultPadding: 10 })

function handleClick(e: MouseEvent): void {
	if (!isDisabled.value && !isLoading.value) {
		emit('click', e)
	}
}
</script>
