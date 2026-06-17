<template>
	<button
		class="base-button"
		:class="[
			variantClass,
			classes.root,
			{
				'base-button--loading': props.isLoading,
				'base-button--disabled': props.isDisabled || props.isLoading,
			},
		]"
		:style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]"
		:type="props.type"
		:disabled="props.isDisabled || props.isLoading"
		@click="handleClick">
		<span v-if="props.isLoading" class="base-button__loader"></span>
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
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { usePadding } from '@composables/usePadding'

import '../styles/BaseButton.style.scss'

import type { BaseButtonEmits, BaseButtonProps, BaseButtonSlots } from '../model/BaseButton.types'

const props = withDefaults(defineProps<BaseButtonProps>(), {
	type: 'button',
	padding: 10,
	isLoading: false,
	isDisabled: false,
	sizeScale: 100,
})

const emit = defineEmits<BaseButtonEmits>()

defineSlots<BaseButtonSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-button', props)
const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--btn-pad', defaultPadding: 10 })

function handleClick(e: MouseEvent): void {
	if (!props.isDisabled && !props.isLoading) {
		emit('click', e)
	}
}
</script>
