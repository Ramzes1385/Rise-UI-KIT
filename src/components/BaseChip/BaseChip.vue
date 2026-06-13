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
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed } from 'vue'
import './BaseChip.style.scss'
import type { BaseChipEmits, BaseChipProps } from './BaseChip.types'

const props = defineProps<BaseChipProps>()

const placement = computed(() => props.placement ?? 'top-right')
const variant = computed(() => props.variant ?? 'default')
const isHiddenOnZero = computed(() => props.isHiddenOnZero ?? false)
const hasOverflow = computed(() => props.hasOverflow ?? false)
const maxValue = computed(() => props.maxValue ?? 99)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-chip', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'badge'],
})

const emit = defineEmits<BaseChipEmits>()

/** Числовое значение content (парсит строки-числа; нечисловые строки и undefined → null) */
const numericValue = computed((): number | null => {
	if (typeof props.content === 'number') return props.content
	const parsed = Number(props.content)
	return Number.isNaN(parsed) ? null : parsed
})

/** Видимость индикатора */
const isVisible = computed((): boolean => {
	if (props.content === undefined || props.content === '') return false
	if (isHiddenOnZero.value && numericValue.value === 0) return false
	return true
})

/** Отображаемое содержимое индикатора */
const displayContent = computed((): string => {
	if (numericValue.value !== null && hasOverflow.value && numericValue.value > maxValue.value) {
		return `${maxValue.value}+`
	}
	return String(props.content)
})

/** Клик по индикатору */
function handleBadgeClick(): void {
	emit('click-badge')
}
</script>
