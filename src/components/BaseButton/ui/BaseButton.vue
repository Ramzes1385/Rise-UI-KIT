<template>
	<button
		ref="buttonRef"
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
		:disabled="isDisabled"
		:aria-disabled="isLoading ? 'true' : undefined"
		:aria-busy="isLoading ? 'true' : undefined"
		@click="handleClick">
		<span v-if="isLoading" class="base-button__loader" aria-hidden="true"></span>
		<span class="base-button__content">
			<span v-if="$slots.left" class="base-button__slot-left">
				<slot name="left" />
			</span>
			<span v-if="$slots.default" class="base-button__label">
				<slot />
			</span>
			<span v-if="$slots.right" class="base-button__slot-right">
				<slot name="right" />
			</span>
		</span>
	</button>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseButton } from '../model/useBaseButton'
import '../styles/BaseButton.style.scss'
import type { BaseButtonEmits, BaseButtonProps, BaseButtonSlots } from '../types/BaseButton.types'

const props = withDefaults(
	defineProps<BaseButtonProps>(),
	kitDefaults('BaseButton', {
		variant: DEFAULT_VARIANT,
		type: 'button',
		padding: undefined,
		isLoading: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseButtonEmits>()

defineSlots<BaseButtonSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, buttonRef, paddingStyle, handleClick, exposed } =
	useBaseButton(props, emit)

defineExpose(exposed)
</script>
