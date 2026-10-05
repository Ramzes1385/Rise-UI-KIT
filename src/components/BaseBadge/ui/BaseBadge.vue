<template>
	<span
		:class="[ui('root'), variantClass, { 'base-badge--clickable': isClickable, 'base-badge--disabled': isDisabled }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		v-bind="clickableAttributes"
		@click="handleClick"
		@keydown="handleKeydown">
		<slot>
			<Transition name="base-badge-text">
				<span :key="label" :class="[ui('text'), classes.text]">{{ label }}</span>
			</Transition>
		</slot>
	</span>
</template>

<script setup lang="ts">
import '../styles/BaseBadge.style.scss'
import { useBaseBadge } from '../model/useBaseBadge'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseBadgeEmits, BaseBadgeProps, BaseBadgeSlots } from '../types/BaseBadge.types'

const props = withDefaults(
	defineProps<BaseBadgeProps>(),
	kitDefaults('BaseBadge', {
		variant: DEFAULT_VARIANT,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseBadgeEmits>()
defineSlots<BaseBadgeSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isClickable,
	clickableAttributes,
	handleClick,
	handleKeydown,
} = useBaseBadge(props, emit)
</script>
