<template>
	<div
		class="base-progress base-progress--md"
		:class="[
			`base-progress--${variant}`,
			`base-progress--${shape}`,
			`base-progress--${animation}`,
			{ 'base-progress--indeterminate': isIndeterminate },
		]"
		:style="sizeScaleStyle"
		role="progressbar"
		:aria-valuenow="percent"
		aria-valuemin="0"
		:aria-valuemax="100">
		<!-- Линейный прогресс -->
		<template v-if="shape === 'line'">
			<div class="base-progress__track">
				<div class="base-progress__fill" :style="{ width: `${percent}%` }">
					<span v-if="hasLabel" class="base-progress__tooltip"> {{ percent }}% </span>
				</div>
			</div>
		</template>

		<!-- Круговой прогресс -->
		<template v-if="shape === 'circle'">
			<svg class="base-progress__svg" viewBox="0 0 120 120">
				<circle class="base-progress__track-circle" cx="60" cy="60" r="52" fill="none" stroke-width="8" />
				<circle
					class="base-progress__fill-circle"
					cx="60"
					cy="60"
					r="52"
					fill="none"
					stroke-width="8"
					:stroke-dasharray="circumference"
					:stroke-dashoffset="circleOffset"
					stroke-linecap="round" />
			</svg>
			<span v-if="hasLabel" class="base-progress__circle-label">
				<slot :value="value" :percent="percent"> {{ percent }}% </slot>
			</span>
		</template>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { computed, watch } from 'vue'
import './BaseProgress.style.scss'
import type { BaseProgressEmits, BaseProgressProps } from './BaseProgress.types'

const props = withDefaults(defineProps<BaseProgressProps>(), {
	max: 100,
	variant: 'default',
	shape: 'line',
	animation: 'none',
	hasLabel: false,
	isIndeterminate: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-progress', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseProgressEmits>()

/** Процент заполненности */
const percent = computed((): number => {
	if (props.isIndeterminate) return 0
	const clamped = Math.min(Math.max(props.value, 0), props.max)
	return Math.round((clamped / props.max) * 100)
})

/** Длина окружности для кругового прогресса */
const circumference = computed((): number => {
	return 2 * Math.PI * 52
})

/** Смещение для кругового прогресса */
const circleOffset = computed((): number => {
	if (props.isIndeterminate) return circumference.value
	return circumference.value * (1 - percent.value / 100)
})

watch(percent, val => {
	if (val >= 100) emit('complete')
})
</script>
