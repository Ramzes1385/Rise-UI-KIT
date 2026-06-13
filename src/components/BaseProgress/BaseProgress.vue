<template>
	<div
		class="base-progress"
		:class="[
			`base-progress--${shape}`,
			animation !== 'none' ? `base-progress--${animation}` : '',
			{ 'base-progress--indeterminate': isIndeterminate },
			classes.root,
		]"
		:style="[sizeScaleStyle, customColorStyle]"
		role="progressbar"
		:aria-valuenow="percent"
		aria-valuemin="0"
		aria-valuemax="100">
		<!-- Линейный прогресс -->
		<template v-if="shape === 'line'">
			<div class="base-progress__track" :class="classes.track">
				<div class="base-progress__fill" :class="classes.fill" :style="{ width: `${percent}%` }">
					<div v-if="hasLabel" class="base-progress__tooltip-trigger" :class="classes.tooltipTrigger">
						<BaseTooltip
							:text="`${percent}%`"
							position="top"
							:is-always-visible="true"
							:size-scale="sizeScale"
							:color="tooltipColor">
							<span class="base-progress__tooltip-anchor" :class="classes.tooltipAnchor" />
						</BaseTooltip>
					</div>
				</div>
			</div>
		</template>

		<!-- Круговой прогресс -->
		<template v-if="shape === 'circle'">
			<svg class="base-progress__svg" :class="classes.svg" viewBox="0 0 120 120">
				<circle
					class="base-progress__track-circle"
					:class="classes.trackCircle"
					cx="60"
					cy="60"
					r="52"
					fill="none"
					stroke-width="8" />
				<circle
					class="base-progress__fill-circle"
					:class="classes.fillCircle"
					cx="60"
					cy="60"
					r="52"
					fill="none"
					stroke-width="8"
					:stroke-dasharray="circumference"
					:stroke-dashoffset="circleOffset"
					stroke-linecap="round" />
			</svg>
			<BaseText
				v-if="hasLabel"
				tag="span"
				class="base-progress__circle-label"
				:weight="700"
				:custom-class="classes.circleLabel">
				<slot :value="value" :percent="percent">{{ percent }}%</slot>
			</BaseText>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { BaseProgressEmits, BaseProgressProps } from './BaseProgress.types'

import './BaseProgress.style.scss'

import { BaseText } from '@components/BaseText'
import { BaseTooltip } from '@components/BaseTooltip'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { computed, watch } from 'vue'

const props = defineProps<BaseProgressProps>()

const max = computed(() => props.max ?? 100)
const shape = computed(() => props.shape ?? 'line')
const animation = computed(() => props.animation ?? 'none')
const hasLabel = computed(() => props.hasLabel ?? false)
const isIndeterminate = computed(() => props.isIndeterminate ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const emit = defineEmits<BaseProgressEmits>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
		'root',
		'track',
		'fill',
		'tooltipTrigger',
		'tooltipAnchor',
		'svg',
		'trackCircle',
		'fillCircle',
		'circleLabel',
	],
})

/** Цвет тултипа соответствует цвету заливки */
const tooltipColor = computed(() => {
	if (props.color?.bg?.base) return { bg: { base: props.color.bg.base } }
	return { bg: { base: 'var(--color-accent)' } }
})

/** Процент заполненности */
const percent = computed((): number => {
	if (isIndeterminate.value) return 0
	const clamped = Math.min(Math.max(props.value, 0), max.value)
	return Math.round((clamped / max.value) * 100)
})

/** Длина окружности для кругового прогресса */
const circumference = computed((): number => {
	return 2 * Math.PI * 52
})

/** Смещение для кругового прогресса */
const circleOffset = computed((): number => {
	if (isIndeterminate.value) return circumference.value
	return circumference.value * (1 - percent.value / 100)
})

watch(percent, val => {
	if (val >= 100) emit('complete')
})
</script>
