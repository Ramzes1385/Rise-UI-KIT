<template>
	<div :class="[ui('root'), variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle]">
		<slot />
		<Transition name="base-chip__badge">
			<span
				v-if="isVisible"
				:class="[
					ui('badge'),
					`base-chip__badge--${placement}`,
					bumpClass,
					{ 'base-chip__badge--clickable': isClickable },
					classes.badge,
				]"
				:style="customColorStyle"
				v-bind="clickableAttributes"
				:aria-label="badgeLabel"
				@click="handleBadgeClick"
				@keydown="handleKeydown">
				{{ displayContent }}
			</span>
		</Transition>
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
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isVisible,
	displayContent,
	bumpClass,
	isClickable,
	clickableAttributes,
	badgeLabel,
	handleBadgeClick,
	handleKeydown,
} = useBaseChip(props, emit)
</script>
