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
			:size-scale="sizeScale"
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

const props = defineProps<BaseChipProps>()

const placement = computed(() => props.placement ?? 'top-right')
const isHiddenOnZero = computed(() => props.isHiddenOnZero ?? false)
const hasOverflow = computed(() => props.hasOverflow ?? false)
const maxValue = computed(() => props.maxValue ?? 99)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-chip',
	getVariant: () => props.variant,
	getSizeScale: () => sizeScale.value,
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
	if (isHiddenOnZero.value && numericValue.value === 0) return false
	return true
})

const displayContent = computed((): string => {
	if (numericValue.value !== null && hasOverflow.value && numericValue.value > maxValue.value) {
		return `${maxValue.value}+`
	}
	return String(props.content)
})

function handleBadgeClick(): void {
	emit('click-badge')
}
</script>
