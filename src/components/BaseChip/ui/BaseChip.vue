<template>
	<div class="base-chip" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle]">
		<slot />
		<span
			v-if="isVisible"
			class="base-chip__badge"
			:class="[`base-chip__badge--${placement}`, { 'base-chip__badge--clickable': isClickable }, classes.badge]"
			:style="customColorStyle"
			v-bind="clickableAttributes"
			:aria-label="badgeLabel"
			@click="handleBadgeClick"
			@keydown="handleKeydown">
			{{ displayContent }}
		</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseChip.style.scss'
import { useBaseChip } from '../model/useBaseChip'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseChipEmits, BaseChipProps, BaseChipSlots } from '../types/BaseChip.types'

const props = withDefaults(
	defineProps<BaseChipProps>(),
	kitDefaults('BaseChip', {
		variant: DEFAULT_VARIANT,
		placement: 'top-right',
		isHiddenOnZero: false,
		hasOverflow: false,
		maxValue: 99,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseChipEmits>()
defineSlots<BaseChipSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isVisible,
	displayContent,
	isClickable,
	clickableAttributes,
	badgeLabel,
	handleBadgeClick,
	handleKeydown,
} = useBaseChip(props, emit)
</script>
