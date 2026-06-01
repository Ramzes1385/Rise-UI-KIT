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

const props = withDefaults(defineProps<BaseChipProps>(), {
	placement: 'top-right',
	variant: 'default',
	isHiddenOnZero: false,
	hasOverflow: false,
	maxValue: 99,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-chip', getVariant: () => props.variant })
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
	if (props.isHiddenOnZero && numericValue.value === 0) return false
	return true
})

/** Отображаемое содержимое индикатора */
const displayContent = computed((): string => {
	if (numericValue.value !== null && props.hasOverflow && numericValue.value > props.maxValue) {
		return `${props.maxValue}+`
	}
	return String(props.content)
})

/** Клик по индикатору */
function handleBadgeClick(): void {
	emit('click-badge')
}
</script>
