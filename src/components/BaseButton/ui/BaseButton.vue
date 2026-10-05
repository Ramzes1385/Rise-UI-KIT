<template>
	<button
		ref="buttonRef"
		:class="[
			ui('root'),
			variantClass,
			classes.root,
			{
				'base-button--loading': isLoading,
				'base-button--disabled': isDisabled || isLoading,
			},
		]"
		:style="[paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]"
		:type="type"
		:disabled="isDisabled && !isFocusableWhenDisabled"
		:aria-disabled="isLoading || (isDisabled && isFocusableWhenDisabled) ? 'true' : undefined"
		:aria-busy="isLoading ? 'true' : undefined"
		@click="handleClick">
		<Transition name="base-button__loader">
			<span v-if="isLoading" :class="ui('loader')" aria-hidden="true"></span>
		</Transition>
		<span :class="ui('content')">
			<span v-if="$slots.left" :class="ui('slot-left')">
				<slot name="left" />
			</span>
			<span v-if="$slots.default" :class="ui('label')">
				<slot />
			</span>
			<span v-if="$slots.right" :class="ui('slot-right')">
				<slot name="right" />
			</span>
		</span>
	</button>
</template>

<script setup lang="ts">
import '../styles/BaseButton.style.scss'
import { useBaseButton } from '../model/useBaseButton'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseButtonEmits, BaseButtonProps, BaseButtonSlots } from '../types/BaseButton.types'

const props = withDefaults(
	defineProps<BaseButtonProps>(),
	kitDefaults('BaseButton', {
		variant: DEFAULT_VARIANT,
		type: 'button',
		padding: undefined,
		isLoading: false,
		isDisabled: false,
		isFocusableWhenDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseButtonEmits>()

defineSlots<BaseButtonSlots>()

const { ui, sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, buttonRef, paddingStyle, handleClick, exposed } =
	useBaseButton(props, emit)

defineExpose(exposed)
</script>
