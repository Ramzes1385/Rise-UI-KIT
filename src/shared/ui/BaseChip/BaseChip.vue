<template>
	<div class="base-chip" :class="[variantClass]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<slot />
		<BaseText
			v-if="isVisible"
			tag="span"
			class="base-chip__badge"
			:class="[`base-chip__badge--${placement}`]"
			:size-scale="sizeScale"
			@click="handleBadgeClick">
			{{ displayContent }}
		</BaseText>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseText } from '@/shared/ui/BaseText'
import { computed } from 'vue'
import './BaseChip.style.scss'
import type { BaseChipEmits, BaseChipProps } from './BaseChip.types'

const props = withDefaults(defineProps<BaseChipProps>(), {
	placement: 'top-right',
	variant: 'default',
	isHiddenOnZero: true,
	hasOverflow: false,
	maxValue: 99,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-chip', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseChipEmits>()

/** Видимость индикатора */
const isVisible = computed((): boolean => {
	if (props.content === undefined) return false
	if (props.isHiddenOnZero && props.content === 0) return false
	return true
})

/** Отображаемое содержимое индикатора */
const displayContent = computed((): string => {
	if (typeof props.content === 'string') return props.content
	if (typeof props.content === 'number' && props.content > props.maxValue) {
		return `${props.maxValue}+`
	}
	return String(props.content)
})

/** Клик по индикатору */
function handleBadgeClick(): void {
	emit('click-badge')
}
</script>
