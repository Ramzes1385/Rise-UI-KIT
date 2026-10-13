<template>
	<div :class="[ui('root'), variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle]">
		<slot />
		<Transition name="base-chip__badge">
			<BaseBadge
				v-if="isVisible"
				is-round
				:label="displayContent"
				:variant="variant"
				:color="color"
				:size-scale="sizeScale"
				:class="[ui('badge'), `base-chip__badge--${placement}`, { 'base-chip__badge--clickable': isClickable }, classes.badge]"
				:aria-label="badgeLabel"
				v-on="badgeListeners" />
		</Transition>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseChip.style.scss'
import { BaseBadge } from '@components/BaseBadge'
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

const { ui, sizeScaleStyle, variantClass, variantStyle, classes, isVisible, displayContent, isClickable, badgeLabel, badgeListeners } =
	useBaseChip(props, emit)
</script>
