<template>
	<div class="base-chip" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle]">
		<slot />
		<!-- Кастомный цвет — только на индикаторе: с корня --custom-* унаследовало бы содержимое слота (кнопка, аватар) -->
		<span
			v-if="isVisible"
			class="base-chip__badge"
			:class="[`base-chip__badge--${placement}`, classes.badge]"
			:style="customColorStyle"
			@click="handleBadgeClick">
			{{ displayContent }}
		</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseChip.style.scss'
import { useBaseChip } from '../model/useBaseChip'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
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

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, isVisible, displayContent, handleBadgeClick } = useBaseChip(
	props,
	emit,
)
</script>
