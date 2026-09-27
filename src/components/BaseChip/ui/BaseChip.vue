<template>
	<div
		class="base-chip"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle]">
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
import { computed } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { SIZE_SCALE_DEFAULT } from '@constants'
import '../styles/BaseChip.style.scss'
import type { BaseChipEmits, BaseChipProps, BaseChipSlots } from '../model/BaseChip.types'

const props = withDefaults(defineProps<BaseChipProps>(), {
	placement: 'top-right',
	isHiddenOnZero: false,
	hasOverflow: false,
	maxValue: 99,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-chip', props, ['root', 'badge'])

const emit = defineEmits<BaseChipEmits>()
defineSlots<BaseChipSlots>()

const numericValue = computed((): number | null => {
	if (typeof props.content === 'number') return props.content
	const parsed = Number(props.content)
	return Number.isNaN(parsed) ? null : parsed
})

const isVisible = computed((): boolean => {
	if (props.content === undefined || props.content === '') return false
	if (props.isHiddenOnZero && numericValue.value === 0) return false
	return true
})

const displayContent = computed((): string => {
	if (numericValue.value !== null && props.hasOverflow && numericValue.value > props.maxValue) {
		return `${props.maxValue}+`
	}
	return String(props.content)
})

function handleBadgeClick(): void {
	emit('click-badge')
}
</script>
