<template>
	<div
		class="base-chip"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<slot />
		<BaseText
			v-if="isVisible"
			tag="span"
			class="base-chip__badge"
			:class="[`base-chip__badge--${placement}`]"
			:custom-class="classes.badge"
			:size-scale="props.sizeScale"
			@click="handleBadgeClick">
			{{ displayContent }}
		</BaseText>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import { computed } from 'vue'
import '../styles/BaseChip.style.scss'
import type { BaseChipEmits, BaseChipProps } from '../model/BaseChip.types'

const props = withDefaults(defineProps<BaseChipProps>(), {
	placement: 'top-right',
	isHiddenOnZero: false,
	hasOverflow: false,
	maxValue: 99,
	sizeScale: 100,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-chip',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'badge'],
})

const emit = defineEmits<BaseChipEmits>()

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
